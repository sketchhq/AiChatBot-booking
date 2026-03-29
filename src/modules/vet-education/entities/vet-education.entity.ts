import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vet } from 'src/modules/vets/entities/vet.entity';

@Entity('vet_education')
export class VetEducation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  degree: string;

  @Column({ length: 255 })
  institution: string;

  @Column({ type: 'int' })
  start_year: number;

  @Column({ type: 'int' })
  end_year: number;

  @ManyToOne(() => Vet, (vet) => vet.educations, {
    onDelete: 'CASCADE',
  })
  vet: Vet;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}