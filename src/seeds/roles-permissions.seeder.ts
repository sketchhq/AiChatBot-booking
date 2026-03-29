import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';

@Injectable()
export class RolesPermissionsSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seedPermissionsAndRoles();
  }

  async seedPermissionsAndRoles() {
    const permissionsToSeed = [
      { name: 'Create therapist', action: 'create', resource: 'therapist', description: 'Create therapist member' },
      { name: 'View therapist', action: 'read', resource: 'therapist', description: 'View therapist' },
      { name: 'Update therapist', action: 'update', resource: 'therapist', description: 'Update therapist info' },
      { name: 'Delete Statherapistff', action: 'delete', resource: 'therapist', description: 'Delete therapist' },
      { name: 'Create Patient', action: 'create', resource: 'patient', description: 'Create patient record' },
      { name: 'Read Patient', action: 'read', resource: 'patient', description: 'View patient record' },
      { name: 'Update Patient', action: 'update', resource: 'patient', description: 'Update patient record' },
      { name: 'Delete Patient', action: 'delete', resource: 'patient', description: 'Delete patient record' },
      { name: 'Read Appointment', action: 'read', resource: 'appointment', description: 'View appointments' },
      { name: 'Update Appointment', action: 'update', resource: 'appointment', description: 'Update appointments' },
    ];

    const rolesToSeed = ['super-admin', 'branch-admin', 'therapist'];

    for (const perm of permissionsToSeed) {
      const exists = await this.permissionRepo.findOne({
        where: { action: perm.action, resource: perm.resource },
      });

      if (!exists) {
        await this.permissionRepo.save(this.permissionRepo.create({ ...perm, is_active: true }));
      }
    }

    const allPermissions = await this.permissionRepo.find();

    // Define permission assignments by role
    const rolePermissionMap = {
      'super-admin': allPermissions,
      'branch-admin': allPermissions.filter(p =>
        ['read', 'create', 'update'].includes(p.action) &&
        ['therapist', 'patient', 'appointment'].includes(p.resource)
      ),
      'therapist': allPermissions.filter(p =>
        ['read'].includes(p.action) &&
        ['patient'].includes(p.resource)
      ),
    };

    for (const roleName of rolesToSeed) {
      let role = await this.roleRepo.findOne({ where: { name: roleName }, relations: ['permissions'] });

      if (!role) {
        role = this.roleRepo.create({
          name: roleName,
          description: `${roleName} role`,
          is_default: false,
          role_type: roleName,
        });
      }

      // Assign only allowed permissions
      role.permissions = rolePermissionMap[roleName] || [];

      await this.roleRepo.save(role);
    }

    console.log('✅ Roles and permissions seeded dynamically');
  }
}
