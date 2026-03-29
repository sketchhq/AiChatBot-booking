import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { VetAppointment } from 'src/modules/vet_appointments/entities/vet-appointment.entity';
export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
}

@Entity('vet_payouts')
export class VetPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vet_id: string;

  @Column({ type: 'uuid' })
  appointment_id: string;

  @ManyToOne(() => Vet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vet_id' })
  vet: Vet;

  @ManyToOne(() => VetAppointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: VetAppointment;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  gross_amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  platform_commission: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  net_amount: number;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  payout_status: PayoutStatus;

  @Column({ type: 'timestamptz', nullable: true })
  processed_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}