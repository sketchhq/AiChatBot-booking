import {
  Injectable,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VetAppointment } from './entities/vet-appointment.entity';
import { CreateVetAppointmentDto } from './dto/create-vet-appointment.dto';
import { UpdateVetAppointmentDto } from './dto/update-vet-appointment.dto';
import { AppointmentPaymentStatus, AppointmentStatus } from './entities/vet-appointment.entity';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import { Vet } from '../vets/entities/vet.entity';
import { VetAvailabilityRule } from '../vet_availability_rules/entities/vet-availability-rule.entity';
import { Address } from '../addresses/entities/address.entity';
import { add } from 'date-fns';

@Injectable()
export class VetAppointmentsService {
  constructor(
    @InjectRepository(VetAppointment)
    private readonly repo: Repository<VetAppointment>,

    @InjectRepository(Vet)
    private readonly vetRepo: Repository<Vet>,

    @InjectRepository(VetAvailabilityRule)
    private readonly availabilityRepo: Repository<VetAvailabilityRule>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,


    private fileUploadService: FileUploadService,



  ) { }

  /* =====================================================
     🔥 HELPER FUNCTIONS (NEW)
 ===================================================== */

  /** ✅ AM / PM */
  private getAmPm(time: string) {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 12 ? 'PM' : 'AM';
  }

