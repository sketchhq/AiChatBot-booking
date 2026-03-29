import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
UpdateDateColumn,
ManyToOne,
JoinColumn,
Index,
} from 'typeorm';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { VetDocumentType,DocumentVerificationStatus } from './enums/vet-document.enums';


@Entity('vet_documents')
@Index(['vet_id'])
export class VetDocument {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ type: 'uuid' })
vet_id: string;

@ManyToOne(() => Vet, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'vet_id' })
vet: Vet;

@Column({
type: 'varchar',
length: 64,
})
document_type: VetDocumentType;

@Column({ type: 'text' })
file_url: string;

@Column({
type: 'varchar',
length: 32,
default: DocumentVerificationStatus.PENDING,
})
verification_status: DocumentVerificationStatus;

// ADMIN USER ID
@Column({ type: 'uuid', nullable: true })
verified_by: string;

@ManyToOne(() => User, { nullable: true })
@JoinColumn({ name: 'verified_by' })
verifiedBy: User;

@Column({ type: 'timestamptz', nullable: true })
verified_at: Date;

@Column({ default: false })
is_deleted: boolean;

@CreateDateColumn()
created_at: Date;

@UpdateDateColumn()
updated_at: Date;
}
