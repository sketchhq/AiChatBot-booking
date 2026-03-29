import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'app_languages' })
export class AppLanguage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'language_name', type: 'varchar', length: 255 })
  language_name: string;

  @Column({ name: 'language_description', type: 'text', nullable: true })
  language_description?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
