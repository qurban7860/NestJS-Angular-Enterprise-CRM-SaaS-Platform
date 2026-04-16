import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { ContactResponseDto } from '../dtos/contact.dto';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ListContactsUseCase implements UseCase<string, ContactResponseDto[]> {
  constructor(
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
  ) {}

  async execute(orgId: string): Promise<Result<ContactResponseDto[]>> {
    const contacts = await this.crmRepo.findContactsByOrgId(orgId);
    
    return Result.ok<ContactResponseDto[]>(
      contacts.map(contact => ({
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        status: contact.status,
      }))
    );
  }
}
