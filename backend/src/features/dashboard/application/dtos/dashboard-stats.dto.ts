import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty()
  totalContacts!: number;

  @ApiProperty()
  activeDealsCount!: number;

  @ApiProperty()
  totalDealsCount!: number;

  @ApiProperty()
  totalDealValue!: number;

  @ApiProperty()
  taskCompletionRate!: number;

  @ApiProperty()
  totalTasks!: number;

  @ApiProperty()
  recentActivity!: ActivityItemDto[];
}

export class ActivityItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['CONTACT', 'DEAL', 'TASK'] })
  type!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  timestamp!: Date;

  @ApiProperty({ required: false })
  metadata?: any;
}
