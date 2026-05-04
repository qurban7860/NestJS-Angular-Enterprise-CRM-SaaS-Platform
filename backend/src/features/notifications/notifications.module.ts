import { Module } from '@nestjs/common';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-read.use-case';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { NotificationsGateway } from './infrastructure/gateways/notifications.gateway';
import { NotificationService } from './application/services/notification.service';

import { AuthModule } from '../auth/auth.module';

import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    MarkNotificationReadUseCase,
    GetNotificationsUseCase,
    NotificationsGateway,
    NotificationService,
    {
      provide: 'INotificationRepository',
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [
    MarkNotificationReadUseCase,
    NotificationsGateway,
    NotificationService,
    'INotificationRepository',
  ],
})
export class NotificationsModule {}
