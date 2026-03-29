import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { Clinic } from 'src/modules/clinic/entities/clinic.entity';

export enum ConsultationType {
  ONLINE = 'ONLINE',
  CLINIC = 'CLINIC',
  HOME = 'HOME',
}

@Entity({ name: 'vet_clinic_mappings' })
@Unique(['vet', 'clinic'])
export class VetClinicMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vet, (vet) => vet.clinicMappings, { onDelete: 'CASCADE' })
  vet: Vet;

  @ManyToOne(() => Clinic, (clinic) => clinic.vetMappings, { onDelete: 'CASCADE' })
  clinic: Clinic;

  @Column({
    type: 'enum',
    enum: ConsultationType,
    array: true,
    default: [ConsultationType.CLINIC],
  })
  consultation_types: ConsultationType[];

  @Column({ default: false })
  is_primary: boolean;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  commission_override_percentage?: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;



  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
consultation_fee_online?: number;

@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
consultation_fee_clinic?: number;

@Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
consultation_fee_home?: number;
}
