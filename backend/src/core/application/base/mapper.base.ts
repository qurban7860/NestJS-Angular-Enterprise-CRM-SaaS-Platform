export abstract class Mapper<DomainEntity, Dto, PersistenceModel = any> {
  abstract toDomain(raw: PersistenceModel): DomainEntity;
  abstract toDto(entity: DomainEntity): Dto;
  abstract toPersistence(entity: DomainEntity): PersistenceModel;
}
