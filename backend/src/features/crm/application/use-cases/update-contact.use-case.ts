import { Injectable, Inject } from '@nestjs/common';
import { Result } from '../../../../core/domain/base/result';
import * as crmRepositoryInterface from '../../domain/repositories/crm.repository.interface';
import { ContactResponseDto } from '../dtos/contact.dto';
import { ContactStatus } from '@prisma/client';

export interface UpdateContactRequest {
  id: string;
  orgId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
}

@Injectable()
export class UpdateContactUseCase {
  constructor(
    @Inject('ICRMRepository')
    private readonly crmRepo: crmRepositoryInterface.ICRMRepository,
  ) {}

  async execute(
    req: UpdateContactRequest,
  ): Promise<Result<ContactResponseDto>> {
    const contact = await this.crmRepo.findContactById(req.id);
    if (!contact || contact.orgId !== req.orgId || contact.isDeleted) {
      return Result.fail('Contact not found or access denied');
    }

    contact.update({
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      phone: req.phone,
      status: req.status as ContactStatus | undefined,
    });

    await this.crmRepo.saveContact(contact);

    const dto = new ContactResponseDto();
    dto.id = contact.id;
    dto.fullName = `${contact.firstName} ${contact.lastName}`;
    dto.email = contact.email;
    dto.status = contact.status;

    return Result.ok(dto);
  }
}
