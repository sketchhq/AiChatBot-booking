import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vet } from '../../vets/entities/vet.entity';

@Entity('appointment_slot_locks')
export class AppointmentSlotLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  appointment_date: string;

  @Column({ type: 'time' })
  slot_start_time: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Vet, (vet) => vet.slot_locks)
  @JoinColumn({ name: 'vet_id' })
  vet: Vet;
}