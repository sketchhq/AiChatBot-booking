import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VetAppointment } from '../vet_appointments/entities/vet-appointment.entity';
import {
  AppointmentStatus,
  AppointmentPaymentStatus,
} from '../vet_appointments/entities/vet-appointment.entity';

@Injectable()
export class DoctorDashboardService {
  constructor(
    @InjectRepository(VetAppointment)
    private appointmentRepo: Repository<VetAppointment>,
  ) {}

  async getDashboardCounts(vetUser: any) {

    const userId = vetUser.sub;   // logged in vet's user_id

    const today = new Date().toISOString().split('T')[0];

    /** TODAY APPOINTMENTS */

    const todaysAppointments = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.vet', 'vet')
      .where('vet.user_id = :userId', { userId })
      .andWhere('appointment.appointment_date = :today', { today })
      .getCount();

    /** WAITING PATIENTS */

    const waitingPatients = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.vet', 'vet')
      .where('vet.user_id = :userId', { userId })
      .andWhere('appointment.appointment_date = :today', { today })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [
          AppointmentStatus.PENDING,
          AppointmentStatus.CONFIRMED,
        ],
      })
      .getCount();

    /** COMPLETED CONSULTATIONS */

    const completedConsultations = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.vet', 'vet')
      .where('vet.user_id = :userId', { userId })
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.COMPLETED,
      })
      .getCount();

    /** EARNINGS TODAY */

    const earningsToday = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.vet', 'vet')
      .select('SUM(appointment.price)', 'sum')
      .where('vet.user_id = :userId', { userId })
      .andWhere('appointment.appointment_date = :today', { today })
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.COMPLETED,
      })
      .getRawOne();

    /** WEEK RANGE */

    const start = new Date();
    start.setDate(start.getDate() - start.getDay());

    const end = new Date();
    end.setDate(start.getDate() + 6);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    /** TOTAL PATIENTS THIS WEEK */

    const totalPatientsWeek = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.vet', 'vet')
      .where('vet.user_id = :userId', { userId })
      .andWhere('appointment.appointment_date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getCount();

    /** REVENUE THIS WEEK */

    const revenueWeek = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.vet', 'vet')
      .select('SUM(appointment.price)', 'sum')
      .where('vet.user_id = :userId', { userId })
      .andWhere('appointment.payment_status = :payment', {
        payment: AppointmentPaymentStatus.PAID,
      })
      .andWhere('appointment.appointment_date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    return {
      todays_appointments: todaysAppointments,
      waiting_patients: waitingPatients,
      completed_consultations: completedConsultations,
      earnings_today: Number(earningsToday?.sum || 0),
      total_patients_this_week: totalPatientsWeek,
      revenue_this_week: Number(revenueWeek?.sum || 0),
    };
  }
}