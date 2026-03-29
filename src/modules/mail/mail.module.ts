import { Module } from '@nestjs/common';
import { BrevoEmailService } from 'src/core/utils/brevo-email.service';

@Module({
  providers: [BrevoEmailService],
  exports: [BrevoEmailService],
})
export class MailModule {}
