import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { UserProfile } from './entities/user-profile.entity';
import { VerificationToken } from '../users/entities/verification-token.entity';
import { User } from '../users/entities/user.entity'
import { Address } from '../addresses/entities/address.entity';
import { FileUploadModule } from 'src/common/file-upload/file-upload.module';

@Module({
  imports: [ TypeOrmModule.forFeature([UserProfile, User,VerificationToken,Address]), FileUploadModule],
  controllers: [UserProfilesController],
  providers: [UserProfilesService],
  exports: [UserProfilesService],
})
export class UserProfilesModule {}
