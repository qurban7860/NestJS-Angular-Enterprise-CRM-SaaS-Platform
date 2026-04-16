import { Module } from '@nestjs/common';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-read.use-case';
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { NotificationsGateway } from './infrastructure/gateways/notifications.gateway';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    MarkNotificationReadUseCase,
    NotificationsGateway,
    {
      provide: 'INotificationRepository',
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [MarkNotificationReadUseCase, NotificationsGateway, 'INotificationRepository'],
})
export class NotificationsModule {}
