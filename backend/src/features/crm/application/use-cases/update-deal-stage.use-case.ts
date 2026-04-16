import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { DealStage, DealResponseDto } from '../dtos/deal.dto';
import { Injectable, Inject } from '@nestjs/common';

export interface UpdateDealStageRequest {
  dealId: string;
  orgId: string;
  stage: DealStage;
}

@Injectable()
export class UpdateDealStageUseCase implements UseCase<UpdateDealStageRequest, DealResponseDto> {
  constructor(
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
  ) {}

  async execute(request: UpdateDealStageRequest): Promise<Result<DealResponseDto>> {
    const deal = await this.crmRepo.findDealById(request.dealId);

    if (!deal) {
      return Result.fail<DealResponseDto>("Deal not found");
    }

    if (deal.orgId !== request.orgId) {
      return Result.fail<DealResponseDto>("Unauthorized to update this deal");
    }

    deal.advanceStage(request.stage);
    
    await this.crmRepo.saveDeal(deal);

    return Result.ok<DealResponseDto>({
      id: deal.id,
      title: deal.title,
      valueAmount: deal.valueAmount,
      valueCurrency: deal.valueCurrency,
      stage: deal.stage as any,
      orgId: deal.orgId,
      ownerId: deal.ownerId,
      contactId: deal.contactId,
      companyId: deal.companyId,
      createdAt: deal.createdAt!,
    });
  }
}
