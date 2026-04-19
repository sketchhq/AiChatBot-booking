import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../addresses/entities/address.entity';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import { VetAvailabilityRule } from '../vet_availability_rules/entities/vet-availability-rule.entity';
import { Vet } from '../vets/entities/vet.entity';
import { VetAppointmentsService } from './vet-appointments.service';
import {
  AppointmentStatus,
  VetAppointment,
} from './entities/vet-appointment.entity';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('VetAppointmentsService', () => {
  let service: VetAppointmentsService;
  let appointmentRepository: jest.Mocked<Repository<VetAppointment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VetAppointmentsService,
        {
          provide: getRepositoryToken(VetAppointment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Vet),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(VetAvailabilityRule),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Address),
          useValue: mockRepository(),
        },
        {
          provide: FileUploadService,
          useValue: {
            uploadPublic: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VetAppointmentsService>(
      VetAppointmentsService,
    );
    appointmentRepository = module.get(
      getRepositoryToken(VetAppointment),
    );
  });

  describe('cancel', () => {
    it('cancels the appointment for the owner', async () => {
      const appointment = {
        id: 'appointment-1',
        user_id: 'user-1',
        status: AppointmentStatus.CONFIRMED,
      } as VetAppointment;

      appointmentRepository.findOne.mockResolvedValue(appointment);
      appointmentRepository.save.mockImplementation(
        async (entity) => entity as VetAppointment,
      );

      const result = await service.cancel('appointment-1', {
        sub: 'user-1',
      });

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(appointmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'appointment-1',
          status: AppointmentStatus.CANCELLED,
        }),
      );
    });

    it('rejects cancellation by a different user', async () => {
      appointmentRepository.findOne.mockResolvedValue({
        id: 'appointment-1',
        user_id: 'user-1',
        status: AppointmentStatus.CONFIRMED,
      } as VetAppointment);

      await expect(
        service.cancel('appointment-1', { sub: 'user-2' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects an already cancelled appointment', async () => {
      appointmentRepository.findOne.mockResolvedValue({
        id: 'appointment-1',
        user_id: 'user-1',
        status: AppointmentStatus.CANCELLED,
      } as VetAppointment);

      await expect(
        service.cancel('appointment-1', { sub: 'user-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a completed appointment', async () => {
      appointmentRepository.findOne.mockResolvedValue({
        id: 'appointment-1',
        user_id: 'user-1',
        status: AppointmentStatus.COMPLETED,
      } as VetAppointment);

      await expect(
        service.cancel('appointment-1', { sub: 'user-1' }),
      ).rejects.toThrow(
        new BadRequestException(
          'Cannot cancel completed appointment',
        ),
      );
    });
  });
});
