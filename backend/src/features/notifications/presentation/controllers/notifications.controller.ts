import { Controller, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-read.use-case';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly markReadUseCase: MarkNotificationReadUseCase) {}

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
