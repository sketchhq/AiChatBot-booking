import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Vet } from '../../vets/entities/vet.entity';
import { Clinic } from 'src/modules/clinic/entities/clinic.entity';

export enum ConsultationType {
  ONLINE = 'ONLINE',
  CLINIC = 'CLINIC',
  HOME = 'HOME',
}

@Entity('vet_availability_rules')
export class VetAvailabilityRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vet_id: string;

  @ManyToOne(() => Vet)
  @JoinColumn({ name: 'vet_id' })
  vet: Vet;

  // ✅ nullable true
  @Column({ type: 'uuid', nullable: true })
  clinic_id: string | null;

  @ManyToOne(() => Clinic, { nullable: true })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({
    type: 'enum',
    enum: ConsultationType,
  })
  consultation_type: ConsultationType;

  @Column({ type: 'int' })
  day_of_week: number;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'int' })
  slot_duration_minutes: number;

  @Column({ type: 'time', nullable: true })
  break_start: string;

  @Column({ type: 'time', nullable: true })
  break_end: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}