  /** ✅ Morning / Afternoon / Evening */
  private getSession(time: string) {
    const hour = parseInt(time.split(':')[0]);

    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  /** ✅ Next availability */
  private async getNextAvailability(vetId: string) {
    const today = new Date().toISOString().split('T')[0];

    const next = await this.repo
      .createQueryBuilder('appointment')
      .where('appointment.vet_id = :vetId', { vetId })
      .andWhere('appointment.appointment_date > :today', {
        today,
      })
      .orderBy('appointment.appointment_date', 'ASC')
      .getOne();

    return next
      ? `${next.appointment_date} ${next.slot_start_time}`
      : null;
  }



  /* =========================================
   AUTO GENERATE APPOINTMENT CODE
========================================= */
  private async generateAppointmentCode() {
    const last = await this.repo
      .createQueryBuilder('appointment')
      .orderBy('appointment.created_at', 'DESC')
      .getOne();

    let nextNumber = 1;

    if (last && last.appointment_code) {

      const match = last.appointment_code.match(/\d+/);

      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }
    return `PA#${String(nextNumber).padStart(3, '0')}`;
  }
  /* =========================================
      CREATE APPOINTMENT
  ========================================= */
  async create(dto: CreateVetAppointmentDto, user: any, files?: Express.Multer.File[]) {
    /** ✔ CUSTOMER ONLY */
    if (user.role !== 'CUSTOMER') {
      throw new ForbiddenException(
        'Only customers can book appointments',
      );
    }

    /** ✔ Date validation */
    const today = new Date().toISOString().split('T')[0];
    if (dto.appointment_date < today) {
      throw new BadRequestException(
        'Appointment date must be future',
      );
    }

    // ✅ Convert appointment date → day_of_week
    const dayOfWeek = new Date(dto.appointment_date).getDay();

    /** ✔ Time validation */
    if (dto.slot_end_time <= dto.slot_start_time) {
      throw new BadRequestException(
        'Invalid slot time range',
      );
    }


    /** ✔ ONLINE consultation validation */
    if (dto.consultation_type !== 'ONLINE') {

      if (dto.symptoms) {
        throw new BadRequestException(
          'Symptoms are allowed only for ONLINE consultation',
        );
      }

      if (files && files.length > 0) {
        throw new BadRequestException(
          'Symptom media upload allowed only for ONLINE consultation',
        );
      }


    }

    /* 🔥 HOME CONSULTATION ADDRESS VALIDATION */
    if (dto.consultation_type === 'HOME' && !dto.address_id) {
      throw new BadRequestException(
        'Address is required for home visit consultation',
      );
    }


    const vet = await this.vetRepo.findOne({
      where: { id: dto.vet_id },
    });

    if (!vet) {
      throw new BadRequestException('Vet not found');
    }

    const feeMap = {
      ONLINE: vet.consultation_fee_online,
      CLINIC: vet.consultation_fee_clinic,
      HOME: vet.consultation_fee_home,
    };

    const price = Number(feeMap[dto.consultation_type] ?? 0);


    const rule = await this.availabilityRepo.findOne({
      where: {
        vet_id: dto.vet_id,
        consultation_type: dto.consultation_type,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    });

    if (!rule) {
      throw new BadRequestException(
        'Vet is not available on selected day',
      );
    }

    const durationMinutes = rule.slot_duration_minutes;



    /* 🔥 SLOT DURATION VALIDATION */
    const start = new Date(`1970-01-01T${dto.slot_start_time}`);
    const end = new Date(`1970-01-01T${dto.slot_end_time}`);

    const minutes = (end.getTime() - start.getTime()) / 60000;

    if (minutes !== durationMinutes) {
      throw new BadRequestException(
        `Slot must be ${durationMinutes} minutes`,
      );
    }

    /** ✔ Slot conflict check */
    const conflict = await this.repo
      .createQueryBuilder('appointment')
      .where('appointment.vet_id = :vet_id', { vet_id: dto.vet_id })
      .andWhere('appointment.appointment_date = :date', {
        date: dto.appointment_date,
      })
      .andWhere('appointment.status != :cancelled', {
        cancelled: AppointmentStatus.CANCELLED,
      })
      .andWhere(
        '(:start < appointment.slot_end_time AND :end > appointment.slot_start_time)',
        {
          start: dto.slot_start_time,
          end: dto.slot_end_time,
        },
      )
      .getOne();

    if (conflict) {
      throw new ConflictException(
        'This slot is already booked',
      );
    }

    const appointmentCode = await this.generateAppointmentCode();


    /** ✔ Upload symptom media (optional) */
    const mediaUrls: string[] = [];

    if (
      dto.consultation_type === 'ONLINE' &&
      files &&
      files.length > 0
    ) {

      for (const file of files) {

        const url = await this.fileUploadService.uploadPublic(
          file,
          'appointments/symptoms',
        );

        mediaUrls.push(url);
      }

    }


    let address = null;

    if (dto.consultation_type === 'HOME') {

      address = await this.addressRepo.findOne({
        where: {
          id: dto.address_id,
          user_id: user.sub,
          is_deleted: false,
        },
      });

      if (!address) {
        throw new BadRequestException('Invalid address selected');
      }
    }


    const appointment = this.repo.create({
      ...dto,
      appointment_code: appointmentCode,
      user_id: user.sub,
      address_id: dto.consultation_type === 'HOME' ? dto.address_id : null,
      appointment_type: dto.appointment_type ?? 'Consultation',
      //status: AppointmentStatus.PENDING,
      status: AppointmentStatus.CONFIRMED,
      // ? AppointmentStatus.CONFIRMED
      //  ? AppointmentStatus.PENDING
      //  : AppointmentStatus.CONFIRMED,

      payment_status: AppointmentPaymentStatus.PENDING,
      paid_amount: 0,
      price: price,
      duration_minutes: durationMinutes,

      symptom_media_urls: mediaUrls,
    });

    return this.repo.save(appointment);
  }

  /* =========================================
      MY APPOINTMENTS
  ========================================= */
  async findMyAppointments(user: any, status?: string, type?: string, petId?: string) {

    const qb = this.repo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.pet', 'pet')
      .leftJoinAndSelect('appointment.vet', 'vet')
      .leftJoinAndSelect('appointment.clinic', 'clinic')
      .leftJoinAndSelect('appointment.address', 'address')
      .where('appointment.user_id = :userId::uuid', {
        userId: user.sub,
      });

    if (status) {
      qb.andWhere('appointment.status = :status', { status });
    }

    if (type) {
      qb.andWhere('appointment.consultation_type = :type', { type });
    }

    if (petId) {
      qb.andWhere('appointment.pet_id = :petId::uuid', { petId });
    }

    qb.orderBy('appointment.appointment_date', 'DESC');

    const appointments = await qb.getMany();

    return appointments.map((appointment) => ({
      ...appointment,
      service:
        appointment.vet_id ? 'Vet Visit' : 'Caretaking',
    }));
  }


  async getClinicPaymentPage(id: string, user: any) {
    const appointment = await this.repo.findOne({
      where: { id },
      relations: [
        'user',
        'pet',
        'vet',
        'vet.user',
        'clinic',
      ],
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    if (appointment.user_id !== user.sub) {
      throw new ForbiddenException();
    }

    const consultationFee = appointment.price ?? 500;
    const gst = consultationFee * 0.18;
    const spotProtectionFee = 50;

    return {
      appointment: {
        id: appointment.id,
        consultation_type: appointment.consultation_type,
        appointment_type: appointment.appointment_type,
        date: appointment.appointment_date,
        start_time: appointment.slot_start_time,
        end_time: appointment.slot_end_time,
        duration: appointment.duration_minutes,
        am_pm: this.getAmPm(appointment.slot_start_time),
        session: this.getSession(
          appointment.slot_start_time,
        ),
        status: appointment.status,
        payment_status: appointment.payment_status,
      },

      user: {
        id: appointment.user?.id,
        first_name: appointment.user?.first_name,
        last_name: appointment.user?.last_name,
        phone: appointment.user?.phone,
      },

      vet: {
        id: appointment.vet?.id,
        name: `${appointment.vet?.user?.first_name ?? ''} ${appointment.vet?.user?.last_name ?? ''}`,
        specialization:
          appointment.vet?.primary_specialization,
      },


      clinic: appointment.clinic,

      next_available: await this.getNextAvailability(
        appointment.vet_id,
      ),

      payment: {
        consultationFee,
        gst,
        spotProtectionFee,
        payableAtClinic:
          consultationFee - spotProtectionFee,
        payableNow: spotProtectionFee,
      },
    };
  }


  async getOnlinePaymentPage(id: string, user: any) {
    const appointment = await this.repo.findOne({
      where: { id },
      relations: [
        'user',
        'pet',
        'vet',
        'vet.user',
        'clinic',
      ],
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    if (appointment.user_id !== user.sub) {
      throw new ForbiddenException();
    }

    const consultationFee = appointment.price ?? 500;
    const gst = consultationFee * 0.18;
    const platformDiscount = 25.51;
    const couponDiscount = 100;

    const total =
      consultationFee + gst - platformDiscount - couponDiscount;

    return {
      appointment: {
        id: appointment.id,
        consultation_type: appointment.consultation_type,
        appointment_type: appointment.appointment_type,
        date: appointment.appointment_date,
        start_time: appointment.slot_start_time,
        end_time: appointment.slot_end_time,
        duration: appointment.duration_minutes,
        am_pm: this.getAmPm(appointment.slot_start_time),
        session: this.getSession(
          appointment.slot_start_time,
        ),
        status: appointment.status,
        payment_status: appointment.payment_status,
      },

      user: {
        id: appointment.user?.id,
        first_name: appointment.user?.first_name,
        last_name: appointment.user?.last_name,
        phone: appointment.user?.phone,
      },

      vet: {
        id: appointment.vet?.id,
        name: `${appointment.vet?.user?.first_name ?? ''} ${appointment.vet?.user?.last_name ?? ''}`,
        specialization:
          appointment.vet?.primary_specialization,
        experience: appointment.vet?.years_of_experience,
      },


      clinic: appointment.clinic,

      /** Only ONLINE */
      symptoms:
        appointment.consultation_type === 'ONLINE'
          ? appointment.symptoms
          : null,

      next_available: await this.getNextAvailability(
        appointment.vet_id,
      ),

      payment: {
        consultationFee,
        gst,
        platformDiscount,
        couponDiscount,
        total,
      },
    };
  }

  /* =========================================
      UPDATE APPOINTMENT
  ========================================= */
  async update(
    id: string,
    dto: UpdateVetAppointmentDto,
    user: any,
  ) {
    const appointment = await this.repo.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new ConflictException(
        'Appointment not found',
      );
    }

    /** ✔ Only owner */
    if (appointment.user_id !== user.sub) {
      throw new ForbiddenException(
        'Unauthorized',
      );
    }

    /** ✔ Prevent editing after completion */
    if (
      appointment.status === 'COMPLETED' ||
      appointment.status === 'CANCELLED'
    ) {
      throw new BadRequestException(
        'Cannot update completed or cancelled appointment',
      );
    }

    /** ✔ Time validation if updating */
    if (
      dto.slot_end_time &&
      dto.slot_start_time &&
      dto.slot_end_time <= dto.slot_start_time
    ) {
      throw new BadRequestException(
        'Invalid slot time',
      );
    }

    Object.assign(appointment, dto);
    return this.repo.save(appointment);
  }

  /* =========================================
      CANCEL
  ========================================= */
  async cancel(id: string, user: any) {
    const appointment = await this.repo.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new ConflictException(
        'Appointment not found',
      );
    }

    if (appointment.user_id !== user.sub) {
      throw new ForbiddenException(
        'Unauthorized',
      );
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException(
        'Already cancelled',
      );
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot cancel completed appointment',
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return this.repo.save(appointment);
  }



  async findVetAppointments(
    user: any,
    status?: string,
    filter?: string,
  ) {

    const qb = this.repo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.pet', 'pet')
      .leftJoinAndSelect('pet.photos', 'petPhotos')
      .leftJoinAndSelect('appointment.clinic', 'clinic')
      .leftJoinAndSelect('appointment.address', 'address')
      .leftJoin('appointment.vet', 'vet')
      .where('vet.user_id = :userId', { userId: user.sub });

    if (status) {
      qb.andWhere('appointment.status = :status', { status });
    }

    const today = new Date().toISOString().split('T')[0];

    if (filter === 'TODAY') {
      qb.andWhere('appointment.appointment_date = :today', { today });
    }

    if (filter === 'UPCOMING') {
      qb.andWhere('appointment.appointment_date > :today', { today });
    }

    const appointments = await qb
      .orderBy('appointment.appointment_date', 'DESC')
      .addOrderBy('appointment.slot_start_time', 'ASC')
      .getMany();

    const statusMap = {
      CONFIRMED: 'Active',
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };

    const modeMap = {
      ONLINE: 'Online',
      CLINIC: 'Clinic',
      HOME: 'Home Visit'
    };

    return {
      total: appointments.length,
      data: appointments.map(a => {


        return {
          id: a.id,

          appointment_id: a.appointment_code,

          patient: {
            id: a.user?.id,
            name: `${a.user?.first_name ?? ''} ${a.user?.last_name ?? ''}`.trim(),
            phone: a.user?.phone ?? null
          },

          consultation_mode: modeMap[a.consultation_type],
          appointment_type: a.appointment_type ?? 'Consultation',

          schedule: {
            date: new Date(a.appointment_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            start_time: this.formatTime(a.slot_start_time),
            end_time: this.formatTime(a.slot_end_time),
            duration_minutes: a.duration_minutes
          },

          location: {
            clinic: a.clinic?.name ?? null,
            address: a.address
              ? `${a.address.line1}, ${a.address.city}, ${a.address.state}`
              : null
          },

          status: statusMap[a.status],

          payment: {
            status: a.payment_status,
            amount: a.price,
            paid_amount: a.paid_amount,
            currency: a.currency
          },

          created_at: a.created_at
        };
      })
    };
  }

  /* =========================================
     COMPLETE CONSULTATION (VET ONLY)
  ========================================= */

  async completeConsultation(id: string, vetUser: any) {

    const appointment = await this.repo.findOne({
      where: { id },
      relations: ['vet'],
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    /** Only vet can complete consultation */
    if (appointment.vet?.user_id !== vetUser.sub) {
      throw new ForbiddenException('Only vet can complete consultation');
    }

    /** Already completed check */
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Consultation already completed');
    }

    /** Update status */
    appointment.status = AppointmentStatus.COMPLETED;

    /** Payment completed */
    appointment.payment_status = AppointmentPaymentStatus.PAID;

    return this.repo.save(appointment);
  }

  //##
  async getAppointmentSummary(id: string, user: any) {
    const appointment = await this.repo.findOne({
      where: { id },
      relations: ['vet', 'vet.user', 'clinic', 'pet', 'address'],
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    if (appointment.user_id !== user.sub) {
      throw new ForbiddenException();
    }

    const total = Number(appointment.price || 0);
    const paid = Number(appointment.paid_amount || 0);
    const remaining = total - paid;

    const response: any = {
      confirmation_id: `BK-${appointment.id.slice(0, 6)}`,

      consultation_type: appointment.consultation_type,
      appointment_type: appointment.appointment_type,

      appointment_status: appointment.status,

      slot: {
        date: appointment.appointment_date,
        start_time: appointment.slot_start_time,
        end_time: appointment.slot_end_time,
      },

      vet: {
        id: appointment.vet?.id ?? null,
        name: `${appointment.vet?.user?.first_name ?? ''} ${appointment.vet?.user?.last_name ?? ''}`.trim(),
        specialization: appointment.vet?.primary_specialization ?? null,
        experience: appointment.vet?.years_of_experience ?? 0,
        image: appointment.vet?.profile_image_url ?? null,
        bio: appointment.vet?.bio ?? null,
      },

      clinic: appointment.clinic ?? null,

      address: appointment.address ?? null,

      payment: {
        total_amount: total,
        paid_amount: paid,
        remaining_amount: remaining,
        payment_status: appointment.payment_status,
      },

      show_invoice_download:
        appointment.payment_status === AppointmentPaymentStatus.PAID,
    };

    // 🔥 Add join button ONLY for ONLINE consultation
    if (appointment.consultation_type === 'ONLINE') {
      response.show_join_button =
        appointment.payment_status === AppointmentPaymentStatus.PAID;
    }

    return response;
  }


  async getAppointmentDetails(id: string, user: any) {

    // 🔐 Only vet
    if (user.role !== 'VET') {
      throw new ForbiddenException('Only vet can access');
    }

    const appointment = await this.repo.findOne({
      where: { id },
      relations: ['user', 'pet', 'vet', 'vet.user', 'clinic'],
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
    const isPending =
      appointment.status === AppointmentStatus.PENDING ||
      appointment.status === AppointmentStatus.CONFIRMED;


    /** optional security check */
    if (
      user.role === 'CUSTOMER' &&
      appointment.user_id !== user.sub
    ) {
      throw new ForbiddenException();
    }

    return {
      consultation_completed: isCompleted,

      confirmation_page: isPending
        ? {
          confirmation_id: `BK-${appointment.id.slice(0, 6)}`,

          consultation_type: appointment.consultation_type,

          appointment_status: appointment.status,

          slot: {
            date: appointment.appointment_date,
            start_time: appointment.slot_start_time,
            end_time: appointment.slot_end_time,
          },

          vet: {
            id: appointment.vet?.id,
            name: `${appointment.vet?.user?.first_name ?? ''} ${appointment.vet?.user?.last_name ?? ''}`,
            specialization: appointment.vet?.primary_specialization,
            experience: appointment.vet?.years_of_experience,
            image: appointment.vet?.profile_image_url,
          },

          clinic: appointment.clinic,

          address: appointment.address,

          payment: {
            total_amount: appointment.price,
            paid_amount: appointment.paid_amount,
            remaining_amount:
              Number(appointment.price || 0) -
              Number(appointment.paid_amount || 0),
            payment_status: appointment.payment_status,
          },
        }
        : null,

      appointment: {
        id: appointment.id,
        code: appointment.appointment_code,
        consultation_type: appointment.consultation_type,
        date: appointment.appointment_date,
        start_time: appointment.slot_start_time,
        end_time: appointment.slot_end_time,
        duration: appointment.duration_minutes,
        status: appointment.status,
        payment_status: appointment.payment_status,
        notes: appointment.notes,
        symptoms: appointment.symptoms,

        doctor_notes: isCompleted ? appointment.doctor_notes : null,
        session_duration: isCompleted ? appointment.session_duration : null,

        documents: isCompleted
          ? {
            prescription_url: appointment.prescription_url,
            treatment_plan_url: appointment.treatment_plan_url,
            invoice_url: appointment.invoice_url,
          }
          : null,
      },

      user: {
        id: appointment.user?.id,
        name: `${appointment.user?.first_name ?? ''} ${appointment.user?.last_name ?? ''}`,
        phone: appointment.user?.phone,
        email: appointment.user?.email,
      },


      address: appointment.address,

      vet: {
        id: appointment.vet?.id,
        name: `${appointment.vet?.user?.first_name ?? ''} ${appointment.vet?.user?.last_name ?? ''}`,
        specialization: appointment.vet?.primary_specialization,
        experience: appointment.vet?.years_of_experience,
        image: appointment.vet?.profile_image_url,
      },

      clinic: appointment.clinic,

      payment: {
        price: appointment.price,
        paid_amount: appointment.paid_amount,
        currency: appointment.currency,
        payment_type: appointment.payment_type,
        payment_status: appointment.payment_status,
      },
    };

  }



  /** ✅ Convert 24hr → 12hr format */
  private formatTime(time: string) {
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr, 10);

    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  }

  async getAppointmentById(id: string) {
    return await this.repo.findOne({
      where: { id },
      relations: ['user', 'pet', 'vet', 'clinic'],
    });
  }

  async getUpcomingAppointments(user: any) {

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    const a = await this.repo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.pet', 'pet')
      .leftJoinAndSelect('pet.photos', 'petPhotos')
      .leftJoinAndSelect('appointment.vet', 'vet')
      .leftJoinAndSelect('vet.user', 'vetUser')
      .leftJoinAndSelect('appointment.clinic', 'clinic')
      .leftJoinAndSelect('appointment.address', 'address')
      .where('appointment.user_id = :userId', { userId: user.sub })

      .andWhere(
        `(appointment.appointment_date > :today 
        OR (appointment.appointment_date = :today 
            AND appointment.slot_end_time > :nowTime))`,
        { today, nowTime },
      )

      .andWhere('appointment.status != :cancelled', {
        cancelled: 'CANCELLED',
      })

      .orderBy('appointment.appointment_date', 'ASC')
      .addOrderBy('appointment.slot_start_time', 'ASC')

      .getOne(); // ⭐ only nearest appointment

    if (!a) return null;

    const date = new Date(a.appointment_date);

    const formattedDate = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });



    return {
      id: a.id,
      appointment_code: a.appointment_code,

      clinic_name: a.clinic?.name ?? null,

      consultation_type: a.consultation_type,

      address: a.address,



      vet: {
        id: a.vet?.id,
        name: `${a.vet?.user?.first_name ?? ''} ${a.vet?.user?.last_name ?? ''}`,
        profile_photo: a.vet?.profile_image_url,
      },

      schedule: {
        date: formattedDate,
        start_time: this.formatTime(a.slot_start_time),
        end_time: this.formatTime(a.slot_end_time),
        time_range: `${this.formatTime(a.slot_start_time)} - ${this.formatTime(a.slot_end_time)}`,
        session: this.getSession(a.slot_start_time),
      },

      location: a.clinic
        ? `${a.clinic.city ?? ''}${a.clinic.city ? ', ' : ''}${a.clinic.state ?? ''}`
        : null,

      status: a.status,
    };
  }


}
