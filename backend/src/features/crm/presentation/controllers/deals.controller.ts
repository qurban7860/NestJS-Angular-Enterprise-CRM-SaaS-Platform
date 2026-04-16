import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListDealsUseCase } from '../../application/use-cases/list-deals.use-case';
import { DealResponseDto } from '../../application/dtos/deal.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('crm/deals')
export class DealsController {
  constructor(
    private readonly listDealsUseCase: ListDealsUseCase,
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
}
