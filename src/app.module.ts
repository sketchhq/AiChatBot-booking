import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from 'nestjs-schedule';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DBconfig } from './config';
import { JwtMiddleware } from './middleware/jwt.middleware';
import { config } from 'dotenv';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AddressesModule } from './modules/addresses/addresses.module';
import { UserProfilesModule } from './modules/user-profiles/user-profiles.module';
import { ClinicsModule } from './modules/clinic/clinics.module';
import { LocationsModule } from './modules/locations/locations.module';
import { UserLoginSessionsModule } from './modules/user-login-session/user-login-sessions.module';
import { VetBlockedSlot } from './modules/vet-blocked-slots/entities/vet-blocked-slot.entity';
import { verbose } from 'sequelize-typescript';
import { VetBlockedSlotsModule } from './modules/vet-blocked-slots/vet-blocked-slot.modules';
import { VetsModule } from './modules/vets/vets.module';
import { VetClinicMappingModule } from './modules/vet-clinic-mapping/vet-clinic-mapping.module';
config();
import { VetDocumentsModule } from './modules/vet-documents/dto/entities/vet-documents.module';
import { FileUploadModule } from './common/file-upload/file-upload.module';
import { VetEducationModule } from './modules/vet-education/vet-education.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { VetAppointmentsModule } from './modules/vet_appointments/vet-appointments.module';
import { AppointmentSlotLocksModule } from './modules/appointment_slot_locks/entities/appointment-slot-locks.module';
import { VetAvailabilityRuleModule } from './modules/vet_availability_rules/vet-availability-rule.module';
import { MessagesModule } from './modules/chatbot/messages/messages.module';
import { VeterinaryHospitalsModule } from './modules/chatbot/veterinary-hospitals/veterinary-hospitals.module';
import { ChatsModule } from './modules/chatbot/chats/chats.module';
import { ProductRecommendationsModule } from './modules/chatbot/product-recommendations/recommendations.module';
import { VetReviewsModule } from './modules/vet-reviews/vet-reviews.module';
import { DoctorDashboardModule } from './modules/doctor_dashboard_count_appointment/doctor-dashboard.module';
import { RescheduleModule } from './modules/reschedule/reschedule.module';

config();
console.log('env--->', DBconfig.host, DBconfig.port, DBconfig.username, DBconfig.password, DBconfig.database);


@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(
      {
        type: 'postgres',

        host: DBconfig.host,
        port: DBconfig.port,
        username: DBconfig.username,
        password: DBconfig.password,
        database: DBconfig.database,
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: false,

        logging: true,
        ssl:
          process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development'
            ? false
            : { rejectUnauthorized: false },
      }
    ),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    UsersModule,
    UserProfilesModule,
    AddressesModule,
    ClinicsModule,
    LocationsModule,
    UserLoginSessionsModule,
    VetsModule,
    VetClinicMappingModule,
    VetBlockedSlotsModule,
    VetAvailabilityRuleModule,
    VetDocumentsModule,
    VetAppointmentsModule,
    AppointmentSlotLocksModule,
    FileUploadModule,
    VetEducationModule,
    VetAvailabilityRuleModule,
    ChatbotModule,
    ProductRecommendationsModule,
    ChatsModule,
    MessagesModule,
    VeterinaryHospitalsModule,
    VetReviewsModule,
    DoctorDashboardModule,
    RescheduleModule,

  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],

})


export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(JwtMiddleware)
    //   .forRoutes('*');
  }
}


