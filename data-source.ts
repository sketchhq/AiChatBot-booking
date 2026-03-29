// data-source.ts
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DBconfig } from './src/config';
import { User } from 'src/modules/users/entities/user.entity';
import { VerificationToken } from 'src/modules/users/entities/verification-token.entity';
import { UserAuthProvider } from 'src/modules/users/entities/user-auth-provider.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { UserProfile } from 'src/modules/user-profiles/entities/user-profile.entity';
import { Clinic } from 'src/modules/clinic/entities/clinic.entity';
import { Location } from 'src/modules/locations/entities/locations.entity';
import { UserLoginSession } from 'src/modules/user-login-session/entities/user-login-session.entity';
import { Vet } from 'src/modules/vets/entities/vet.entity';
import { VetClinicMapping } from 'src/modules/vet-clinic-mapping/entities/vet-clinic-mapping.entity';
import { VetBlockedSlot } from 'src/modules/vet-blocked-slots/entities/vet-blocked-slot.entity';
import { VetDocument } from 'src/modules/vet-documents/dto/entities/vet-document.entity';
import { VetAppointment } from 'src/modules/vet_appointments/entities/vet-appointment.entity';
import { AppointmentSlotLock } from 'src/modules/appointment_slot_locks/entities/appointment-slot-lock.entity';
import { VetAvailabilityRule } from 'src/modules/vet_availability_rules/entities/vet-availability-rule.entity';
import { VetEducation } from 'src/modules/vet-education/entities/vet-education.entity';
import { Chat } from 'src/modules/chatbot/chats/entities/chats.entity';
import { ProductRecommendation } from 'src/modules/chatbot/product-recommendations/entities/recommendations.entity';
import { Message } from 'src/modules/chatbot/messages/entities/messages.entity';
import { VeterinaryHospital } from 'src/modules/chatbot/veterinary-hospitals/entities/veterinary-hospitals.entity';

import { channel } from 'diagnostics_channel';
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DBconfig.host,
  port: DBconfig.port,
  username: DBconfig.username,
  password: DBconfig.password,
  database: DBconfig.database,

  synchronize: false,
  logging: true,

  entities: [
    User,
    VerificationToken,
    UserAuthProvider,
    UserProfile,
    Address,
    Clinic,
    Location,
    UserLoginSession,
    Vet,
    VetClinicMapping,
    VetBlockedSlot,
    VetDocument,
    VetAppointment,
    AppointmentSlotLock,
    VetAvailabilityRule,
    VetEducation,
    Chat,
    ProductRecommendation,
    VeterinaryHospital,
    Message,
    Notification,
    // add other entities here
    // `${__dirname}/src/modules/**/entities/*.entity{.ts,.js}`



  ],

  migrations: ['src/migrations/*.ts'],


  ssl:
    process.env.NODE_ENV === 'local'
      ? false
      : { rejectUnauthorized: false },
});
