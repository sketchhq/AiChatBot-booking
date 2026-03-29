import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { VetAppointment } from 'src/modules/vet_appointments/entities/vet-appointment.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DeleteDateColumn } from 'typeorm';

@Entity('vet_reviews')
@Unique(['appointment'])
export class VetReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vet, (vet) => vet.reviews, { eager: true })
  vet: Vet;

   @ManyToOne(() => VetAppointment, { eager: true })
appointment: VetAppointment;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn()
deleted_at: Date;
}