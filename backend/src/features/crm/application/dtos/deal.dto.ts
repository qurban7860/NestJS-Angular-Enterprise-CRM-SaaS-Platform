import { ApiProperty } from '@nestjs/swagger';

export enum DealStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST'
}

export class CreateDealDto {
  @ApiProperty({ example: 'Enterprise License Deal' })
  title!: string;

  @ApiProperty({ example: 50000 })
  valueAmount!: number;

  @ApiProperty({ example: 'USD' })
  valueCurrency!: string;

  @ApiProperty({ enum: DealStage, example: DealStage.PROSPECTING })
  stage!: DealStage;

  @ApiProperty()
  contactId!: string;

  @ApiProperty()
  companyId!: string;

  orgId!: string;
  ownerId!: string;
}

export class DealResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  valueAmount!: number;

  @ApiProperty()
  valueCurrency!: string;

  @ApiProperty({ enum: DealStage })
  stage!: DealStage;

  @ApiProperty()
  orgId!: string;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  contactId!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  createdAt!: Date;
}
