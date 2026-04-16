import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { CreateContactDto, ContactResponseDto } from '../dtos/contact.dto';
import { Contact } from '../../domain/entities/contact.entity';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CreateContactUseCase implements UseCase<
  CreateContactDto,
  ContactResponseDto
> {
  constructor(
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
  ) {}

  async execute(
    request: CreateContactDto,
  ): Promise<Result<ContactResponseDto>> {
    const contactOrError = Contact.create({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      companyId: request.companyId,
      ownerId: request.ownerId,
      orgId: request.orgId,
      status: 'LEAD',
      tags: [],
      isDeleted: false,
    });

    if (contactOrError.isFailure) {
      return Result.fail<ContactResponseDto>(contactOrError.error!);
    }

    const contact = contactOrError.getValue();
    await this.crmRepo.saveContact(contact);

    return Result.ok<ContactResponseDto>({
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      status: contact.status,
    });
  }
}
