/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/only-throw-error */
import { Controller, Patch, Param, UseGuards, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-read.use-case';
import { GetNotificationsUseCase } from '../../application/use-cases/get-notifications.use-case';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly markReadUseCase: MarkNotificationReadUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get unread notifications' })
  async getNotifications(@CurrentUser() user: any) {
    const result = await this.getNotificationsUseCase.execute(user.id);
    if (result.isFailure) throw result.error;
    return result.getValue().map((n: any) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      createdAt: n.createdAt,
      isRead: n.isRead,
      metadata: n.metadata,
    }));
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification updated' })
  async markAsRead(@Param('id') id: string) {
    const result = await this.markReadUseCase.execute(id);
    if (result.isFailure) {
      throw result.error;
    }
    return { success: true };
  }
}
