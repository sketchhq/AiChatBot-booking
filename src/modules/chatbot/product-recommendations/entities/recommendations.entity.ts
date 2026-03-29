import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('product_recommendations')
export class ProductRecommendation {
  @PrimaryGeneratedColumn()
  id: number;

  // title instead of name
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  category: string;

  @Column()
  pet_type: string; // dog, cat, etc

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  product_url: string;

  @Column({ type: 'text', array: true, nullable: true })
  image_urls: string[];

  @Column({ type: 'text', array: true, nullable: true })
  keywords: string[];

  @CreateDateColumn()
  created_at: Date;
}