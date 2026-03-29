import {
  Controller,
  Body,
  Post,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  EC200,
  EC500,
  EM100,
  EM141,
  EM149,
} from 'src/core/constants';
import HandleResponse from 'src/core/utils/handle_response';
import { LoginDto, UserLogoutDto } from './dto/login-dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { SignupDto } from './dto/signup.dto';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Public } from 'src/common/decorators/public.decorator';
import { SocialLoginDto } from './dto/social-login.dto';
import { SendSignupOtpDto } from './dto/send-signup-otp.dto';
import { VerifySignupOtpDto } from './dto/verify-signup-otp.dto';
import { SendLoginOtpDto } from './dto/send-login-otp.dto';
import { CheckIdentifierDto } from './dto/check-identifier.dto';
import { VetApplyDto } from './dto/vet-apply.dto';
import { VerifyVetApplyOtpDto } from './dto/verify-vet-apply-otp.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SendPhoneOtpDto } from './dto/change-profile-otp.dto';
import { VerifyPhoneOtpDto } from './dto/change-profile-otp.dto';
import { SendEmailOtpDto } from './dto/change-profile-otp.dto';
import { VerifyEmailOtpDto } from './dto/change-profile-otp.dto';



@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // ================= CHECK IDENTIFIER =================
  @Public()
  @Post('check-identifier')
  async checkIdentifier(@Body() body: CheckIdentifierDto) {
    return this.authService.checkIdentifier(body.identifier);
  }

  // ================= LOGIN =================
@Public()
@Post('login')
@ApiOperation({ summary: 'Login with email/phone using password or OTP' })
@ApiBody({ type: LoginDto })
@ApiResponse({ status: 200, description: 'Login success' })
async login(@Body() body: LoginDto, @Req() req) {
  try {
    const dto = plainToClass(LoginDto, body);
    await validateOrReject(dto);

    // 🔑 PASSWORD LOGIN
    if (dto.login_type === 'password') {
   const data = await this.authService.loginWithPassword(
  dto,
  {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    guestId: req.headers['x-guest-id'], // 🔥 ADD THIS
  }
);

      return HandleResponse.buildSuccessObj(
        EC200,
        'Login successful (Password)',
        data,
      );
    }

    // 🔑 OTP LOGIN
    if (dto.login_type === 'otp') {
      if (!dto.otp) {
        throw new BadRequestException('OTP is required for OTP login');
      }

      const data = await this.authService.loginWithOtp(dto);


      return HandleResponse.buildSuccessObj(
        EC200,
        'Login successful (OTP)',
        data,
      );
    }

    throw new BadRequestException(
      "Invalid login type. Use 'password' or 'otp'.",
    );
  } catch (error) {
    this.logger.error('Login failed', error);
    return HandleResponse.buildErrObj(
      error?.status || EC500,
      error?.message || EM100,
      error,
    );
  }
}


  // ================= SEND LOGIN OTP =================
  @Public()
  @Post('login/send-otp')
  async sendLoginOtp(@Body() body: SendLoginOtpDto) {
    const result = await this.authService.sendLoginOtp(body.identifier);
    return HandleResponse.buildSuccessObj(
      EC200,
      'OTP sent successfully',
      result,
    );
  }

  // ================= SIGNUP (SEND OTP) =================
  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Send OTP for signup' })
  @ApiBody({ type: SendSignupOtpDto })
  async sendSignupOtp(@Body() body: SendSignupOtpDto) {
    const response = await this.authService.sendSignupOtp(body);
    return HandleResponse.buildSuccessObj(EC200, 'OTP sent', response);
  }

  // ================= VERIFY SIGNUP OTP =================
  @Public()
  @Post('verify-signup-otp')
  @ApiOperation({ summary: 'Verify OTP for signup' })
  @ApiBody({ type: VerifySignupOtpDto })
  async verifySignupOtp(@Body() body: VerifySignupOtpDto) {
    const result = await this.authService.verifySignupOtp(body);
    return HandleResponse.buildSuccessObj(
      EC200,
      'OTP verified successfully',
      result,
    );
  }

  // ================= SOCIAL LOGIN =================
  @Public()
  @Post('social-login')
  @ApiOperation({ summary: 'Login using Google, Facebook or Apple' })
  async socialLogin(@Body() body: SocialLoginDto) {
    try {
      const data = await this.authService.socialLogin(body);
      return HandleResponse.buildSuccessObj(
        EC200,
        'Social login successful',
        data,
      );
    } catch (error) {
      return HandleResponse.buildErrObj(
        error?.status || EC500,
        error?.message || EM100,
        error,
      );
    }
  }

  // ================= FORGOT PASSWORD =================
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      const data = await this.authService.forgotPassword(body.email_id);
      return HandleResponse.buildSuccessObj(EC200, EM141, data);
    } catch (error) {
      return HandleResponse.buildErrObj(
        error?.status || EC500,
        error?.message || EM100,
        error,
      );
    }
  }

  // ================= RESET PASSWORD =================
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      const data = await this.authService.resetPassword(
        body.token,
        body.password,
      );
      return HandleResponse.buildSuccessObj(
        EC200,
        'Password reset successfully',
        data,
      );
    } catch (error) {
      return HandleResponse.buildErrObj(
        error?.status || EC500,
        error?.message || EM100,
        error,
      );
    }
  }

  // ================= REFRESH TOKEN =================
  @Public()
  @Post('refresh')
  async refresh(@Body() body: { token: string }) {
    try {
      const data = await this.authService.refreshToken(body.token);
      return HandleResponse.buildSuccessObj(
        EC200,
        'Token refreshed successfully',
        data,
      );
    } catch (error) {
      return HandleResponse.buildErrObj(
        error?.status || EC500,
        error?.message || EM100,
        error,
      );
    }
  }

  // ================= LOGOUT =================
 @Public()
