import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { User } from '../users/entities/user.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import * as bcrypt from 'bcrypt';
import { Address } from '../addresses/entities/address.entity';
import { IsNull } from 'typeorm';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';


@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

     private readonly fileUploadService: FileUploadService,
  ) {}

   private normalizeProfileDto(dto: UpdateUserProfileDto) {
    return {
      ...dto,
      first_name: dto.first_name?.trim(),
      last_name: dto.last_name?.trim(),
    }; 
  }

  // ========================= GET PROFILE =========================
 async getProfile(userId: string) {
  const user = await this.userRepo.findOne({
    where: { id: userId, is_deleted: false },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 🔥 Auto-create profile if missing
  let profile = await this.userProfileRepo.findOne({
    where: { user_id: userId, is_deleted: false },
  });

  if (!profile) {
    profile = this.userProfileRepo.create({
      user_id: userId,
      user,
    });
    await this.userProfileRepo.save(profile);
  }

 const addresses = await this.addressRepo.find({
  where: {
    user_id: userId,
    is_deleted: false,   // ✅ Address supports this
  },
  order: { created_at: 'DESC' },
});



  const primaryAddress =
    addresses.find(addr => addr.is_default) || null;

  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null;

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: fullName,
    },
    profile,
    primary_address: primaryAddress,
    addresses,
  };
}


 // ================= CREATE/ UPDATE PROFILE =================
async updateProfile(userId: string, dto: UpdateUserProfileDto) {
  const user = await this.userRepo.findOne({
    where: { id: userId, is_deleted: false },
  });

  if (!user) throw new NotFoundException('User not found');

  const cleanDto = this.normalizeProfileDto(dto);

  let profile = await this.userProfileRepo.findOne({
    where: { user_id: userId },
  });

  if (!profile) {
    profile = this.userProfileRepo.create({
      user_id: userId,
      ...cleanDto,
    });
  } else {
    Object.assign(profile, cleanDto);
  }

  await this.userProfileRepo.save(profile);

  // ✅ Sync selected fields to users table
  const syncFields = [
    'first_name',
    'last_name',
    'dob',
    'gender',
    'avatar_url',
  ];

  syncFields.forEach((field) => {
    if ((dto as any)[field] !== undefined) {
      (user as any)[field] = (dto as any)[field];
    }
  });

  await this.userRepo.save(user);

  return {
    message: 'Profile updated successfully',
    user,
    profile,
  };
}


  // ========================= CHANGE PASSWORD =========================
async changePassword(
    userId: string,
    body: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    const { currentPassword, newPassword, confirmPassword } = body;

    // 1️⃣ Fetch user
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 2️⃣ Verify current password
    const isValidOld = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!isValidOld) {
      throw new BadRequestException('Current password is incorrect');
    }

    // 3️⃣ New password & confirm password match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    // 4️⃣ Prevent reusing old password
    const isSameAsOld = await bcrypt.compare(
      newPassword,
      user.password_hash,
    );

    if (isSameAsOld) {
      throw new BadRequestException(
        'New password cannot be same as old password',
      );
    }

    // 5️⃣ Hash & save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashed;

    await this.userRepo.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

// ========================= DELETE PROFILE =========================
async remove(userId: string) {
  const profile = await this.userProfileRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user'],   // IMPORTANT: include user relation
  });

  if (!profile) {
    throw new NotFoundException('Profile not found');
  }

  // Soft delete profile
  profile.is_deleted = true;
  profile.deleted_at = new Date();
  await this.userProfileRepo.save(profile);

  // Soft delete user also
  profile.user.is_deleted = true;
  profile.user.deleted_at = new Date();
  await this.userRepo.save(profile.user);

  return { message: 'Profile and user deleted successfully' };
}




  // ======================= UPDATE AVATAR =======================
async updateAvatar(userId: string, file: Express.Multer.File) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  let profile = await this.userProfileRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });

  // 🔥 Upload to Spaces inside profiles folder
  const avatarUrl = await this.fileUploadService.uploadPublic(
    file,
    'profiles',
  );

  if (!profile) {
    profile = this.userProfileRepo.create({
      user,
      user_id: userId,
      avatar_url: avatarUrl,
    });
  } else {
    // Optional: delete old avatar
    if (profile.avatar_url) {
      const oldKey = profile.avatar_url.split('.com/')[1];
      await this.fileUploadService.deleteFile(oldKey);
    }

    profile.avatar_url = avatarUrl;
  }

  await this.userProfileRepo.save(profile);

  return {
    message: 'Avatar updated successfully',
    avatar_url: avatarUrl,
  };
}


}