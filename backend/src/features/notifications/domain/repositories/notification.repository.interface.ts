import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  save(notification: Notification): Promise<void>;
  findUnreadByRecipient(recipientId: string): Promise<Notification[]>;
  markAllAsRead(recipientId: string): Promise<void>;
}
