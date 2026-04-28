import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';

export enum DealStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export class CreateDealDto {
  @ApiProperty({ example: 'Enterprise License Deal' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  valueAmount!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  valueCurrency!: string;

  @ApiProperty({ enum: DealStage, example: DealStage.PROSPECTING })
  @IsEnum(DealStage)
  stage!: DealStage;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ required: false })
  companyId?: string;

  @ApiProperty({ required: false })
  expectedCloseDate?: Date;

  @ApiProperty({ example: 75, required: false })
  probability?: number;

  @IsOptional()
  @IsUUID()
  orgId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
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

  @ApiProperty({ required: false })
  contactId?: string;

  @ApiProperty({ required: false })
  companyId?: string;

  @ApiProperty({ required: false })
  expectedCloseDate?: Date;

  @ApiProperty({ required: false })
  probability?: number;

  @ApiProperty()
  createdAt!: Date;
}

export class UpdateDealStageDto {
  @ApiProperty({ enum: DealStage })
  @IsEnum(DealStage)
  stage!: DealStage;
}

export class UpdateDealDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  valueAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  valueCurrency?: string;

  @ApiProperty({ enum: DealStage, required: false })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
