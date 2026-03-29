import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vet } from './entities/vet.entity';
import { CreateVetDto } from './dto/create-vet.dto';
import { UpdateVetDto } from './dto/update-vet.dto';
import { VetFilterDto } from './dto/vet-filter.dto';
import { VerificationStatus } from './entities/vet.enums';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import { VetAvailabilityRule } from '../vet_availability_rules/entities/vet-availability-rule.entity';
import { VetBlockedSlot } from '../vet-blocked-slots/entities/vet-blocked-slot.entity';
import { VetAppointment } from '../vet_appointments/entities/vet-appointment.entity';
import { ConsultationType } from '../vet_availability_rules/entities/vet-availability-rule.entity';

@Injectable()
export class VetsService {
  constructor(
    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,

    private readonly fileUploadService: FileUploadService,


      @InjectRepository(VetAvailabilityRule)
  private readonly ruleRepo: Repository<VetAvailabilityRule>,

    @InjectRepository(VetBlockedSlot)
  private readonly blockedRepo: Repository<VetBlockedSlot>,


  @InjectRepository(VetAppointment)
  private readonly appointmentRepo: Repository<VetAppointment>,


  ) {}

  // ✅ CREATE VET PROFILE
async create(
  dto: CreateVetDto,
  userId: string,
  role: string,
  file?: Express.Multer.File,
) {
  if (role !== 'VET') {
    throw new ForbiddenException('Only VET users can create profile');
  }

  const existing = await this.vetRepo.findOne({
    where: { user_id: userId },
  });

  if (existing) {
    throw new BadRequestException('Vet profile already exists');
  }

  let imageUrl: string | null = null;

  if (file) {
    imageUrl = await this.fileUploadService.uploadPublic(
      file,
      'vets/profile',
    );
  }

  const lastVet = await this.vetRepo
  .createQueryBuilder('vet')
  .orderBy('vet.created_at', 'DESC')
  .getOne();

let nextNumber = 1;

if (lastVet?.doctor_id) {
  const lastNumber = parseInt(lastVet.doctor_id.replace('DR', ''));
  nextNumber = lastNumber + 1;
}

const doctorId = `DR${nextNumber.toString().padStart(5, '0')}`;

  const vet = this.vetRepo.create({
    ...dto,
    doctor_id: doctorId,
    user_id: userId,
    profile_image_url: imageUrl,
    verification_status: VerificationStatus.PENDING,
    is_verified: false,
  });

  return this.vetRepo.save(vet);
}

