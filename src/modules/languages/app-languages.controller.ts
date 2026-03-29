import { Controller, Get, Post, Body, Param, Patch, Delete,Query } from '@nestjs/common';
import { AppLanguagesService } from './app-languages.service';
import { CreateAppLanguageDto } from './dto/create-app-language.dto';
import { UpdateAppLanguageDto } from './dto/update-app-language.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';



@ApiBearerAuth('access-token')
@ApiTags('Languages')
@Controller('languages')
export class AppLanguagesController {
  constructor(private readonly service: AppLanguagesService) {}

  @Post()
  create(@Body() dto: CreateAppLanguageDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateAppLanguageDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
