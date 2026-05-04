import { Injectable, Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification, NotificationType, NotificationChannel } from '../../domain/entities/notification.entity';
import { NotificationsGateway } from '../../infrastructure/gateways/notifications.gateway';

export interface CreateNotificationOptions {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, any>;
  channel?: NotificationChannel;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepo: INotificationRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async notify(options: CreateNotificationOptions): Promise<void> {
    const notificationOrError = Notification.create({
      recipientId: options.recipientId,
      type: options.type,
      title: options.title,
      body: options.body,
      metadata: options.metadata ?? {},
      channel: options.channel ?? 'IN_APP',
      isRead: false,
    });

    if (notificationOrError.isFailure) {
      throw new Error(notificationOrError.error || 'Unknown notification error');
    }

    const notification = notificationOrError.getValue();
    
    // 1. Persist to Database
    await this.notificationRepo.save(notification);

    // 2. Emit via WebSocket for Real-time
    this.notificationsGateway.sendToUser(options.recipientId, 'notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      isRead: false
    });
  }
}
