import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  VetAppointment,
  AppointmentStatus,
} from '../vet_appointments/entities/vet-appointment.entity';

import { VetAvailabilityRule } from '../vet_availability_rules/entities/vet-availability-rule.entity';

import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';

@Injectable()
export class RescheduleService {

  constructor(
    @InjectRepository(VetAppointment)
    private readonly repo: Repository<VetAppointment>,

    @InjectRepository(VetAvailabilityRule)
    private readonly ruleRepo: Repository<VetAvailabilityRule>,
  ) {}

  /* =========================================
      SLOT GENERATOR
  ========================================= */

  private generateSlots(
    start: string,
    end: string,
    duration: number,
    breakStart?: string,
    breakEnd?: string,
  ) {

    const slots: string[] = [];

    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    let current = startTime;

    while (current < endTime) {

      const next = new Date(
        current.getTime() + duration * 60000,
      );

      const time = current.toTimeString().slice(0, 5);

      if (
        breakStart &&
        breakEnd &&
        time >= breakStart &&
        time < breakEnd
      ) {
        current = next;
        continue;
      }

      slots.push(time);

      current = next;
    }

    return slots;
  }

  /* =========================================
      GET AVAILABLE SLOTS
  ========================================= */

  async getAvailableSlots(
    vetId: string,
    date: string,
  ) {

    const dayOfWeek = new Date(date).getDay();

    const rule = await this.ruleRepo.findOne({
      where: {
        vet_id: vetId,
        day_of_week: dayOfWeek,
        is_active: true,
      },
    });

    if (!rule) return [];

    const slots = this.generateSlots(
      rule.start_time,
      rule.end_time,
      rule.slot_duration_minutes,
      rule.break_start,
      rule.break_end,
    );

    const bookedAppointments =
      await this.repo.find({
        where: {
          vet_id: vetId,
          appointment_date: date,
        },
      });

    const bookedSlots = bookedAppointments.map(
      (a) => a.slot_start_time,
    );

    return slots.filter(
      (slot) => !bookedSlots.includes(slot),
    );
  }

  /* =========================================
      GET RESCHEDULE PAGE
  ========================================= */

  async getRescheduleDetails(appointmentId: string) {

  const appointment = await this.repo.findOne({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new NotFoundException('Appointment not found');
  }

  return {
    reschedule_summary: {

      new_date: appointment.appointment_date,

      new_time: appointment.slot_start_time,

      amount_paid: appointment.paid_amount,

      balance_due:
        (appointment.price || 0) -
        (appointment.paid_amount || 0),
    },
  };
}

  /* =========================================
      RESCHEDULE APPOINTMENT
  ========================================= */
async rescheduleAppointment(
  dto: RescheduleAppointmentDto,
) {

  /* ===============================
     Validate Inputs
  =============================== */

  if (!dto.appointment_id) {
    throw new Error('appointment_id is required');
  }

  if (!dto.new_date) {
    throw new Error('new_date is required');
  }

  if (!dto.new_time) {
    throw new Error('new_time is required');
  }

  /* ===============================
     Find Appointment
  =============================== */

  const appointment = await this.repo.findOne({
    where: { id: dto.appointment_id },
  });

  if (!appointment) {
    throw new NotFoundException('Appointment not found');
  }

  /* ===============================
     Normalize Time
  =============================== */

  let startTime = dto.new_time;

  // ensure HH:mm format
  if (startTime.length === 5) {
    startTime = `${startTime}:00`;
  }

  const startDate = new Date(`1970-01-01T${startTime}`);

  if (isNaN(startDate.getTime())) {
    throw new Error('Invalid time format');
  }

  /* ===============================
     Calculate End Time
  =============================== */

  const duration = appointment.duration_minutes || 30;

  const endDate = new Date(
    startDate.getTime() + duration * 60000,
  );

  const endTime = endDate
    .toISOString()
    .substring(11, 16);

  /* ===============================
     Update Appointment
  =============================== */

  appointment.appointment_date = dto.new_date;

  appointment.slot_start_time = startTime.substring(0,5);

  appointment.slot_end_time = endTime;

  appointment.status = AppointmentStatus.CONFIRMED;

  await this.repo.save(appointment);

  /* ===============================
     Response
  =============================== */

  return {
    message: 'Appointment rescheduled successfully',
    appointment_id: appointment.id,
    new_date: appointment.appointment_date,
    new_start_time: appointment.slot_start_time,
    new_end_time: appointment.slot_end_time,
  };
}

  /* =========================================
      CANCEL APPOINTMENT
  ========================================= */

 async cancelAppointment(dto: CancelAppointmentDto) {

  const appointment = await this.repo.findOne({
    where: { id: dto.appointment_id },
    relations: ['vet', 'vet.user'],
  });

  if (!appointment) {
    throw new NotFoundException('Appointment not found');
  }

  const refund = this.calculateRefund(
    new Date(`${appointment.appointment_date} ${appointment.slot_start_time}`),
    appointment.paid_amount,
  );

  /* FORCE UPDATE STATUS WITH ENUM CAST */
  await this.repo.query(
    `
    UPDATE vet_appointments
    SET status = 'CANCELLED'::vet_appointments_status_enum
    WHERE id = $1
    `,
    [dto.appointment_id],
  );

  const updatedAppointment = await this.repo.findOne({
    where: { id: dto.appointment_id },
    relations: ['vet', 'vet.user'],
  });

  return {
    current_appointment: {
      vet_name: `${updatedAppointment?.vet?.user?.first_name ?? ''} ${updatedAppointment?.vet?.user?.last_name ?? ''}`,
      appointment_date: updatedAppointment?.appointment_date,
      appointment_time: updatedAppointment?.slot_start_time,
      consultation_type: updatedAppointment?.consultation_type,
    },
    reason_for_cancellation: dto.reason,
    description: dto.description,
    refund_percentage: refund.refund_percentage,
    estimated_refund: refund.refund_amount,
  };
}
  /* =========================================
      REFUND LOGIC
  ========================================= */

  calculateRefund(
    appointmentDate: Date,
    amount: number,
  ) {

    const now = new Date();

    const diffHours =
      (appointmentDate.getTime() -
        now.getTime()) /
      (1000 * 60 * 60);

    if (diffHours >= 48) {
      return {
        refund_percentage: 100,
        refund_amount: amount,
      };
    }

    if (diffHours >= 24) {
      return {
        refund_percentage: 80,
        refund_amount: amount * 0.8,
      };
    }

    return {
      refund_percentage: 0,
      refund_amount: 0,
    };
  }

  /* =========================================
      NEXT 7 AVAILABLE DATES
  ========================================= */

  getNextAvailableDates() {

    const dates: string[] = [];

    const today = new Date();

    for (let i = 1; i <= 7; i++) {

      const nextDate = new Date(today);

      nextDate.setDate(
        today.getDate() + i,
      );

      dates.push(
        nextDate
          .toISOString()
          .split('T')[0],
      );
    }

    return dates;
  }

}