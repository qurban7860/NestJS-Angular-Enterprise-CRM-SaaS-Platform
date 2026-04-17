/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, Patch, Delete, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListDealsUseCase } from '../../application/use-cases/list-deals.use-case';
import { CreateDealUseCase } from '../../application/use-cases/create-deal.use-case';
import { UpdateDealStageUseCase } from '../../application/use-cases/update-deal-stage.use-case';
import { GetDealUseCase } from '../../application/use-cases/get-deal.use-case';
import { UpdateDealUseCase } from '../../application/use-cases/update-deal.use-case';
import { DeleteDealUseCase } from '../../application/use-cases/delete-deal.use-case';
import { DealResponseDto, CreateDealDto, UpdateDealStageDto, UpdateDealDto } from '../../application/dtos/deal.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { CsvExportService } from '../../../../core/application/services/csv-export.service';
import type { Response } from 'express';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm/deals')
export class DealsController {
  constructor(
    private readonly listDealsUseCase: ListDealsUseCase,
    private readonly createDealUseCase: CreateDealUseCase,
    private readonly updateDealStageUseCase: UpdateDealStageUseCase,
    private readonly getDealUseCase: GetDealUseCase,
    private readonly updateDealUseCase: UpdateDealUseCase,
    private readonly deleteDealUseCase: DeleteDealUseCase,
    private readonly csvExportService: CsvExportService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export deals to CSV' })
  async exportCsv(@CurrentUser() user: any, @Res() res: Response) {
    const result = await this.listDealsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw result.error;
    }
    const deals = result.getValue();
    
    const csvData = deals.map(d => ({
      ID: d.id,
      Title: d.title,
      ValueAmount: d.valueAmount,
      ValueCurrency: d.valueCurrency,
      Stage: d.stage,
      CreatedAt: d.createdAt
    }));

    const csvString = this.csvExportService.generateCsv(csvData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=deals.csv');
    res.send(csvString);
  }

  @Get()
  @ApiOperation({ summary: 'List all deals for the current organization' })
  @ApiResponse({ status: 200, type: [DealResponseDto] })
  async findAll(@CurrentUser() user: any) {
    const result = await this.listDealsUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific deal' })
  @ApiResponse({ status: 200, type: DealResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.getDealUseCase.execute({ id, orgId: user.orgId });
    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new deal in the pipeline' })
  @ApiResponse({ status: 201, type: DealResponseDto })
  async create(@Body() dto: CreateDealDto, @CurrentUser() user: any) {
    const result = await this.createDealUseCase.execute({
      ...dto,
      orgId: user.orgId,
      ownerId: user.id,
    });
    if (result.isFailure) throw result.error;
    return result.getValue();
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update a deal pipeline stage (drag and drop)' })
  @ApiResponse({ status: 200, type: DealResponseDto })
  async updateStage(
    @Param('id') dealId: string, 
    @Body() dto: UpdateDealStageDto, 
    @CurrentUser() user: any
  ) {
    const result = await this.updateDealStageUseCase.execute({
      dealId,
      orgId: user.orgId,
      stage: dto.stage,
    });
    if (result.isFailure) throw result.error;
    return result.getValue();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing deal' })
  @ApiResponse({ status: 200, type: DealResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
    @CurrentUser() user: any
  ) {
    const result = await this.updateDealUseCase.execute({
      ...dto,
      id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deal' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.deleteDealUseCase.execute({
      id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return;
  }
}
