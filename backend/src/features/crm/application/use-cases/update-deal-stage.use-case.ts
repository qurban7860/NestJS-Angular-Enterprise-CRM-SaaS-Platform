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
    
    // Fetch the deal with relations
    const savedDeal = await this.crmRepo.findDealById(deal.id);
    if (!savedDeal) return Result.fail<DealResponseDto>("Failed to retrieve updated deal");

    return Result.ok<DealResponseDto>({
      id: savedDeal.id,
      title: savedDeal.title,
      valueAmount: savedDeal.valueAmount,
      valueCurrency: savedDeal.valueCurrency,
      stage: savedDeal.stage as any,
      orgId: savedDeal.orgId,
      ownerId: savedDeal.ownerId,
      contactId: savedDeal.contactId,
      companyId: savedDeal.companyId,
      contact: (savedDeal as any).contact ? {
        id: (savedDeal as any).contact.id,
        firstName: (savedDeal as any).contact.firstName,
        lastName: (savedDeal as any).contact.lastName,
        fullName: `${(savedDeal as any).contact.firstName} ${(savedDeal as any).contact.lastName}`
      } : undefined,
      createdAt: savedDeal.createdAt!,
    });
  }
}
