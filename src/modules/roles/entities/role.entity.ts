import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseModel } from 'src/core/database/BaseModel';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role extends BaseModel {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

    @Column({ type: 'varchar', length: 100, nullable: true }) 
  role_type: string;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  // @ManyToMany(() => User, user => user.roles)
  // users: User[];
}
