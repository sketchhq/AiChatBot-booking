import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChangePasswordDto } from 'src/modules/user-profiles/dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('user-account')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(private readonly service: UserProfilesService) {}

  // ======================= GET PROFILE =======================
  @Get('profile')
  async getProfile(@Req() req) {
    return await this.service.getProfile(req.user.id);
  }

  // ======================= UPDATE PROFILE =======================
  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return await this.service.updateProfile(req.user.id, dto);
  }

  // ======================= CHANGE PASSWORD =======================
  @Patch('profile/change-password')
  async changePassword(
    @Req() req,
    @Body() body: ChangePasswordDto,
  ) {
    return await this.service.changePassword(req.user.id, body);
  }

  // ======================= DELETE PROFILE =======================
  @Delete('profile')
  async deleteProfile(@Req() req) {
    return await this.service.remove(req.user.id);
  }



 @Patch('profile/avatar')
@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only images allowed'), false);
      }
      cb(null, true);
    },
  }),
)
async updateAvatar(
  @Req() req,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('File is required');
  }

  return await this.service.updateAvatar(req.user.id, file);
}


}
