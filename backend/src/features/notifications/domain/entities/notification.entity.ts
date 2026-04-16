import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

export type NotificationType = 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'TASK_OVERDUE' | 'DEAL_STAGE_CHANGED' | 'SYSTEM';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'BOTH';

interface NotificationProps {
  recipientId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  metadata: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
}

export class Notification extends Entity<NotificationProps> {
  private constructor(props: NotificationProps, id?: string) {
    super(props, id);
  }

  get recipientId(): string { return this.props.recipientId; }
  get type(): NotificationType { return this.props.type; }
  get channel(): NotificationChannel { return this.props.channel; }
  get title(): string { return this.props.title; }
  get body(): string { return this.props.body; }
  get metadata(): Record<string, any> { return this.props.metadata; }
  get isRead(): boolean { return this.props.isRead; }
  get readAt(): Date | undefined { return this.props.readAt; }

  public static create(props: NotificationProps, id?: string): Result<Notification> {
    if (!props.recipientId) return Result.fail<Notification>("Recipient ID is required");

    return Result.ok<Notification>(new Notification({
      ...props,
      channel: props.channel ?? 'IN_APP',
      metadata: props.metadata ?? {},
      isRead: props.isRead ?? false,
      createdAt: props.createdAt ?? new Date(),
    }, id));
  }

  public markAsRead(): void {
    this.props.isRead = true;
    this.props.readAt = new Date();
  }
}
