import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Review quarterly report' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Detailed analysis of Q1 performance', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiProperty({ example: 'uuid-user-id', required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiHideProperty()
  @IsOptional()
  creatorId!: string;

  @ApiHideProperty()
  @IsOptional()
  orgId!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  relatedContactId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  relatedDealId?: string;
  
  @ApiProperty()
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

  @ApiProperty()
  createdAt!: Date;
}
