import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetReview } from './entities/vet-review.entity';
import { CreateVetReviewDto } from './dto/create-vet-review.dto';
import { UpdateVetReviewDto } from './dto/update-vet-review.dto';
import { VetAppointment } from '../vet_appointments/entities/vet-appointment.entity';
import { Vet } from 'src/modules/vets/entities/vet.entity';

@Injectable()
export class VetReviewsService {
  constructor(
    @InjectRepository(VetReview)
    private reviewRepo: Repository<VetReview>,

   @InjectRepository(VetAppointment)
private appointmentRepo: Repository<VetAppointment>,

    @InjectRepository(Vet)
    private vetRepo: Repository<Vet>,
  ) {}

  async create(dto: CreateVetReviewDto, user: any) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: dto.appointment_id },
      relations: ['vet', 'user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.user.id !== user.id) {
      throw new ForbiddenException('You cannot review this appointment');
    }

    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Appointment not completed');
    }

    const exists = await this.reviewRepo.findOne({
      where: { appointment: { id: dto.appointment_id } },
    });

    if (exists) {
      throw new BadRequestException('Review already submitted');
    }

    const review = this.reviewRepo.create({
      rating: dto.rating,
      comment: dto.comment,
      appointment,
      vet: appointment.vet,
      user,
    });

    await this.reviewRepo.save(review);

    await this.updateVetRating(appointment.vet.id);

    return review;
  }

  async update(id: string, dto: UpdateVetReviewDto, user: any) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'vet'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user.id !== user.id) {
      throw new ForbiddenException('Unauthorized');
    }

    Object.assign(review, dto);
    await this.reviewRepo.save(review);

    await this.updateVetRating(review.vet.id);

    return review;
  }

  async findByVet(vet_id: string) {

  const reviews = await this.reviewRepo.find({
    where: { vet: { id: vet_id } },
    relations: ['user'],
    order: { created_at: 'DESC' }
  });

  return reviews.map(r => ({
    review_id: r.id,
    rating: r.rating,
    comment: r.comment,
    user_name: `${r.user.first_name} ${r.user.last_name}`,
    created_at: r.created_at
  }));

}

  private async updateVetRating(vetId: string) {

  const result = await this.reviewRepo
    .createQueryBuilder('review')
    .select('COUNT(review.id)', 'total')
    .addSelect('AVG(review.rating)', 'avg')
    .where('review.vetId = :vetId', { vetId })
    .getRawOne();

  const total = Number(result.total);
  const avg = Number(result.avg || 0);

  await this.vetRepo.update(vetId, {
    rating: Number(avg.toFixed(1)),
    total_reviews: total,
  });

}

  async deleteReview(id: string, user: any) {
  const review = await this.reviewRepo.findOne({
    where: { id },
    relations: ['user', 'vet'],
  });

  if (!review) {
    throw new NotFoundException('Review not found');
  }

  // Only owner can delete
  if (review.user.id !== user.id) {
    throw new ForbiddenException('Unauthorized');
  }

  // Soft delete
  await this.reviewRepo.softDelete(id);

  // Update vet rating after delete
  await this.updateVetRating(review.vet.id);

  return { message: 'Review deleted successfully' };
}
}