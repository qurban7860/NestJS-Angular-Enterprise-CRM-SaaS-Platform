import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListDealsUseCase } from '../../application/use-cases/list-deals.use-case';
import { CreateDealUseCase } from '../../application/use-cases/create-deal.use-case';
import { UpdateDealStageUseCase } from '../../application/use-cases/update-deal-stage.use-case';
import { DealResponseDto, CreateDealDto, UpdateDealStageDto } from '../../application/dtos/deal.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm/deals')
export class DealsController {
  constructor(
    private readonly listDealsUseCase: ListDealsUseCase,
    private readonly createDealUseCase: CreateDealUseCase,
    private readonly updateDealStageUseCase: UpdateDealStageUseCase,
  ) {}

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
}
