import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from './vet.enums';
import { User } from 'src/modules/users/entities/user.entity';
import { VetClinicMapping } from 'src/modules/vet-clinic-mapping/entities/vet-clinic-mapping.entity';
import { AppointmentSlotLock } from 'src/modules/appointment_slot_locks/entities/appointment-slot-lock.entity';
import { VetEducation } from 'src/modules/vet-education/entities/vet-education.entity';
import { VetReview } from 'src/modules/vet-reviews/entities/vet-review.entity';


@Entity('vets')
@Index(['user_id'])
export class Vet {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  doctor_id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty()
  @Column({ length: 128 })
  registration_number: string;

  @ApiProperty()
  @Column({ length: 128 })
  council_name: string;

  @ApiProperty()
  @Column({ type: 'int' })
  years_of_experience: number;

  @ApiProperty()
  @Column({ length: 128 })
  primary_specialization: string;

  @ApiProperty({ type: [String] })
  @Column('text', { array: true, nullable: true })
  secondary_specializations: string[];

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  profile_image_url: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  consultation_fee_online: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  consultation_fee_clinic: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  consultation_fee_home: number;

  @Column({ length: 8, default: 'INR' })
  currency: string;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  total_reviews: number;

  @Column({ default: 0 })
  total_consultations: number;

  @Column('text', { array: true, nullable: true })
  languages: string[];

  @Column({ default: false })
  is_verified: boolean;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verification_status: VerificationStatus;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => VetClinicMapping, (mapping) => mapping.vet)
clinicMappings: VetClinicMapping[];

@OneToMany(() => AppointmentSlotLock, (slot) => slot.vet)
slot_locks: AppointmentSlotLock[];

@Column('text', { array: true, nullable: true })
services_offered: string[];

@OneToMany(() => VetEducation, (edu) => edu.vet)
educations: VetEducation[];

 @OneToMany(() => VetReview, (review) => review.vet)
reviews: VetReview[];
}
