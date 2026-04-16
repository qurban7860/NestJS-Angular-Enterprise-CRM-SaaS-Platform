import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class MarkNotificationReadUseCase implements UseCase<string, void> {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(notificationId: string): Promise<Result<void>> {
    const notification = await this.notificationRepo.findById(notificationId);
    
    if (!notification) {
      return Result.fail<void>("Notification not found");
    }

    notification.markAsRead();
    await this.notificationRepo.save(notification);

    return Result.ok();
  }
}
