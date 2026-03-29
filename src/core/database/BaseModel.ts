import {
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'boolean', default: true, select: true })
  is_active!: boolean;

  @Column({ type: 'boolean', default: false, select: false })
  is_deleted!: boolean;

  @CreateDateColumn({ type: 'timestamp', select: true })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', select: false })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, select: false })
  deleted_at!: Date;
}
