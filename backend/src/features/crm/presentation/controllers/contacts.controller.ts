/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateContactUseCase } from '../../application/use-cases/create-contact.use-case';
import { ListContactsUseCase } from '../../application/use-cases/list-contacts.use-case';
import { GetContactUseCase } from '../../application/use-cases/get-contact.use-case';
import { UpdateContactUseCase } from '../../application/use-cases/update-contact.use-case';
import { DeleteContactUseCase } from '../../application/use-cases/delete-contact.use-case';
import {
  CreateContactDto,
  ContactResponseDto,
  UpdateContactDto,
} from '../../application/dtos/contact.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { CsvExportService } from '../../../../core/application/services/csv-export.service';
import type { Response } from 'express';

import { PlanLimitsService } from '../../../../core/infrastructure/billing/plan-limits.service';
import { BusinessException } from '../../../../core/application/exceptions/business.exception';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm/contacts')
export class ContactsController {
  constructor(
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly listContactsUseCase: ListContactsUseCase,
    private readonly getContactUseCase: GetContactUseCase,
    private readonly updateContactUseCase: UpdateContactUseCase,
    private readonly deleteContactUseCase: DeleteContactUseCase,
    private readonly csvExportService: CsvExportService,
    private readonly limitsService: PlanLimitsService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export contacts to CSV' })
  async exportCsv(@CurrentUser() user: any, @Res() res: Response) {
    await this.limitsService.checkLimit(user.orgId, 'hasExport');

    const result = await this.listContactsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    const contacts = result.getValue();

    // Convert DTOs to plain objects for CSV
    const csvData = contacts.map((c) => ({
      ID: c.id,
      Name: c.fullName,
      Email: c.email,
      Status: c.status,
    }));

    const csvString = this.csvExportService.generateCsv(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csvString);
  }

  @Get()
  @ApiOperation({ summary: 'List all contacts for the current organization' })
  @ApiResponse({ status: 200, type: [ContactResponseDto] })
  async findAll(@CurrentUser() user: any) {
    const result = await this.listContactsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contact' })
  @ApiResponse({ status: 200, type: ContactResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.getContactUseCase.execute({
      id,
      orgId: user.orgId,
    });
    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contact in the CRM' })
  @ApiResponse({ status: 201, type: ContactResponseDto })
  async create(@Body() dto: CreateContactDto, @CurrentUser() user: any) {
    await this.limitsService.checkLimit(user.orgId, 'maxContacts');

    // Force the correct orgId and ownerId from the authenticated user
    const result = await this.createContactUseCase.execute({
      ...dto,
      orgId: user.orgId,
      ownerId: user.id,
    });

    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing contact' })
  @ApiResponse({ status: 200, type: ContactResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.updateContactUseCase.execute({
      ...dto,
      id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.deleteContactUseCase.execute({
      id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw result.error;
    }
    // Return empty response for 204
    return;
  }
}