  // ✅ PUBLIC LIST
async findAll(filter: VetFilterDto) {
  const {
    page = 1,
    limit = 10,
    specialization,
    language,
    max_fee,
    user_lat,
    user_lng,
  } = filter;

  const qb = this.vetRepo
    .createQueryBuilder('vet')
    .leftJoinAndSelect('vet.user', 'user')
    .leftJoinAndSelect('vet.clinicMappings', 'mapping')
    .leftJoinAndSelect('mapping.clinic', 'clinic')
    .where('vet.is_active = true')
    .andWhere('vet.verification_status = :status', {
      status: VerificationStatus.APPROVED,
    });

  if (specialization) {
    qb.andWhere('vet.primary_specialization ILIKE :spec', {
      spec: `%${specialization}%`,
    });
  }

  if (language) {
    qb.andWhere(':language = ANY(vet.languages)', { language });
  }

  if (max_fee) {
    qb.andWhere('vet.consultation_fee_online <= :fee', {
      fee: max_fee,
    });
  }

  if (user_lat && user_lng) {
    qb.addSelect(`
      (6371 * acos(
        cos(radians(:lat)) *
        cos(radians(clinic.latitude)) *
        cos(radians(clinic.longitude) - radians(:lng)) +
        sin(radians(:lat)) *
        sin(radians(clinic.latitude))
      ))
    `, 'distance')
      .setParameters({ lat: user_lat, lng: user_lng })
      .orderBy('distance', 'ASC');
  }

  qb.skip((page - 1) * limit).take(limit);

  const { entities: vets, raw } = await qb.getRawAndEntities();

  const formatted = vets.map((vet, index) => {
    const primaryClinic =
      vet.clinicMappings.find(c => c.is_primary) ||
      vet.clinicMappings[0];

    const fees = [
      vet.consultation_fee_online,
      vet.consultation_fee_clinic,
      vet.consultation_fee_home,
    ].filter((f) => f !== null && f !== undefined);

    const minFee = fees.length ? Math.min(...fees) : null;
    const maxFee = fees.length ? Math.max(...fees) : null;

    return {
      id: vet.id,
      doctor_id: vet.doctor_id,
      name: `${vet.user?.first_name || ''} ${vet.user?.last_name || ''}`,
      specialization: vet.primary_specialization,
      rating: Number(vet.rating),
      total_reviews: vet.total_reviews,
      years_of_experience: vet.years_of_experience,
      profile_image: vet.profile_image_url,

      clinic_name: primaryClinic?.clinic?.name || null,
      consultation_types: primaryClinic?.consultation_types || [],

    distance_km: raw[index]?.distance
  ? Number(raw[index].distance)
  : null,

      consultation_fee_range:
        minFee !== null ? `₹${minFee} - ₹${maxFee}` : null,
    };
  });

  return {
    total: vets.length,
    page,
    limit,
    data: formatted,
  };
}


private formatReadable(dateStr: string, time: string) {
  const date = new Date(dateStr);

  const dayName = date.toLocaleDateString('en-IN', {
    weekday: 'long',
  });

  const [hour, minute] = time.split(':');
  const h = parseInt(hour, 10);

  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;

  return `${dayName} ${formattedHour}:${minute} ${ampm}`;
}



async getAvailableSlots(
  vetId: string,
  date: string,
  consultationType: string,
) {
  // ===============================
  // 1️⃣ Validate Consultation Type
  // ===============================
  const normalizedType =
    consultationType.toUpperCase() as ConsultationType;

  if (!Object.values(ConsultationType).includes(normalizedType)) {
    throw new BadRequestException('Invalid consultation type');
  }

  // ===============================
  // 2️⃣ Validate Date
  // ===============================
  const selectedDate = new Date(date);
  if (isNaN(selectedDate.getTime())) {
    throw new BadRequestException(
      'Invalid date format. Use YYYY-MM-DD',
    );
  }

  const dayOfWeek = selectedDate.getDay();

  // ===============================
  // 3️⃣ Find Availability Rule
  // ===============================
  const rule = await this.ruleRepo.findOne({
    where: {
      vet_id: vetId,
      day_of_week: dayOfWeek,
      consultation_type: normalizedType,
      is_active: true,
    },
  });

  if (!rule) {
    return {
      date,
      consultation_type: normalizedType,
      slots: {
        morning: [],
        afternoon: [],
        evening: [],
      },
    };
  }

  // ===============================
  // 4️⃣ Generate Slots From Rule
  // ===============================
  const slots = this.generateSlots(
    rule.start_time,
    rule.end_time,
    rule.slot_duration_minutes,
    rule.break_start,
    rule.break_end,
  );

  const available: { raw: string; readable: string }[] = [];

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  for (const slot of slots) {
    // 🔹 Skip past time if today
    if (date === todayStr && slot.start <= nowTime) {
      continue;
    }

    // ===============================
    // 5️⃣ Check Booked Slots
    // ===============================
    const booked = await this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.vet_id = :vetId', { vetId })
      .andWhere('a.appointment_date = :date', { date })
      .andWhere(
        '(:start < a.slot_end_time AND :end > a.slot_start_time)',
        { start: slot.start, end: slot.end },
      )
      .getOne();

    if (booked) continue;

    // ===============================
    // 6️⃣ Check Blocked Slots
    // ===============================
    const blocked = await this.blockedRepo
      .createQueryBuilder('b')
      .where('b.vet_id = :vetId', { vetId })
      .andWhere('b.blocked_date = :date', { date })
      .andWhere(
        '(:start < b.end_time AND :end > b.start_time)',
        { start: slot.start, end: slot.end },
      )
      .getOne();

    if (blocked) continue;

    // ===============================
    // 7️⃣ Add Available Slot
    // ===============================
    available.push({
      raw: slot.start,
      readable: this.formatReadable(date, slot.start),
    });
  }

  // ===============================
  // 8️⃣ Group Into Sessions
  // ===============================
  const grouped = {
    morning: available.filter(
      (s) => this.toMinutes(s.raw) < 12 * 60,
    ),
    afternoon: available.filter((s) => {
      const m = this.toMinutes(s.raw);
      return m >= 12 * 60 && m < 17 * 60;
    }),
    evening: available.filter(
      (s) => this.toMinutes(s.raw) >= 17 * 60,
    ),
  };

  // ===============================
  // 9️⃣ Final Response
  // ===============================
  return {
    date,
    consultation_type: normalizedType,
    slots: grouped,
  };
}



  // ✅ GET SINGLE
async findOne(id: string) {
  const vet = await this.vetRepo.findOne({
    where: {
      id,
      is_active: true,
      verification_status: VerificationStatus.APPROVED,
    },
    relations: [
      'user',
      'clinicMappings',
      'clinicMappings.clinic',
      'educations', // added
    ],
  });

  if (!vet) throw new NotFoundException('Vet not found');

  const nextAvailable = await this.getNextAvailable(id);

return {
  id: vet.id,
  doctor_id: vet.doctor_id,
  name: `${vet.user?.first_name} ${vet.user?.last_name}`,
  profile_image: vet.profile_image_url,
  primary_specialization: vet.primary_specialization,
  years_of_experience: vet.years_of_experience,
  rating: vet.rating,
  total_reviews: vet.total_reviews,
  bio: vet.bio,
  languages: vet.languages,

  education:
    vet.educations?.map((edu) => ({
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      period: `${edu.start_year} - ${edu.end_year}`,
    })) ?? [],

  consultation_fee: {
    online: vet.consultation_fee_online,
    clinic: vet.consultation_fee_clinic,
    home: vet.consultation_fee_home,
    currency: vet.currency,
  },

  clinics:
    vet.clinicMappings?.map((mapping) => ({
      id: mapping.clinic?.id,
      name: mapping.clinic?.name,
      city: mapping.clinic?.city,
      state: mapping.clinic?.state,
      address: mapping.clinic?.address,

      photos: mapping.clinic?.photos ?? [], // ✅ clinic photos

      consultation_types: mapping.consultation_types,
      is_primary: mapping.is_primary,
    })) ?? [],

  next_available: nextAvailable,
};
}

