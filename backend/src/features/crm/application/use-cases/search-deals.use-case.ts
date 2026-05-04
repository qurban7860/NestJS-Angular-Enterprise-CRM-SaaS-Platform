import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { DealResponseDto } from '../dtos/deal.dto';

export interface SearchDealsRequest {
  orgId: string;
  query: string;
}

@Injectable()
export class SearchDealsUseCase implements UseCase<
  SearchDealsRequest,
  DealResponseDto[]
> {
  constructor(
    @Inject('ICRMRepository')
    private readonly crmRepo: ICRMRepository,
  ) {}

  async execute(
    req: SearchDealsRequest,
  ): Promise<Result<DealResponseDto[]>> {
    const deals = await this.crmRepo.searchDeals(req.orgId, req.query);
    
    return Result.ok<DealResponseDto[]>(
      deals.map((deal) => ({
        id: deal.id,
        title: deal.title,
        valueAmount: deal.valueAmount,
        valueCurrency: deal.valueCurrency,
        stage: deal.stage as any,
        orgId: deal.orgId,
        ownerId: deal.ownerId,
        contactId: deal.contactId,
        companyId: deal.companyId,
        expectedCloseDate: deal.expectedCloseDate,
        probability: deal.probability,
        contact: (deal as any).contact ? {
          id: (deal as any).contact.id,
          firstName: (deal as any).contact.firstName,
          lastName: (deal as any).contact.lastName,
          fullName: `${(deal as any).contact.firstName} ${(deal as any).contact.lastName}`
        } : undefined,
        createdAt: deal.createdAt!,
      })),
    );
  }
}
