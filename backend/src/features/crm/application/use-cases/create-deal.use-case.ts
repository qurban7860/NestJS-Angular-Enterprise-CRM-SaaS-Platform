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
      isDeleted: false,
    });

    if (dealOrError.isFailure) {
      return Result.fail<DealResponseDto>(dealOrError.error!);
    }

    const deal = dealOrError.getValue();
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
