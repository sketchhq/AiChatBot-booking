import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';
import { logger } from 'src/core/utils/logger';
import { Errors } from 'src/core/constants/error_enums';
import { MailUtils } from 'src/core/utils/mailUtils';
import Encryption from 'src/core/utils/encryption';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { LoginDto } from 'src/modules/auth/dto/login-dto';
import { VerificationToken } from '../users/entities/verification-token.entity';
import { UserLogoutDto } from 'src/modules/auth/dto/login-dto';
import { UserAuthProvider } from '../users/entities/user-auth-provider.entity';
import { SocialLoginDto } from './dto/social-login.dto';
import { SendSignupOtpDto } from './dto/send-signup-otp.dto';
import { VerifySignupOtpDto } from './dto/verify-signup-otp.dto'
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import twilio from 'twilio';
import { BrevoEmailService } from 'src/core/utils/brevo-email.service';

import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { DataSource } from 'typeorm';
import { UserLoginSessionsService } from '../user-login-session/user-login-sessions.service';
import { Inject, forwardRef } from '@nestjs/common';
import { AccountStatus } from '../users/enums/account-status.enum';
import { UserRole } from '../users/enums/user-role.enum';
import { VetApplyDto } from './dto/vet-apply.dto';
import { VerifyVetApplyOtpDto } from './dto/verify-vet-apply-otp.dto';
import { VerificationTokenType } from '../users/entities/verification-token.entity';
import { VerificationStatus } from '../vets/entities/vet.enums';
import { Vet } from '../vets/entities/vet.entity';



