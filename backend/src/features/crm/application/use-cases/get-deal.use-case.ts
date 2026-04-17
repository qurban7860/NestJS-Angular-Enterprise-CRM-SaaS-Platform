import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as crmRepositoryInterface from '../../domain/repositories/crm.repository.interface';
import { DealResponseDto } from '../dtos/deal.dto';

export interface GetDealRequest {
  id: string;
  orgId: string;
}

@Injectable()
export class GetDealUseCase {
  constructor(
    @Inject('ICRMRepository')
    private readonly crmRepo: crmRepositoryInterface.ICRMRepository,
  ) {}

  async execute(req: GetDealRequest): Promise<Result<DealResponseDto>> {
    const deal = await this.crmRepo.findDealById(req.id);
    if (!deal || deal.orgId !== req.orgId || deal.isDeleted) {
      return Result.fail('Deal not found or access denied');
    }

    const dto = new DealResponseDto();
    dto.id = deal.id;
    dto.title = deal.title;
    dto.valueAmount = deal.valueAmount;
    dto.valueCurrency = deal.valueCurrency;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dto.stage = deal.stage as any;
    dto.orgId = deal.orgId;
    dto.ownerId = deal.ownerId;
    dto.contactId = deal.contactId;
    dto.companyId = deal.companyId;
    dto.createdAt = deal.createdAt || new Date();

    return Result.ok(dto);
  }
}
