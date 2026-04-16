import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateContactUseCase } from '../../application/use-cases/create-contact.use-case';
import { ListContactsUseCase } from '../../application/use-cases/list-contacts.use-case';
import { CreateContactDto, ContactResponseDto } from '../../application/dtos/contact.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm/contacts')
export class ContactsController {
  constructor(
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly listContactsUseCase: ListContactsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all contacts for the current organization' })
  @ApiResponse({ status: 200, type: [ContactResponseDto] })
  async findAll(@CurrentUser() user: any) {
    const result = await this.listContactsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contact in the CRM' })
  @ApiResponse({ status: 201, type: ContactResponseDto })
  async create(@Body() dto: CreateContactDto, @CurrentUser() user: any) {
    // Force the correct orgId and ownerId from the authenticated user
    const result = await this.createContactUseCase.execute({
      ...dto,
      orgId: user.orgId,
      ownerId: user.id,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }
}
