import { Module } from '@nestjs/common';
import { CreateContactUseCase } from './application/use-cases/create-contact.use-case';
import { ListContactsUseCase } from './application/use-cases/list-contacts.use-case';
import { ListDealsUseCase } from './application/use-cases/list-deals.use-case';
import { CreateDealUseCase } from './application/use-cases/create-deal.use-case';
import { UpdateDealStageUseCase } from './application/use-cases/update-deal-stage.use-case';
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
    CreateDealUseCase,
    UpdateDealStageUseCase,
    {
      provide: 'ICRMRepository',
      useClass: PrismaCRMRepository,
    },
  ],
  exports: [CreateContactUseCase, ListContactsUseCase, ListDealsUseCase, CreateDealUseCase, UpdateDealStageUseCase, 'ICRMRepository'],
})
export class CrmModule {}
