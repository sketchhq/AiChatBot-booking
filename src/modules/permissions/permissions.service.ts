import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
// import { Staff } from '../StaffType/entities/staff.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      relations: ['roles', 'menus'],
    });
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles', 'menus'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }



  // async getEffectivePermissions(staff: Staff): Promise<Permission[]> {
  //   const staffPermissions = staff.permissions || [];
  //   const rolePermissions = staff.role?.permissions || [];

  //   const combined = [...staffPermissions, ...rolePermissions];
  //   const uniqueMap = new Map<string, Permission>();

  //   for (const perm of combined) {
  //     const key = `${perm.action}:${perm.resource}`;
  //     if (!uniqueMap.has(key)) uniqueMap.set(key, perm);
  //   }

  //   return Array.from(uniqueMap.values());
  // }

  // async hasPermission(
  //   staff: Staff,
  //   action: string,
  //   resource: string,
  // ): Promise<boolean> {
  //   const permissions = await this.getEffectivePermissions(staff);
  //   return permissions.some(p => p.action === action && p.resource === resource);
  // }
  
}
