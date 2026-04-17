import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as crmRepositoryInterface from '../../domain/repositories/crm.repository.interface';

export interface DeleteDealRequest {
  id: string;
  orgId: string;
}

@Injectable()
export class DeleteDealUseCase {
  constructor(
    @Inject('ICRMRepository')
    private readonly crmRepo: crmRepositoryInterface.ICRMRepository,
  ) {}

  async execute(req: DeleteDealRequest): Promise<Result<void>> {
    const deal = await this.crmRepo.findDealById(req.id);
    if (!deal || deal.orgId !== req.orgId || deal.isDeleted) {
      return Result.fail('Deal not found or access denied');
    }

    deal.delete();
    await this.crmRepo.saveDeal(deal);

    return Result.ok();
  }
}
