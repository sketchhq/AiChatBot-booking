import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('vet_blocked_slots')
@Index(['vet_id', 'blocked_date'])
@Index(['vet_id', 'blocked_date', 'start_time'])
export class VetBlockedSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  vet_id: string;

  @Column({ type: 'date' })
  blocked_date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
