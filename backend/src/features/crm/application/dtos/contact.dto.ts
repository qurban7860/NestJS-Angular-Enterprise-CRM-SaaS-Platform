import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'jane.smith@client.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+123456789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'uuid-company-id', required: false })
  @IsOptional()
  @IsString() // Avoid IsUUID so we can use placeholder IDs from frontend while wiring up
  companyId?: string;

  @ApiHideProperty()
  @IsOptional()
  ownerId!: string;

  @ApiHideProperty()
  @IsOptional()
  orgId!: string;
}

export class ContactResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['LEAD', 'QUALIFIED', 'CUSTOMER', 'CHURNED'] })
  status!: string;

  @ApiProperty({ required: false })
  phone?: string;
}

export class UpdateContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyId?: string;
}
