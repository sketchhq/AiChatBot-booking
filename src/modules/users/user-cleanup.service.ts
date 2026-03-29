import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserCleanupService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ⏰ Runs daily at midnight
  @Cron('0 0 * * *')
  async permanentlyDeleteUsers() {
    const cutoffDate = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    );

    const users = await this.userRepository.find({
      where: {
        is_deleted: true,
        deleted_at: LessThan(cutoffDate),
      },
    });

    for (const user of users) {
      await this.userRepository.delete(user.id);
    }
  }
}
