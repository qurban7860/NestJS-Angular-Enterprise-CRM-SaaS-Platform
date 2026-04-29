import { Contact, ContactStatus } from './contact.entity';

describe('Contact Entity', () => {
  const validProps = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    status: 'LEAD' as ContactStatus,
    orgId: 'org-123',
    ownerId: 'user-123',
    tags: [],
    isDeleted: false,
  };

  it('should create a valid contact', () => {
    const contactResult = Contact.create(validProps);

    expect(contactResult.isSuccess).toBe(true);
    const contact = contactResult.getValue();
    expect(contact.firstName).toBe('John');
    expect(contact.email).toBe('john.doe@example.com');
    expect(contact.status).toBe('LEAD');
  });

  it('should fail if email is empty', () => {
    const props = { ...validProps, email: '' };
    const contactResult = Contact.create(props);

    expect(contactResult.isFailure).toBe(true);
    expect(contactResult.error).toContain('Email is required');
  });

  it('should fail if first name is too short', () => {
    const props = { ...validProps, firstName: '' };
    const contactResult = Contact.create(props);

    expect(contactResult.isFailure).toBe(true);
    expect(contactResult.error).toContain('First name is required');
  });

  it('should update status correctly', () => {
    const contact = Contact.create(validProps).getValue();
    contact.updateStatus('CUSTOMER');
    expect(contact.status).toBe('CUSTOMER');
  });
});
