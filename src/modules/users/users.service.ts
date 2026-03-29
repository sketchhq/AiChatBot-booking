import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  Repository,
  Not,
  FindOneOptions,
  EntityManager,
} from 'typeorm';
import {
  InjectRepository,
  InjectEntityManager,
} from '@nestjs/typeorm';
import { BaseService } from 'src/base.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { logger } from 'src/core/utils/logger';
import { User } from './entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { VerificationTokenType } from './entities/verification-token.entity';
import * as bcrypt from 'bcrypt';
import { UserLoginSession } from '../user-login-session/entities/user-login-session.entity';
import { randomUUID } from 'crypto';
import { BrevoEmailService } from 'src/core/utils/brevo-email.service';

@Injectable()
export class UsersService extends BaseService<User> {
  // ✅ Required by BaseService
  protected repository: Repository<User>;

  @InjectRepository(VerificationToken)
  private readonly verificationTokenRepository: Repository<VerificationToken>;

  constructor(
    @InjectEntityManager()
    entityManager: EntityManager,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserLoginSession)
    private readonly loginSessionRepo: Repository<UserLoginSession>,

    @InjectRepository(Address)
  private readonly addressRepo: Repository<Address>, 

    private readonly brevoEmailService: BrevoEmailService,
  ) {
    super(entityManager);               // ✅ FIXED
    this.repository = userRepository;   // ✅ FIXED
  }

  /* -------------------------------------------------------------------------- */
  /*                               BASIC QUERIES                                 */
  /* -------------------------------------------------------------------------- */

  async create(user: Partial<User>): Promise<User> {
    logger.info(`User_Create: ${user.email}`);
    return super.create(user);
  }

  async findOneById(
    id: string,
    options?: FindOneOptions<User>,
  ): Promise<User | null> {
    return this.repository.findOne({
      where: { id, is_deleted: false },
      ...(options || {}),
    });
  }

  async findUserIncludingDeleted(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async findOneByEmail(email?: string): Promise<User | null> {
    if (!email) return null;
    return this.repository.findOne({
      where: { email, is_deleted: false },
    });
  }

  async findOneByPhone(phone: string): Promise<User | null> {
    return this.repository.findOne({
      where: { phone, is_deleted: false },
    });
  }

  async findOneByEmailOrPhone(identifier: string): Promise<User | null> {
    const byEmail = await this.repository.findOne({
      where: { email: identifier, is_deleted: false },
    });
    if (byEmail) return byEmail;

    return this.repository.findOne({
      where: { phone: identifier, is_deleted: false },
    });
  }

  async updateProfile(userId: string, body: UpdateUserDto): Promise<User> {
    if (body.email) {
      const exists = await this.repository.findOne({
        where: { email: body.email, id: Not(userId), is_deleted: false },
      });
      if (exists) {
        throw new ConflictException('Email already exists');
      }
    }

    await super.update(userId, body);
    return (await this.findOneById(userId))!;
  }

  /* -------------------------------------------------------------------------- */
  /*                           DELETE ACCOUNT                                    */
  /* -------------------------------------------------------------------------- */

  async deleteAccount(userId: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    const restoreToken = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    user.is_deleted = true;
    user.is_active = false;
    user.deleted_at = new Date();
    user.restore_token = restoreToken;
    user.restore_token_expires_at = expiresAt;

    await this.userRepository.save(user);

    const restoreUrl =
      `${process.env.FRONTEND_BASE_URL}/restore-account?token=${restoreToken}`;

    await this.brevoEmailService.sendEmail(
      user.email,
      'Restore your account',
      `
<!DOCTYPE html>
<html>
<body>
  <h2>Restore Your Account</h2>
  <p>You can restore your account within 30 days.</p>
  <a href="${restoreUrl}">Restore Account</a>
  <p>Expires on ${expiresAt.toDateString()}</p>
</body>
</html>
      `,
    );

    return {
      message: 'Account deleted. Restore link sent to your email.',
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                         RESTORE VIA TOKEN                                   */
  /* -------------------------------------------------------------------------- */

  async restoreAccountWithToken(token: string) {
    const user = await this.userRepository.findOne({
      where: {
        restore_token: token,
        is_deleted: true,
      },
      withDeleted: true,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired restore token');
    }

    if (
      !user.restore_token_expires_at ||
      user.restore_token_expires_at < new Date()
    ) {
      throw new BadRequestException('Restore window expired');
    }

    user.is_deleted = false;
    user.is_active = true;
    user.deleted_at = null;
    user.restore_token = null;
    user.restore_token_expires_at = null;

    await this.userRepository.save(user);

    return { message: 'Account restored successfully' };
  }

  /* -------------------------------------------------------------------------- */
  /*                         RESTORE VIA JWT                                     */
  /* -------------------------------------------------------------------------- */

  async restoreAccount(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.is_deleted || !user.deleted_at) {
      throw new BadRequestException('Account is not deleted');
    }

    const daysPassed =
      (Date.now() - user.deleted_at.getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysPassed > 30) {
      throw new BadRequestException('Restore window expired');
    }

    user.is_deleted = false;
    user.deleted_at = null;
    user.is_active = true;

    await this.userRepository.save(user);

    return { message: 'Account restored successfully' };
  }

  /* -------------------------------------------------------------------------- */
  /*                         PASSWORD RESET SUPPORT                              */
  /* -------------------------------------------------------------------------- */

   async createPasswordResetToken(
    email: string,
    token: string,
  ): Promise<VerificationToken> {
    const user = await this.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    await this.verificationTokenRepository.delete({
      user: { id: user.id } as User,
      type: VerificationTokenType.PASSWORD_RESET,
    });

    const entity = this.verificationTokenRepository.create({
      user: { id: user.id } as User,
      token,
      type: VerificationTokenType.PASSWORD_RESET,
      used: false,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    });

    return this.verificationTokenRepository.save(entity);
  }


   async verifyToken(
    token: string,
    type: VerificationTokenType,
  ): Promise<{ valid: boolean; email?: string }> {
    const record = await this.verificationTokenRepository.findOne({
      where: { token, type },
      relations: ['user'],
    });

    if (!record || record.used || record.expires_at < new Date()) {
      return { valid: false };
    }

    record.used = true;
    await this.verificationTokenRepository.save(record);

    return { valid: true, email: record.user.email };
  }

   async deleteTokensByEmailAndType(
    email: string,
    type: VerificationTokenType,
  ): Promise<void> {
    await this.verificationTokenRepository
      .createQueryBuilder()
      .delete()
      .where('"type" = :type', { type })
      .andWhere(
        `"userId" IN (SELECT "id" FROM "users" WHERE "email" = :email)`,
        { email },
      )
      .execute();
  }

 async updateEmail(userId: string, email: string) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.email = email;
  user.is_email_verified = true;

  return this.userRepository.save(user);
}

async updatePhone(userId: string, phone: string) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.phone = phone;
  user.is_phone_verified = true;

  return this.userRepository.save(user);
}


}

