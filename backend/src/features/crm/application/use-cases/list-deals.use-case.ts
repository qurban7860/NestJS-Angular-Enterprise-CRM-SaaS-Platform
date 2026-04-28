/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { DealResponseDto } from '../dtos/deal.dto';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ListDealsUseCase implements UseCase<string, DealResponseDto[]> {
  constructor(
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
  ) {}

  async execute(orgId: string): Promise<Result<DealResponseDto[]>> {
    const deals = await this.crmRepo.findDealsByOrgId(orgId);

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
        createdAt: deal.createdAt!,
      })),
    );
  }
}