const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly userService: UsersService,
    private readonly loginSessionService: UserLoginSessionsService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly brevo: BrevoEmailService,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
    @InjectRepository(VerificationToken)
    private readonly verificationTokenRepository: Repository<VerificationToken>,
    @InjectRepository(UserAuthProvider)
    private readonly userAuthProviderRepo: Repository<UserAuthProvider>,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private blockDeletedUser(user: User) {
    if (user.is_deleted || user.deleted_at) {
      throw new UnauthorizedException(
        'Your account is deleted. You can restore it within 30 days.',
      );
    }
  }




  // ================= SIGNUP (OTP REQUIRED) =================
  async signup(signupData: CreateUserDto): Promise<any> {
    logger.info(`Signup_Entry: Email=${signupData.email}`);

    // Step 1: Email already exists?
    const existingUser = await this.userService.findOneByEmail(signupData.email);
    if (existingUser) {
      logger.warn(`Signup_Failure: Email=${signupData.email} already exists`);
      throw new ConflictException(Errors.EMAIL_ID_ALREADY_EXISTS);
    }

    // Step 2: Check OTP verified (latest used OTP for that email)
    const otpRecord = await this.verificationTokenRepository.findOne({
      where: {
        phone: signupData.phone,
        type: 'signup_phone_otp' as VerificationTokenType,
        used: true,
      },
      order: { created_at: 'DESC' },
    });


    if (!otpRecord) {
      throw new UnauthorizedException('Please verify OTP before signup.');
    }

    try {
      // Step 3: Create new user
      const userData: Partial<User> = {
        first_name: signupData.first_name?.trim() || null,
        last_name: signupData.last_name?.trim() || null,
        email: signupData.email,
        phone: signupData.phone,
        password_hash: Encryption.hashPassword(signupData.password),
        is_active: true,
        is_phone_verified: true, // OTP verified → phone verified
      };

      const newUser = await this.userService.create(userData);

      await this.userProfileRepo.save({
        user: newUser,
        first_name: signupData.first_name,
        last_name: signupData.last_name,
        avatar_url: null,
        dob: null,
        gender: null,
        bio: null,
        preferences: {},
      });


      // Step 4: Generate access/refresh tokens
      const { access_token, refresh_token } = await this.generateTokens({
        user_id: newUser.id,
        email: newUser.email,
      });

      const { password_hash, ...userResponse } = newUser;

      // attach user to otpRecord (optional but useful)
      try {
        otpRecord.user = newUser as any;
        await this.verificationTokenRepository.save(otpRecord);
      } catch (e) {
        // non-fatal; log and continue
        logger.warn('Could not attach user to verification record: ' + e.message);
      }

      return {
        ...userResponse,
        access_token,
        refresh_token,
      };
    } catch (error) {
      logger.error(`Signup_Error: ${error.message}`);
      throw new HttpException('User creation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendSignupOtp(signup: SendSignupOtpDto) {

    const exists = await this.userService.findOneByPhone(signup.phone);
    if (exists) throw new ConflictException("Phone number already exists");

    const twilioResponse = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: signup.phone,
        channel: "sms"
      });

    await this.verificationTokenRepository.save({
      phone: signup.phone,
      token: twilioResponse.sid,
      type: "signup_phone_otp" as VerificationTokenType,
      used: false,
      signup_payload: signup
    });

    return { otp_sent: true };
  }


  async verifySignupOtp(data: VerifySignupOtpDto) {
    const { phone, otp } = data;

    // 1️⃣ Verify OTP with Twilio
    const verify = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (verify.status !== 'approved') {
      throw new UnauthorizedException('Invalid OTP');
    }

    // 2️⃣ START TRANSACTION
    return await this.dataSource.transaction(async (manager) => {

      // 3️⃣ LOCK OTP RECORD
      const record = await manager.findOne(VerificationToken, {
        where: { phone, type: 'signup_phone_otp' as VerificationTokenType, used: false },
        order: { created_at: 'DESC' },
        lock: { mode: 'pessimistic_write' }, // 🔥 IMPORTANT
      });

      if (!record) {
        throw new UnauthorizedException('Signup session expired');
      }

      // 4️⃣ MARK OTP AS USED IMMEDIATELY
      record.used = true;
      await manager.save(record);

      const signup = record.signup_payload;

      // 5️⃣ CHECK USER EXISTENCE AGAIN (SAFE)
      const existingUser = await manager.findOne(User, {
        where: [
          { phone: signup.phone },
          ...(signup.email ? [{ email: signup.email }] : []),
        ],
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // 6️⃣ CREATE USER
      const newUser = manager.create(User, {
        first_name: signup.first_name?.trim() || null,
        last_name: signup.last_name?.trim() || null,
        phone: signup.phone,
        email: signup.email ?? null,
        pet_names: Array.isArray(signup.pet_names)
          ? signup.pet_names
          : signup.pet_name
            ? [signup.pet_name]
            : [],
        password_hash: signup.password
          ? Encryption.hashPassword(signup.password)
          : null,
        preferred_locale: signup.preferred_locale ?? null,
        preferred_timezone: signup.preferred_timezone ?? null,
        metadata: signup.metadata ?? {},
        is_phone_verified: true,
        is_active: signup.is_active ?? true,

        //     role: signup.is_vet ? UserRole.VET : UserRole.CUSTOMER,  // 🔥 ADD
        // account_status: signup.is_vet 
        //   ? AccountStatus.PENDING 
        //   : AccountStatus.ACTIVE,  // 🔥 ADD

        role: UserRole.CUSTOMER,
        account_status: AccountStatus.ACTIVE,


      });

      await manager.save(newUser);


      const safeFirstName = signup.first_name?.trim() || null;
      const safeLastName = signup.last_name?.trim() || null;

      // 7️⃣ CREATE PROFILE
      await manager.save(UserProfile, {
        user: newUser,
        first_name: safeFirstName,
        last_name: safeLastName,
        avatar_url: null,
        gender: null,
        dob: null,
      });

      // 8️⃣ TOKENS
      // const tokens = await this.generateTokens({ sub: newUser.id });
      const tokens = await this.generateTokens({
        user_id: newUser.id,
        role: newUser.role,
        account_status: newUser.account_status,
      });


      return {
        message: 'Signup completed successfully',
        user: newUser,
        ...tokens,
      };
    });
  }




  async checkIdentifier(identifier: string) {
    // Check if identifier is email or phone
    const isEmail = identifier.includes("@");

    let user = null;

    if (isEmail) {
      user = await this.userService.findOneByEmail(identifier);
    } else {
      user = await this.userService.findOneByPhone(identifier);
    }

    // If user NOT found
    if (!user) {
      return {
        exists: false,
        message: "User not found",
      };
    }

    return {
      exists: true,
      identifier_type: isEmail ? "email" : "phone",
      can_login_with_password: !!user.password_hash,
      can_login_with_otp: true,
      message: "Identifier verified successfully",
    };
  }


  // ================= LOGIN =================
  async loginWithEmail({
    identifier,
    password,
    remember_me,
    guest_cart_id,
  }: LoginDto): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    logger.info(`Login_Entry: ${identifier}`);

    const user = await this.userService.findOneByEmailOrPhone(identifier);
    if (!user) {
      logger.warn(`Login_Failure: User not found for email ${identifier}`);
      throw new NotFoundException(Errors.USER_NOT_EXISTS);
    }

    this.blockDeletedUser(user);

    // Block deleted users
    if (user.is_deleted || user.deleted_at) {
      logger.warn(`Login_Failure: Deleted user attempted login: ${identifier}`);
      throw new UnauthorizedException('Your account has been deleted');
    }

    if (!user.password_hash) {
      logger.warn(`Login_Failure: No password found for ${identifier}`);
      throw new UnauthorizedException(Errors.INVALID_USER_DETAILS);
    }

    const isPasswordValid = Encryption.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn(`Login_InvalidPassword: ${identifier}`);
      throw new UnauthorizedException(Errors.INCORRECT_USER_PASSWORD);
    }

    const payload = { user_id: user.id, role: user.role, account_status: user.account_status, };
    const { access_token, refresh_token } = await this.generateTokens(payload, remember_me);

    const { password_hash, ...userResponse } = user;

    return {
      user: userResponse,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  }

  async loginWithPassword(
    dto: LoginDto,
    requestMeta: {
      [x: string]: any; userAgent?: string; ip?: string
    },
  ) {
    console.log(' loginWithPassword CALLED');

    const { identifier, password, remember_me } = dto;

    const user = await this.userService.findOneByEmailOrPhone(identifier);
    if (!user) throw new NotFoundException('User not found');

    this.blockDeletedUser(user);


    if (user.is_deleted || user.deleted_at) {
      throw new UnauthorizedException('Your account has been deleted');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Password login not supported');
    }

    const isValid = Encryption.comparePassword(password, user.password_hash);
    if (!isValid) throw new UnauthorizedException('Incorrect password');

    console.log('🔥 Creating session for user:', user.id);

    //  FIXED SESSION CREATION (NO req )
    await this.loginSessionService.createSession(user.id, {
      userAgent: requestMeta.userAgent,
      ip: requestMeta.ip,
    });


    const guestId = requestMeta.guestId;




    const tokens = await this.generateTokens(
      { user_id: user.id, role: user.role, account_status: user.account_status, },
      remember_me,
    );

    const { password_hash, ...userResponse } = user;

    return {
      user: userResponse,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }




  async sendLoginOtp(identifier: string) {
    const isEmail = identifier.includes('@');

    const user = isEmail
      ? await this.userService.findOneByEmail(identifier)
      : await this.userService.findOneByPhone(identifier);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    this.blockDeletedUser(user);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (isEmail) {
      // ✅ Send Email OTP
      await this.brevo.sendEmail(
        identifier,
        "Your Login OTP",
        `<p>Your login OTP is <strong>${otp}</strong></p>`
      );

      await this.verificationTokenRepository.save({
        email: identifier,
        token: otp,
        type: VerificationTokenType.LOGIN_EMAIL,
        used: false,
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      return { otp_sent: true, via: "email" };
    }

    // ✅ Phone OTP via Twilio
    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: identifier,
        channel: "sms",
      });

    await this.verificationTokenRepository.save({
      phone: identifier,
      token: "twilio", // Twilio handles actual OTP
      type: VerificationTokenType.LOGIN_PHONE,
      used: false,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    return { otp_sent: true, via: "phone" };
  }



  async loginWithOtp(dto: LoginDto, guestId?: string) {
    const { identifier, otp, guest_cart_id } = dto;
    const isEmail = identifier.includes('@');

    let user: User;

    if (isEmail) {
      // 🔹 EMAIL OTP VERIFY
      const record = await this.verificationTokenRepository.findOne({
        where: {
          email: identifier,
          token: otp,
          type: VerificationTokenType.LOGIN_EMAIL,
          used: false,
        },
        order: { created_at: 'DESC' },
      });

      if (!record) {
        throw new UnauthorizedException("Invalid OTP");
      }

      if (record.expires_at && record.expires_at < new Date()) {
        throw new UnauthorizedException("OTP expired");
      }

      record.used = true;
      await this.verificationTokenRepository.save(record);

      user = await this.userService.findOneByEmail(identifier);

    } else {
      // 🔹 PHONE OTP VERIFY (Twilio)
      const verify = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SID)
        .verificationChecks.create({
          to: identifier,
          code: otp,
        });

      if (verify.status !== 'approved') {
        throw new UnauthorizedException("Invalid OTP");
      }

      user = await this.userService.findOneByPhone(identifier);
    }

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    this.blockDeletedUser(user);

    const tokens = await this.generateTokens({
      user_id: user.id,
      role: user.role,
      account_status: user.account_status,
    });




    const { password_hash, ...safeUser } = user;

    return {
      user: safeUser,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }



  // ================= SECURE SOCIAL LOGIN =================
  // This version expects SocialLoginDto { provider, token }
  async socialLogin(data: SocialLoginDto, guestId?: string) {
    const { provider, token } = data;

    // validate incoming
    if (!provider || !token) {
      throw new HttpException('Provider and token are required', HttpStatus.BAD_REQUEST);
    }

    // provider-specific verification
    let userInfo: {
      provider_user_id: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };

    try {
      if (provider === 'google') {
        userInfo = await this.verifyGoogleToken(token);
      } else if (provider === 'facebook') {
        userInfo = await this.verifyFacebookToken(token);
      } else if (provider === 'apple') {
        userInfo = await this.verifyAppleToken(token);
      } else {
        throw new HttpException('Unsupported provider', HttpStatus.BAD_REQUEST);
      }
    } catch (err) {
      logger.error('Social token verification failed', err);
      throw new UnauthorizedException('Invalid provider token');
    }

    const { provider_user_id, email, first_name, last_name } = userInfo;

    // Step 1: Check if provider record exists
    const existingProvider = await this.userAuthProviderRepo.findOne({
      where: { provider, provider_user_id },
      relations: ['user'],
    });

    if (existingProvider) {
      const user = existingProvider.user;
      const tokens = await this.generateTokens({ user_id: user.id, role: user.role, account_status: user.account_status, });

      this.blockDeletedUser(user);


      return {
        user,
        ...tokens,
      };
    }

    // Step 2: Provider not found → check if user exists via email
    let user = null;
    if (email) {
      user = await this.userService.findOneByEmail(email);
    }

    if (!user) {
      // Step 3: Create new user
      user = await this.userService.create({
        email,
        first_name,
        last_name,
        is_email_verified: true,
      });
    }

    // Step 4: Link provider (ensure FK is set)
    const providerData = this.userAuthProviderRepo.create({
      provider,
      provider_user_id,
      user_id: user.id, // required column in your entity
      user: user,
    });
    await this.userAuthProviderRepo.save(providerData);

    // Step 5: Generate tokens
    const tokens = await this.generateTokens({ user_id: user.id, role: user.role, account_status: user.account_status, });





    return {
      user,
      ...tokens,
    };
  }


  // ================= provider token verifiers =================

  private async verifyGoogleToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload() as any;

    if (!payload || !payload.sub) throw new UnauthorizedException('Invalid Google token');

    return {
      provider_user_id: payload.sub,
      email: payload.email,
      first_name: payload.given_name,
      last_name: payload.family_name,
    };
  }

  private async verifyFacebookToken(accessToken: string) {
    // validate token + fetch user info
    const url = `https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${accessToken}`;
    const res = await axios.get(url);
    const fb = res.data;

    if (!fb || !fb.id) throw new UnauthorizedException('Invalid Facebook token');

    return {
      provider_user_id: fb.id,
      email: fb.email,
      first_name: fb.first_name,
      last_name: fb.last_name,
    };
  }

  private async verifyAppleToken(idToken: string) {
    // apple-signin-auth will verify signature and return decoded payload
    const decoded = await appleSignin.verifyIdToken(idToken, {
      // Optional: audience & nonce checks
      // audience: process.env.APPLE_CLIENT_ID,
      // nonce: 'nonce-if-used',
    });

    if (!decoded || !decoded.sub) throw new UnauthorizedException('Invalid Apple token');

    // Apple may or may not include email/name depending on context
    return {
      provider_user_id: decoded.sub,
      email: (decoded as any).email,
      first_name: (decoded as any).given_name || '',
      last_name: (decoded as any).family_name || '',
    };
  }




  // ================= TOKEN GENERATION =================
  private async generateTokens(
    payload: any,
    remember_me = false,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const access_token = await this.generateToken(payload, false, remember_me);
    const refresh_token = await this.generateToken(payload, true, remember_me);
    return { access_token, refresh_token };
  }

  private async generateToken(payload: any, isRefreshToken = false, remember_me = false) {
    //  const expiresIn = isRefreshToken ? (remember_me ? '30d' : '7d') : '1d';
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWTKEY,
      expiresIn: remember_me ? '30d' : '7d',
    });
  }

  // ================= REFRESH TOKEN =================
  async refreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWTKEY });
      const user = await this.userService.findOneById(decoded.user_id);
      if (!user) throw new NotFoundException(Errors.USER_NOT_EXISTS);
      this.blockDeletedUser(user);

      const shouldRemember = decoded.remember_me || false;

      const { access_token, refresh_token } = await this.generateTokens(
        { user_id: user.id, role: user.role, account_status: user.account_status, },
        shouldRemember,
      );
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      throw new NotFoundException(Errors.INVALID_TOKEN);
    }
  }


  // ================= FORGOT PASSWORD =================
  async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException(Errors.USER_NOT_EXISTS);

    const resetToken = await this.generateToken(
      { user_id: user.id, email: user.email, purpose: 'password_reset' },
      true,
    );

    await this.userService.createPasswordResetToken(email, resetToken);

    const resetUrl = `${process.env.FRONTEND_BASE_URL}/auth/reset-password?token=${resetToken}`;
    // await MailUtils.sendPasswordResetEmail(email, resetUrl);
    await this.brevo.sendEmail(
      email,
      "Reset Your Password",
      `
  <!DOCTYPE html>
  <html lang="en">
    <body style="margin:0; padding:0; background:#f7f7f7; font-family: Arial, sans-serif;">
      <table width="100%" cellspacing="0" cellpadding="0" style="padding:20px 0;">
        <tr>
          <td align="center">
            <table width="500" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:8px; padding:25px; border:1px solid #e5e5e5;">
              
              <tr>
                <td align="center" style="padding-bottom:10px;">
                  <h2 style="color:#333; margin:0;">Reset Your Password</h2>
                </td>
              </tr>

              <tr>
                <td style="font-size:15px; color:#555;">
                  You requested a password reset. Please click the button below to continue:
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:30px 0;">
                  <a href="${resetUrl}"
                    style="
                      background-color:#4CAF50;
                      color:white;
                      padding:14px 32px;
                      text-decoration:none;
                      font-size:16px;
                      border-radius:6px;
                      display:inline-block;
                    ">
                    Reset Password
                  </a>
                </td>
              </tr>

              <tr>
                <td style="font-size:14px; color:#444;">
                  This link will expire in <strong>30 minutes</strong>.
                </td>
              </tr>

              <tr>
                <td style="font-size:14px; color:#777; padding-top:12px;">
                  If you didn't request this, you can safely ignore this email.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `
    );



    return {
      message:
        'If a user with that email exists, a password reset link has been sent.',
    };
  }

  // ================= RESET PASSWORD =================
  async resetPassword(token: string, newPassword: string) {
    const { valid, email } = await this.userService.verifyToken(token, 'password_reset' as VerificationTokenType);
    if (!valid || !email) throw new NotFoundException('Invalid or expired password reset token');

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException(Errors.USER_NOT_EXISTS);

    await this.userService.update(user.id, {
      password_hash: Encryption.hashPassword(newPassword),
    });

    await this.userService.deleteTokensByEmailAndType(email, 'password_reset' as VerificationTokenType);

    return { message: 'Password has been reset successfully' };
  }

  // ================= LOGOUT =================
  async logout(req: UserLogoutDto) {
    const { user_id } = req;

    return this.userService.update(user_id, {
      metadata: { device_token: null },
    });
  }

  async sendChangeEmailOtp(userId: string, email: string) {
    // 1️⃣ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2️⃣ Send email via Brevo
    try {
      await this.brevo.sendEmail(
        email,
        'Verify your new email',
        `
        <div style="font-family: Arial, sans-serif">
          <h3>Email Verification</h3>
          <p>Your OTP is:</p>
          <h2 style="letter-spacing: 3px">${otp}</h2>
          <p>This OTP is valid for <b>10 minutes</b>.</p>
        </div>
      `,
      );
    } catch (error) {
      console.error('BREVO SEND EMAIL ERROR:', error);
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 3️⃣ Save OTP only if email sent successfully
    await this.verificationTokenRepository.save({
      email,
      token: otp,
      type: VerificationTokenType.CHANGE_EMAIL,
      used: false,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      user: { id: userId } as User,
    });

    return { message: 'OTP sent to new email' };
  }



  async sendChangePhoneOtp(userId: string, phone: string) {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });

    await this.verificationTokenRepository.save({
      phone,
      token: verification.sid, // ✅ IMPORTANT FIX
      type: VerificationTokenType.CHANGE_PHONE,
      used: false,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      user: { id: userId } as User,
    });

    return { message: 'OTP sent to new phone number' };
  }



  async verifyChangePhoneOtp(
    userId: string,
    phone: string,
    otp: string,
  ) {
    // 1️⃣ Verify via Twilio
    const verify = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (verify.status !== 'approved') {
      throw new UnauthorizedException('Invalid OTP');
    }

    // 2️⃣ Find latest OTP record
    const record = await this.verificationTokenRepository.findOne({
      where: {
        phone,
        type: VerificationTokenType.CHANGE_PHONE,
        used: false,
      },
      order: { created_at: 'DESC' },
    });

    if (!record) {
      throw new UnauthorizedException('OTP not found or expired');
    }

    record.used = true;
    await this.verificationTokenRepository.save(record);

    // 3️⃣ Update user phone
    await this.userService.updatePhone(userId, phone);


    return { message: 'Phone number updated successfully' };
  }


  async verifyChangeEmailOtp(
    userId: string,
    email: string,
    otp: string,
  ) {
    const record = await this.verificationTokenRepository.findOne({
      where: {
        email,
        token: otp,
        type: VerificationTokenType.CHANGE_EMAIL,
        used: false,
      },
      order: { created_at: 'DESC' },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    record.used = true;
    await this.verificationTokenRepository.save(record);

    await this.userService.updateEmail(userId, email);


    return { message: 'Email updated successfully' };
  }


  async sendVetApplyOtp(dto: VetApplyDto) {

    // 1️⃣ Check if user already exists (email OR phone)
    const existingUser = await this.userService.findOneByEmailOrPhone(
      dto.email || dto.phone
    );

    if (existingUser) {
      throw new ConflictException('Email or phone already exists');
    }

    // 2️⃣ Send OTP via Twilio
    const twilioResponse = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: dto.phone,
        channel: "sms"
      });

    // 3️⃣ Save OTP record
    await this.verificationTokenRepository.save({
      phone: dto.phone,
      token: twilioResponse.sid,
      type: "vet_apply_otp" as any, // Cast if enum doesn't include this value, or add to enum
      used: false,
      signup_payload: dto,
    });

    return { otp_sent: true };
  }



  async verifyVetApplyOtp(phone: string, otp: string) {

    // 1️⃣ Verify OTP with Twilio
    const verify = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (verify.status !== 'approved') {
      throw new UnauthorizedException('Invalid OTP');
    }

    // 2️⃣ Start DB transaction
    return await this.dataSource.transaction(async (manager) => {

      // 3️⃣ Lock OTP record (prevent double usage)
      const record = await manager.findOne(VerificationToken, {
        where: { phone, type: "vet_apply_otp" as VerificationTokenType, used: false },
        order: { created_at: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!record) {
        throw new UnauthorizedException('Session expired or already used');
      }

      // 4️⃣ Mark OTP as used
      record.used = true;
      await manager.save(record);

      const dto = record.signup_payload;

      // 5️⃣ Re-check user existence (important)
      const existingUser = await manager.findOne(User, {
        where: [
          { phone: dto.phone },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      // 6️⃣ Create Vet user
      // 6️⃣ Create User
      const newUser = manager.create(User, {
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        phone: dto.phone,
        password_hash: Encryption.hashPassword(dto.password),

        role: UserRole.VET,
        account_status: AccountStatus.PENDING,

        is_phone_verified: true,
        is_email_verified: false,
        is_active: true,
      });

      // 🔥 SAVE USER FIRST
      await manager.save(newUser);

      // 7️⃣ Create Vet Profile
      await manager.save(Vet, {
        user_id: newUser.id,
        registration_number: dto.license_number ?? 'TEMP',
        council_name: dto.council_name ?? 'TEMP',
        years_of_experience: dto.years_of_experience ?? 0,
        primary_specialization: dto.primary_specialization,
        services_offered: dto.services_offered?.map(s =>
          s.toUpperCase(),
        ),
        verification_status: VerificationStatus.PENDING,
        is_active: true,
      });
      return {
        message: "Vet application submitted. Awaiting admin approval.",
        user_id: newUser.id,
      };
    });
  }

}