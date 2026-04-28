import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { ContactResponseDto } from '../dtos/contact.dto';

export interface SearchContactsRequest {
  orgId: string;
  query: string;
}

@Injectable()
export class SearchContactsUseCase implements UseCase<SearchContactsRequest, ContactResponseDto[]> {
  constructor(
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
  ) {}

  async execute(req: SearchContactsRequest): Promise<Result<ContactResponseDto[]>> {
    // We'll add this method to the repository interface
    const contacts = await this.crmRepo.searchContacts(req.orgId, req.query);
    
    return Result.ok<ContactResponseDto[]>(
      contacts.map(contact => ({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: contact.fullName,
        email: contact.email,
        status: contact.status,
        phone: contact.phone ?? undefined,
      }))
    );
  }
}
