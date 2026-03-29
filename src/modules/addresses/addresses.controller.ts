import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new address' })
  create(@Body() dto: CreateAddressDto, @Req() req) {
    return this.service.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses of logged-in user' })
  findAll(@Req() req) {
    return this.service.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single address' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.service.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @Req() req,
  ) {
    return this.service.update(id, dto, req.user.id);
  }

  @Patch(':id/set-default')
@ApiOperation({ summary: 'Set default address' })
@UseGuards(JwtAuthGuard)
setDefault(@Param('id') id: string, @Req() req) {
  return this.service.setDefaultAddress(id, req.user.id);
}


  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete address' })
  remove(@Param('id') id: string, @Req() req) {
    return this.service.softDelete(id, req.user.id);
  }

  @Get('pet-services')
getPetServiceAddresses(@Req() req) {
  return this.service.getPetServiceAddresses(req.user.id);
}


 /// @Patch(':id/pet-service')
//setPetServiceUsage(
 // @Param('id') id: string,
  //@Body() body: { value: boolean },
  //@Req() req: any,
//) {
  //return this.service.setPetServiceUsage(
   // id,
    //req.user.id,
    //body.value,
  //);
//}

}