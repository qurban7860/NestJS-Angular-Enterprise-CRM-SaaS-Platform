/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as crmRepositoryInterface from '../../domain/repositories/crm.repository.interface';
import { DealResponseDto } from '../dtos/deal.dto';

export interface UpdateDealRequest {
  id: string;
  orgId: string;
  title?: string;
  valueAmount?: number;
  valueCurrency?: string;
  stage?: string;
  contactId?: string;
  companyId?: string;
}

@Injectable()
export class UpdateDealUseCase {
  constructor(
    @Inject('ICRMRepository')
    private readonly crmRepo: crmRepositoryInterface.ICRMRepository,
  ) {}

  async execute(req: UpdateDealRequest): Promise<Result<DealResponseDto>> {
    const deal = await this.crmRepo.findDealById(req.id);
    if (!deal || deal.orgId !== req.orgId || deal.isDeleted) {
      return Result.fail('Deal not found or access denied');
    }

    deal.update({
      title: req.title,
      valueAmount: req.valueAmount,
      valueCurrency: req.valueCurrency,
      stage: req.stage as any,
      contactId: req.contactId,
      companyId: req.companyId,
    });

    await this.crmRepo.saveDeal(deal);

    const dto = new DealResponseDto();
    dto.id = deal.id;
    dto.title = deal.title;
    dto.valueAmount = deal.valueAmount;
    dto.valueCurrency = deal.valueCurrency;
    dto.stage = deal.stage as any;
    dto.orgId = deal.orgId;
    dto.ownerId = deal.ownerId;
    dto.contactId = deal.contactId;
    dto.companyId = deal.companyId;
    dto.createdAt = deal.createdAt || new Date();

    return Result.ok(dto);
  }
}
