import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { VetPayoutService } from './vet-payout.service';
import { CreateVetPayoutDto } from './dto/create-vet-payout.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/modules/users/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vet-payouts')
export class VetPayoutController {
  constructor(private readonly service: VetPayoutService) {}

  // ADMIN + VET create payout
  @Roles(UserRole.ADMIN, UserRole.VET)
  @Post()
  create(@Body() dto: CreateVetPayoutDto) {
    return this.service.create(dto);
  }

  // ADMIN + VET view all payouts
  @Roles(UserRole.ADMIN, UserRole.VET)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ADMIN + VET view vet payouts
  @Roles(UserRole.ADMIN, UserRole.VET)
  @Get('vet/:vetId')
  findByVet(@Param('vetId') vetId: string) {
    return this.service.findByVet(vetId);
  }

  // ADMIN + VET process payout
  @Roles(UserRole.ADMIN, UserRole.VET)
  @Patch(':id/process')
  process(@Param('id') id: string) {
    return this.service.processPayout(id);
  }

  // ADMIN + VET delete payout
  @Roles(UserRole.ADMIN, UserRole.VET)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}