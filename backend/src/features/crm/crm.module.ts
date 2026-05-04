import { Module } from '@nestjs/common';
import { CreateContactUseCase } from './application/use-cases/create-contact.use-case';
import { ListContactsUseCase } from './application/use-cases/list-contacts.use-case';
import { GetContactUseCase } from './application/use-cases/get-contact.use-case';
import { UpdateContactUseCase } from './application/use-cases/update-contact.use-case';
import { DeleteContactUseCase } from './application/use-cases/delete-contact.use-case';
import { SearchContactsUseCase } from './application/use-cases/search-contacts.use-case';
import { ListDealsUseCase } from './application/use-cases/list-deals.use-case';
import { CreateDealUseCase } from './application/use-cases/create-deal.use-case';
import { UpdateDealStageUseCase } from './application/use-cases/update-deal-stage.use-case';
import { GetDealUseCase } from './application/use-cases/get-deal.use-case';
import { UpdateDealUseCase } from './application/use-cases/update-deal.use-case';
import { DeleteDealUseCase } from './application/use-cases/delete-deal.use-case';
import { SearchDealsUseCase } from './application/use-cases/search-deals.use-case';
import { PrismaCRMRepository } from './infrastructure/repositories/prisma-crm.repository';
import { ContactsController } from './presentation/controllers/contacts.controller';
import { DealsController } from './presentation/controllers/deals.controller';

@Module({
  imports: [],
  controllers: [ContactsController, DealsController],
  providers: [
    CreateContactUseCase,
    ListContactsUseCase,
    GetContactUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    SearchContactsUseCase,
    ListDealsUseCase,
    CreateDealUseCase,
    UpdateDealStageUseCase,
    GetDealUseCase,
    UpdateDealUseCase,
    DeleteDealUseCase,
    SearchDealsUseCase,
    {
      provide: 'ICRMRepository',
      useClass: PrismaCRMRepository,
    },
  ],
  exports: [
    CreateContactUseCase,
    ListContactsUseCase,
    GetContactUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    SearchContactsUseCase,
    ListDealsUseCase,
    CreateDealUseCase,
    UpdateDealStageUseCase,
    GetDealUseCase,
    UpdateDealUseCase,
    DeleteDealUseCase,
    SearchDealsUseCase,
    'ICRMRepository',
  ],
})
export class CrmModule {}