@Post('logout')
async logout(@Body() logoutDto: UserLogoutDto) {
  try {
    await this.authService.logout(logoutDto);
    return HandleResponse.buildSuccessObj(EC200, EM149, null);
  } catch (error) {
    return HandleResponse.buildErrObj(
      error?.status || EC500,
      error?.message || EM100,
      error,
    );
  }
}



@Public()
@Post('vet/send-otp')
@ApiOperation({ summary: 'Send OTP for Vet application' })
@ApiBody({ type: VetApplyDto })
async sendVetApplyOtp(@Body() body: VetApplyDto) {
  try {
    const result = await this.authService.sendVetApplyOtp(body);

    return HandleResponse.buildSuccessObj(
      EC200,
      'Vet OTP sent successfully',
      result,
    );
  } catch (error) {
    return HandleResponse.buildErrObj(
      error?.status || EC500,
      error?.message || EM100,
      error,
    );
  }
}


@Public()
@Post('vet/verify-otp')
@ApiOperation({ summary: 'Verify OTP and complete Vet application' })
async verifyVetApplyOtp(@Body() body: { phone: string; otp: string }) {
  try {
    const result = await this.authService.verifyVetApplyOtp(
      body.phone,
      body.otp,
    );

    return HandleResponse.buildSuccessObj(
      EC200,
      'Vet application submitted successfully',
      result,
    );
  } catch (error) {
    return HandleResponse.buildErrObj(
      error?.status || EC500,
      error?.message || EM100,
      error,
    );
  }
}

// ================= CHANGE PHONE OTP =================
  @UseGuards(JwtAuthGuard)
  @Post('profile/phone/send-otp')
  @ApiOperation({ summary: 'Send OTP to new phone number' })
@ApiBody({ type: SendPhoneOtpDto })
  sendChangePhoneOtp(
    @Req() req,
    @Body() body: { phone: string },
  ) {
    if (!body.phone) {
    throw new BadRequestException('Phone number is required');
  }


    return this.authService.sendChangePhoneOtp(
      req.user.id,
      body.phone,
    );
  }

  // ================= VERIFY CHANGE PHONE OTP =================
@UseGuards(JwtAuthGuard)
@Post('profile/phone/verify-otp')
@ApiOperation({ summary: 'Verify OTP and update phone number' })
@ApiBody({ type: VerifyPhoneOtpDto })
verifyChangePhoneOtp(
  @Req() req,
  @Body() body: { phone: string; otp: string },
) {
  if (!body.phone || !body.otp) {
    throw new BadRequestException('Phone and OTP are required');
  }

  return this.authService.verifyChangePhoneOtp(
    req.user.id,
    body.phone,
    body.otp,
  );
}


  // ================= CHANGE EMAIL OTP =================
  @UseGuards(JwtAuthGuard)
  @Post('change-email/send-otp')
  @ApiOperation({ summary: 'Send OTP to new email address' })
@ApiBody({ type: SendEmailOtpDto })
  sendChangeEmailOtp(
    @Req() req,
    @Body() body: { email: string },
  ) {

     if (!body.email) {
    throw new BadRequestException('Email is required');
  }

    return this.authService.sendChangeEmailOtp(
      req.user.id,
      body.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-email/verify-otp')
  @ApiOperation({ summary: 'Verify OTP and update email address' })
@ApiBody({ type: VerifyEmailOtpDto })
  verifyChangeEmailOtp(
    @Req() req,
    @Body() body: { email: string; otp: string },
  ) {
    return this.authService.verifyChangeEmailOtp(
      req.user.id,
      body.email,
      body.otp,
    );
  }
}