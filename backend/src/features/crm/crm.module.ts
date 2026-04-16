import { Module } from '@nestjs/common';
import { CreateContactUseCase } from './application/use-cases/create-contact.use-case';
import { ListContactsUseCase } from './application/use-cases/list-contacts.use-case';
import { ListDealsUseCase } from './application/use-cases/list-deals.use-case';
import { PrismaCRMRepository } from './infrastructure/repositories/prisma-crm.repository';
import { ContactsController } from './presentation/controllers/contacts.controller';
import { DealsController } from './presentation/controllers/deals.controller';

@Module({
  imports: [],
  controllers: [ContactsController, DealsController],
  providers: [
    CreateContactUseCase,
    ListContactsUseCase,
    ListDealsUseCase,
    {
      provide: 'ICRMRepository',
      useClass: PrismaCRMRepository,
    },
  ],
  exports: [CreateContactUseCase, ListContactsUseCase, ListDealsUseCase, 'ICRMRepository'],
})
export class CrmModule {}
