import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as crmRepositoryInterface from '../../domain/repositories/crm.repository.interface';
import { ContactResponseDto } from '../dtos/contact.dto';

export interface GetContactRequest {
  id: string;
  orgId: string;
}

@Injectable()
export class GetContactUseCase {
  constructor(
    @Inject('ICRMRepository')
    private readonly crmRepo: crmRepositoryInterface.ICRMRepository,
  ) {}

  async execute(req: GetContactRequest): Promise<Result<ContactResponseDto>> {
    const contact = await this.crmRepo.findContactById(req.id);
    if (!contact || contact.orgId !== req.orgId || contact.isDeleted) {
      return Result.fail('Contact not found or access denied');
    }

    const dto = new ContactResponseDto();
    dto.id = contact.id;
    dto.fullName = `${contact.firstName} ${contact.lastName}`;
    dto.email = contact.email;
    dto.status = contact.status;

    return Result.ok(dto);
  }
}
