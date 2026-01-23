import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailService } from './services/email.service';
import { SlackService } from './services/slack.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, SlackService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
