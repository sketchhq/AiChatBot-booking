import {
  Body,
  Controller,
  Post,
  Delete,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth,ApiOperation,ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import HandleResponse from 'src/core/utils/handle_response';
import { EC200 } from 'src/core/constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';


@ApiBearerAuth('access-token')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  // 🔴 DELETE ACCOUNT
  
  @Delete('security/delete-account')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user account (30 days restore window)' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'User@123' },
      },
      required: ['password'],
    },
  })
  async deleteAccount(
    @Req() req,
    @Body() body: { password: string },
  ) {
    const data = await this.usersService.deleteAccount(
      req.user.user_id,
      body.password,
    );

    return HandleResponse.buildSuccessObj(
      EC200,
      'Account deleted successfully',
      data,
    );
  }


 @Public()
@Post('restore')
async restore(@Body() body: { token: string }) {
  return this.usersService.restoreAccountWithToken(body.token);
}


  // 🟢 RESTORE ACCOUNT
  @Post('security/restore-account')
  @UseGuards(JwtAuthGuard)
   @ApiOperation({ summary: 'Restore deleted account within 30 days' })
  async restoreAccount(@Req() req) {
    const data = await this.usersService.restoreAccount(
      req.user.user_id,
    );

    return HandleResponse.buildSuccessObj(
      EC200,
      'Account restored successfully',
      data,
    );
  }
}
