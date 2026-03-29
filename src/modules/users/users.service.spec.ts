import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { VerificationToken } from './entities/verification-token.entity';
import { UserLoginSession } from '../user-login-session/entities/user-login-session.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
        {
          provide: getRepositoryToken(VerificationToken),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              execute: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(UserLoginSession),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  // 🔴 DELETE ACCOUNT
  describe('deleteAccount', () => {
    it('should soft delete user when password is correct', async () => {
      const user = {
        id: '1',
        is_deleted: false,
        is_active: true,
        deleted_at: null,
        password_hash: 'hashed-password',
      } as User;

      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.deleteAccount('1', 'password');

      expect(user.is_deleted).toBe(true);
      expect(user.is_active).toBe(false);
      expect(user.deleted_at).toBeInstanceOf(Date);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteAccount('1', 'password'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = {
        id: '1',
        password_hash: 'hashed-password',
      } as User;

      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.deleteAccount('1', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
