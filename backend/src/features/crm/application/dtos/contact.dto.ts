import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Smith' })
  lastName!: string;

  @ApiProperty({ example: 'jane.smith@client.com' })
  email!: string;

  @ApiProperty({ example: '+123456789', required: false })
  phone?: string;

  @ApiProperty({ example: 'uuid-company-id', required: false })
  companyId?: string;

  @ApiHideProperty()
  ownerId!: string;

  @ApiHideProperty()
  orgId!: string;
}

export class ContactResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['LEAD', 'QUALIFIED', 'CUSTOMER', 'CHURNED'] })
  status!: string;
}
