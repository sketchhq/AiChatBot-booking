import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { VetClinicMapping } from 'src/modules/vet-clinic-mapping/entities/vet-clinic-mapping.entity';

@Entity({ name: 'clinics' })
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  pincode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ default: false })
  is_deleted: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;



  @OneToMany(() => VetClinicMapping, (mapping) => mapping.clinic)
  vetMappings: VetClinicMapping[];



  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;



  @Column('text', { array: true, nullable: true })
  photos?: string[];

}
