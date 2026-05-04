import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Review quarterly report' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Detailed analysis of Q1 performance',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiProperty({ example: 'uuid-user-id', required: false, nullable: true })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @ApiHideProperty()
  @IsOptional()
  creatorId!: string;

  @ApiHideProperty()
  @IsOptional()
  orgId!: string;

  @ApiProperty({
    example: '2026-05-01T10:00:00Z',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  dealId?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: string;
}

export class TaskFiltersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dealId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
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

  @ApiProperty({ required: false, nullable: true })
  assigneeId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  contactId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  dealId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  dueDate?: Date | null;

  @ApiProperty({ required: false })
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({ required: false })
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({ required: false })
  deal?: {
    id: string;
    title: string;
  };

  @ApiProperty()
  createdAt!: Date;
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  contactId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  dealId?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
