import { Contact } from '../../domain/entities/contact.entity';
import type { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { DeleteContactUseCase } from './delete-contact.use-case';
import { GetContactUseCase } from './get-contact.use-case';
import { UpdateContactUseCase } from './update-contact.use-case';

const createContact = (orgId: string): Contact =>
  Contact.create({
    firstName: 'Avery',
    lastName: 'Stone',
    email: 'avery@example.com',
    status: 'LEAD',
    orgId,
    ownerId: 'owner-' + orgId,
    tags: [],
    isDeleted: false,
  }).getValue();

const createRepository = (contact: Contact | null) => {
  const findContactById: jest.MockedFunction<
    ICRMRepository['findContactById']
  > = jest.fn();
  findContactById.mockResolvedValue(contact);

  const saveContact: jest.MockedFunction<
    ICRMRepository['saveContact']
  > = jest.fn();
  saveContact.mockResolvedValue(undefined);

  return {
    repository: {
      findContactById,
      saveContact,
    } as unknown as ICRMRepository,
    findContactById,
    saveContact,
  };
};

describe('contact tenant isolation', () => {
  const organizationA = 'org-a';
  const organizationB = 'org-b';

  it('rejects a contact returned from another organization', async () => {
    const foreignContact = createContact(organizationB);
    const { repository, findContactById } = createRepository(foreignContact);

    const result = await new GetContactUseCase(repository).execute({
      id: foreignContact.id,
      orgId: organizationA,
    });

    expect(findContactById).toHaveBeenCalledWith(
      foreignContact.id,
      organizationA,
    );
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Contact not found or access denied');
  });

  it('does not update a contact from another organization', async () => {
    const foreignContact = createContact(organizationB);
    const { repository, findContactById, saveContact } =
      createRepository(foreignContact);

    const result = await new UpdateContactUseCase(repository).execute({
      id: foreignContact.id,
      orgId: organizationA,
      firstName: 'Changed',
    });

    expect(findContactById).toHaveBeenCalledWith(
      foreignContact.id,
      organizationA,
    );
    expect(result.isFailure).toBe(true);
    expect(saveContact).not.toHaveBeenCalled();
    expect(foreignContact.firstName).toBe('Avery');
  });

  it('does not delete a contact from another organization', async () => {
    const foreignContact = createContact(organizationB);
    const { repository, findContactById, saveContact } =
      createRepository(foreignContact);

    const result = await new DeleteContactUseCase(repository).execute({
      id: foreignContact.id,
      orgId: organizationA,
    });

    expect(findContactById).toHaveBeenCalledWith(
      foreignContact.id,
      organizationA,
    );
    expect(result.isFailure).toBe(true);
    expect(saveContact).not.toHaveBeenCalled();
    expect(foreignContact.isDeleted).toBe(false);
  });

  it('allows an organization to read its own contact', async () => {
    const contact = createContact(organizationA);
    const { repository } = createRepository(contact);

    const result = await new GetContactUseCase(repository).execute({
      id: contact.id,
      orgId: organizationA,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe(contact.id);
  });

  it('allows an organization to update its own contact', async () => {
    const contact = createContact(organizationA);
    const { repository, saveContact } = createRepository(contact);

    const result = await new UpdateContactUseCase(repository).execute({
      id: contact.id,
      orgId: organizationA,
      firstName: 'Updated',
    });

    expect(result.isSuccess).toBe(true);
    expect(contact.firstName).toBe('Updated');
    expect(saveContact).toHaveBeenCalledWith(contact);
  });

  it('allows an organization to delete its own contact', async () => {
    const contact = createContact(organizationA);
    const { repository, saveContact } = createRepository(contact);

    const result = await new DeleteContactUseCase(repository).execute({
      id: contact.id,
      orgId: organizationA,
    });

    expect(result.isSuccess).toBe(true);
    expect(contact.isDeleted).toBe(true);
    expect(saveContact).toHaveBeenCalledWith(contact);
  });
});
