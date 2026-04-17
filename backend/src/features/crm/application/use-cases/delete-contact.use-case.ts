import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as crmRepositoryInterface from '../../domain/repositories/crm.repository.interface';

export interface DeleteContactRequest {
  id: string;
  orgId: string;
}

@Injectable()
export class DeleteContactUseCase {
  constructor(
    @Inject('ICRMRepository')
    private readonly crmRepo: crmRepositoryInterface.ICRMRepository,
  ) {}

  async execute(req: DeleteContactRequest): Promise<Result<void>> {
    const contact = await this.crmRepo.findContactById(req.id);
    if (!contact || contact.orgId !== req.orgId || contact.isDeleted) {
      return Result.fail('Contact not found or access denied');
    }

    contact.delete();
    await this.crmRepo.saveContact(contact);

    return Result.ok();
  }
}
