import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { CreateDealDto, DealResponseDto } from '../dtos/deal.dto';
import { Deal } from '../../domain/entities/deal.entity';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CreateDealUseCase implements UseCase<CreateDealDto, DealResponseDto> {
  constructor(
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
  ) {}

  async execute(request: CreateDealDto): Promise<Result<DealResponseDto>> {
    const dealOrError = Deal.create({
      title: request.title,
      valueAmount: request.valueAmount,
      valueCurrency: request.valueCurrency,
      stage: request.stage,
      contactId: request.contactId,
      companyId: request.companyId,
      ownerId: request.ownerId!,
      orgId: request.orgId!,
      expectedCloseDate: request.expectedCloseDate ? new Date(request.expectedCloseDate) : undefined,
      probability: request.probability,
      isDeleted: false,
    });

    if (dealOrError.isFailure) {
      return Result.fail<DealResponseDto>(dealOrError.error!);
    }

    const deal = dealOrError.getValue();
    await this.crmRepo.saveDeal(deal);

    // Fetch the deal with relations
    const savedDeal = await this.crmRepo.findDealById(deal.id);
    if (!savedDeal) return Result.fail<DealResponseDto>("Failed to retrieve created deal");

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
      expectedCloseDate: savedDeal.expectedCloseDate,
      probability: savedDeal.probability,
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
