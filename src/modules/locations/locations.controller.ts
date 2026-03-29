import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { LocationsService } from './locations.service';
import { Location } from 'src/modules/locations/entities/locations.entity';

import { CreateLocationDto } from 'src/modules/locations/dto/create-locations.dto';
import { UpdateLocationDto } from 'src/modules/locations/dto/update-locations';
import { BulkCreateLocationsDto } from './dto/bulk-create-locations.dto';
import { BulkUpdateLocationsDto } from './dto/bulk-update-locations.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { ValidateLocationDto } from 'src/modules/locations/dto/validate-locations.dto';
import {ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('locations')
@ApiBearerAuth('access-token')
@Controller('locations')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // --------------------------------------------------
  // POST
  // --------------------------------------------------

  // Create a single location  → POST /locations
  @Post()
  @ApiOperation({ summary: 'Create a location' })
  @ApiResponse({ status: 201, description: 'Location created', type: Location })
  async create(@Body() createDto: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(createDto);
  }

  // Bulk create locations  → POST /locations/bulk
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create locations' })
  @ApiBody({ type: BulkCreateLocationsDto })
  async bulkCreate(@Body() dto: BulkCreateLocationsDto) {
    return this.locationsService.bulkCreate(dto);
  }

  // Validate location  → POST /locations/validate
  @Post('validate')
  @ApiOperation({ summary: 'Validate a location' })
  @ApiBody({ type: ValidateLocationDto })
  validateLocation(@Body() dto: ValidateLocationDto) {
    return this.locationsService.validateLocation(dto);
  }

  // --------------------------------------------------
  // GET
  // --------------------------------------------------

  // List locations (paginated) → GET /locations
  @Get()
  @ApiOperation({ summary: 'List locations (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 25 })
  @ApiResponse({ status: 200, description: 'List of locations' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit = 25,
  ) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    return this.locationsService.findAll(skip, take);
  }

  // Get all location types → GET /locations/types
  @Get('types')
  @ApiOperation({ summary: 'Get all location types' })
  getAllTypes() {
    return this.locationsService.getAllTypes();
  }

  // Get metadata keys → GET /locations/metadata/keys
  @Get('metadata/keys')
  @ApiOperation({ summary: 'Get all metadata keys' })
  getMetadataKeys() {
    return this.locationsService.getMetadataKeys();
  }

  // Get by type → GET /locations/type/:type
  @Get('type/:type')
  @ApiOperation({ summary: 'Get locations by type' })
  getByType(@Param('type') type: string) {
    return this.locationsService.getByType(type);
  }

  // Nearby search → GET /locations/nearby?lat=&lng=&radius=
  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby locations' })
  getNearby(@Query() query: NearbyQueryDto) {
    const { lat, lng, radius } = query;
    return this.locationsService.getNearby(
      Number(lat),
      Number(lng),
      Number(radius),
    );
  }

  // Get a single location → GET /locations/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a location by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Location found', type: Location })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Location> {
    return this.locationsService.findOne(id);
  }

  // --------------------------------------------------
  // PATCH
  // --------------------------------------------------

  // Bulk update → PATCH /locations/bulk
  // (keep this ABOVE :id so /bulk doesn’t hit ParseUUIDPipe)
  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update locations' })
  @ApiBody({ type: BulkUpdateLocationsDto })
  bulkUpdate(@Body() dto: BulkUpdateLocationsDto) {
    return this.locationsService.bulkUpdate(dto);
  }

  // Single update → PATCH /locations/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Location updated', type: Location })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationsService.update(id, updateDto);
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  // Delete → DELETE /locations/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a location' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.locationsService.remove(id);
  }
}
