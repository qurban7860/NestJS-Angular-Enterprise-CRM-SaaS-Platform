import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Review quarterly report' })
  title!: string;

  @ApiProperty({ example: 'Detailed analysis of Q1 performance', required: false })
  description?: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  priority?: string;

  @ApiProperty({ example: 'uuid-user-id', required: false })
  assigneeId?: string;

  @ApiHideProperty()
  creatorId!: string;

  @ApiHideProperty()
  orgId!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00Z', required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  relatedContactId?: string;

  @ApiProperty({ required: false })
  relatedDealId?: string;
}

export class TaskResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
  status!: string;

  @ApiProperty()
  priority!: string;

  @ApiProperty()
  createdAt!: Date;
}
