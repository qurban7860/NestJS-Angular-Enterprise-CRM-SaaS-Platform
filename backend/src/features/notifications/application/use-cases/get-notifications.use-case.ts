/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { Result } from '../../../../core/domain/base/result';

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<Result<Notification[]>> {
    try {
      const notifications =
        await this.notificationRepository.findUnreadByRecipient(userId);
      return Result.ok<Notification[]>(notifications);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return Result.fail<Notification[]>(error.message);
    }
  }
}
