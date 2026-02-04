import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailService } from './services/email.service';
import { ResendEmailService } from './services/resend-email.service';
import { SlackService } from './services/slack.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, ResendEmailService, SlackService],
  exports: [NotificationsService, ResendEmailService],
})
export class NotificationsModule {}
