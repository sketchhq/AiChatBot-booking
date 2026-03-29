// src/seeder/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
// import { RolesPermissionsSeeder } from './roles-permissions.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  // providers: [RolesPermissionsSeeder],
})
export class SeederModule {}
