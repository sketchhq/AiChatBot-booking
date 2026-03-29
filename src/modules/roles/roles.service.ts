import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permission_ids, ...roleData } = createRoleDto;
    const role = this.roleRepository.create(roleData);

    if (permission_ids && permission_ids.length > 0) {
      const permissions = await Promise.all(
        permission_ids.map(id => this.permissionsService.findOne(id))
      );
      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['permissions', 'users'],
    });
  }

  async findOne(id:  number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { permission_ids, ...roleData } = updateRoleDto;
    const role = await this.findOne(id);

    if (permission_ids) {
      const permissions = await Promise.all(
        permission_ids.map(id => this.permissionsService.findOne(id))
      );
      role.permissions = permissions;
    }

    Object.assign(role, roleData);
    return await this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
