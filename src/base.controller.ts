import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EC200, EM100, EM106, EM127 } from 'src/core/constants';
import HandleResponse from 'src/core/utils/handle_response';

export class BaseController<T> {
  constructor(private readonly service: any) { }

  @Post()
  async create(@Body() createDto: T) {
    try {
      let data = await this.service.create(createDto);
      return HandleResponse.buildSuccessObj(EC200, EM106, data);
    } catch (error) {
      return HandleResponse.buildErrObj(null, EM100, error);
    }
  }

  @Get()
  async findAll() {
    try {
      let data = await this.service.findAll();
      return HandleResponse.buildSuccessObj(EC200, EM106, data);
    } catch (error) {
      return HandleResponse.buildErrObj(null, EM100, error);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      let data = await this.service.findOne(id);
      return HandleResponse.buildSuccessObj(EC200, EM106, data);
    } catch (error) {
      return HandleResponse.buildErrObj(null, EM100, error);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: T) {
    try {
      let data = await this.service.update(id, updateDto);
      return HandleResponse.buildSuccessObj(EC200, EM106, data);
    } catch (error) {
      return HandleResponse.buildErrObj(null, EM100, error);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      let data = await this.service.destroy(id);
      return HandleResponse.buildSuccessObj(EC200, EM127, data);
    } catch (error) {
      return HandleResponse.buildErrObj(null, EM100, error);
    }
  }
}
