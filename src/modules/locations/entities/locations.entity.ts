import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 32 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  address: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  // ➜ Soft delete flag
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  // ➜ When the record was soft deleted
  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