  //  UPDATE OWN PROFILE
  async update(id: string, dto: UpdateVetDto, userId: string, role: string) {
    const vet = await this.getVetEntity(id);

    if (role !== 'ADMIN' && vet.user_id !== userId) {
      throw new ForbiddenException('You can update only your profile');
    }

    await this.vetRepo.update(id, dto);
    return this.findOne(id);
  }

  // ✅ SOFT DELETE
  async remove(id: string, userId: string, role: string) {
    const vet = await this.getVetEntity(id);

    if (role !== 'ADMIN' && vet.user_id !== userId) {
      throw new ForbiddenException('You can delete only your profile');
    }

    return this.vetRepo.update(id, { is_active: false });
  }

  // ✅ ADMIN VERIFY
  async verify(id: string, status: VerificationStatus, role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can verify');
    }

    return this.vetRepo.update(id, {
      verification_status: status,
      is_verified: status === VerificationStatus.APPROVED,
    });
  }




  async updateProfileImage(
  id: string,
  file: Express.Multer.File,
  userId: string,
  role: string,
) {
  const vet = await this.getVetEntity(id);

  if (role !== 'ADMIN' && vet.user_id !== userId) {
    throw new ForbiddenException('Not allowed');
  }

  if (!file) {
    throw new BadRequestException('Image required');
  }

  // Delete old image
  if (vet.profile_image_url) {
    const key = vet.profile_image_url.replace(
      /^https?:\/\/[^/]+\//,
      '',
    );
    await this.fileUploadService.deleteFile(key);
  }

  const imageUrl = await this.fileUploadService.uploadPublic(
    file,
    'vets/profile',
  );

  vet.profile_image_url = imageUrl;

  return this.vetRepo.save(vet);
}


private async getVetEntity(id: string): Promise<Vet> {
  const vet = await this.vetRepo.findOne({
    where: { id },
  });

  if (!vet) {
    throw new NotFoundException('Vet not found');
  }

  return vet;
}









private formatTime(time: string) {
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
}

private getSession(time: string) {
  const hour = parseInt(time.split(':')[0]);

  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}



async getNextAvailable(vetId: string) {
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);

    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const rule = await this.ruleRepo.findOne({
      where: {
        vet_id: vetId,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    });

    if (!rule) continue;

    const slots = this.generateSlots(
      rule.start_time,
      rule.end_time,
      rule.slot_duration_minutes,
      rule.break_start,
      rule.break_end,
    );

    for (const slot of slots) {
      if (i === 0 && slot.start <= now.toTimeString().slice(0, 5)) {
        continue;
      }

      const isBooked = await this.appointmentRepo
        .createQueryBuilder('a')
        .where('a.vet_id = :vetId', { vetId })
        .andWhere('a.appointment_date = :date', { date: dateStr })
        .andWhere(
          '(:start < a.slot_end_time AND :end > a.slot_start_time)',
          { start: slot.start, end: slot.end },
        )
        .getOne();

      if (isBooked) continue;

    const isBlocked = await this.blockedRepo
  .createQueryBuilder('b')
  .where('b.vet_id = :vetId', { vetId })
  .andWhere('b.blocked_date = :date', { date: dateStr })
  .andWhere(
    '(:start < b.end_time AND :end > b.start_time)',
    { start: slot.start, end: slot.end },
  )
  .getOne();

      if (isBlocked) continue;

   return {
  date: dateStr,
  time: this.formatTime(slot.start),
  // session: this.getSession(slot.start),
};
    }
  }

  return null;
}

private generateSlots(
  start: string,
  end: string,
  duration: number,
  breakStart?: string,
  breakEnd?: string,
) {
  const slots = [];
  let current = this.toMinutes(start);
  const endMinutes = this.toMinutes(end);

  while (current + duration <= endMinutes) {
    const slotStart = this.toTime(current);
    const slotEnd = this.toTime(current + duration);

    if (
      breakStart &&
      breakEnd &&
      this.toMinutes(slotStart) >= this.toMinutes(breakStart) &&
      this.toMinutes(slotStart) < this.toMinutes(breakEnd)
    ) {
      current += duration;
      continue;
    }

    slots.push({ start: slotStart, end: slotEnd });
    current += duration;
  }

  return slots;
}

private toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

private toTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}`;
}

}
