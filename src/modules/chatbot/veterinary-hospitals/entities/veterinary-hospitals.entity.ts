import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('veterinary_hospitals')
export class VeterinaryHospital {
  @PrimaryGeneratedColumn({ name: 'hospital_id' })
  hospital_id: number;

  @Column()
  hospital_name: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  area: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  //@Column({ type: 'text', nullable: true })
  //email: string;

  @Column({ type: 'text', array: true, nullable: true })
  services: string[];   // vaccination, surgery, grooming etc

  @Column({ default: false })
  emergency_available: boolean;

  @Column({ type: 'time', nullable: true })
  opening_time: string;

  @Column({ type: 'time', nullable: true })
  closing_time: string;

  @Column({ type: 'text', nullable: true })
  working_days: string;  // Mon-Sat or JSON if needed

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating: number;

  @Column({ nullable: true })
  google_maps_link: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}