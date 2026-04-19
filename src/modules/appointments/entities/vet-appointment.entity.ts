
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED', //#
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AppointmentPaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}


import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Vet } from '../../vets/entities/vet.entity';
import { Clinic } from 'src/modules/clinic/entities/clinic.entity';
import { ConsultationType } from 'src/modules/vet_availability_rules/entities/vet-availability-rule.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* ================================
      FOREIGN KEYS (FIXED UUID)
  ================================ */

  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  pet_id?: string;

  @Column({ type: 'varchar', length: 20, default: 'HUMAN' })
  patient_type: string;

  @Column('uuid')
  vet_id: string;

  @Column('uuid', { nullable: true })
  clinic_id: string;

  /* ================================
      RELATIONS
  ================================ */

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;


  @ManyToOne(() => Vet)
  @JoinColumn({ name: 'vet_id' })
  vet: Vet;

  @ManyToOne(() => Clinic, { nullable: true })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ type: 'text', nullable: true })
  symptoms?: string;



  @Column('text', { array: true, nullable: true })
  symptom_media_urls?: string[];

  /* ================================
      OTHER FIELDS
  ================================ */

  @Column({
    type: 'enum',
    enum: ConsultationType,
  })
  consultation_type: ConsultationType;


  @Column({ type: 'date' })
  appointment_date: string;

  @Column({ type: 'time' })
  slot_start_time: string;

  @Column({ type: 'time' })
  slot_end_time: string;

  @Column({ default: 30 })
  duration_minutes: number;
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: AppointmentPaymentStatus,
    default: AppointmentPaymentStatus.PENDING,
  })
  payment_status: AppointmentPaymentStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  paid_amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: 'ONLINE' })
  payment_type: string;

  @Column({ unique: true })
  appointment_code: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;


  @Column('uuid', { nullable: true })
  address_id: string;

  @ManyToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;


  @Column({ type: 'text', nullable: true })
  doctor_notes: string;

  @Column({ nullable: true })
  prescription_url: string;

  @Column({ nullable: true })
  treatment_plan_url: string;

  @Column({ nullable: true })
  invoice_url: string;

  @Column({ type: 'int', nullable: true })
  session_duration: number;

  @Column({ nullable: true })
  appointment_type: string;

}