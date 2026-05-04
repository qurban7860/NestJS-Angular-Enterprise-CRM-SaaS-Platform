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
  expectedCloseDate?: string;
  probability?: number;
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
      expectedCloseDate: req.expectedCloseDate ? new Date(req.expectedCloseDate) : undefined,
      probability: req.probability,
    });

    await this.crmRepo.saveDeal(deal);

    // Fetch the deal with relations
    const savedDeal = await this.crmRepo.findDealById(deal.id);
    if (!savedDeal) return Result.fail<DealResponseDto>("Failed to retrieve updated deal");

    const dto = new DealResponseDto();
    dto.id = savedDeal.id;
    dto.title = savedDeal.title;
    dto.valueAmount = savedDeal.valueAmount;
    dto.valueCurrency = savedDeal.valueCurrency;
    dto.stage = savedDeal.stage as any;
    dto.orgId = savedDeal.orgId;
    dto.ownerId = savedDeal.ownerId;
    dto.contactId = savedDeal.contactId;
    dto.companyId = savedDeal.companyId;
    dto.expectedCloseDate = savedDeal.expectedCloseDate;
    dto.probability = savedDeal.probability;
    dto.createdAt = savedDeal.createdAt || new Date();

    if ((savedDeal as any).contact) {
      dto.contact = {
        id: (savedDeal as any).contact.id,
        firstName: (savedDeal as any).contact.firstName,
        lastName: (savedDeal as any).contact.lastName,
        fullName: `${(savedDeal as any).contact.firstName} ${(savedDeal as any).contact.lastName}`
      };
    }

    return Result.ok(dto);
  }
}
