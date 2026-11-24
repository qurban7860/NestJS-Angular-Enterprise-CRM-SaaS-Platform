import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IPasswordHasher } from '../services/password-hasher.interface';
import { IJwtService } from '../services/jwt.service.interface';
import { ICRMRepository } from '../../../crm/domain/repositories/crm.repository.interface';
import { Organization } from '../../../crm/domain/entities/organization.entity';
import { RegisterDto } from '../dtos/auth.dto';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockCrmRepo: jest.Mocked<ICRMRepository>;
  let mockHasher: jest.Mocked<IPasswordHasher>;
  let mockJwt: jest.Mocked<IJwtService>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByOrgId: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
    };

    mockCrmRepo = {
      findOrganizationById: jest.fn(),
      findOrganizationBySlug: jest.fn(),
      saveOrganization: jest.fn(),
      findContactById: jest.fn(),
      findContactsByOrgId: jest.fn(),
      searchContacts: jest.fn(),
      saveContact: jest.fn(),
      findCompanyById: jest.fn(),
      saveCompany: jest.fn(),
      findDealById: jest.fn(),
      findDealsByOrgId: jest.fn(),
      searchDeals: jest.fn(),
      saveDeal: jest.fn(),
    };

    mockHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockJwt = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    useCase = new RegisterUseCase(
      mockUserRepo,
      mockCrmRepo,
      mockHasher,
      mockJwt,
    );
  });

  const registerDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    orgName: 'Test Org',
  };

  it('should register the first user and create the organization', async () => {
    mockUserRepo.exists.mockResolvedValue(false);
    mockCrmRepo.findOrganizationBySlug.mockResolvedValue(null);
    mockCrmRepo.saveOrganization.mockResolvedValue(undefined);
    mockHasher.hash.mockResolvedValue('hashed-password');
    mockUserRepo.save.mockResolvedValue(undefined);
    mockJwt.sign.mockReturnValue('signed-access-token');

    const result = await useCase.execute(registerDto);

    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.user).toMatchObject({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });
    expect(value.accessToken).toBe('signed-access-token');
    expect(mockCrmRepo.findOrganizationBySlug).toHaveBeenCalledWith('test-org');
    expect(mockCrmRepo.saveOrganization).toHaveBeenCalledTimes(1);
    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);

    const savedOrganization = mockCrmRepo.saveOrganization.mock.calls[0]?.[0];
    const savedUser = mockUserRepo.save.mock.calls[0]?.[0];

    expect(savedOrganization?.slug).toBe('test-org');
    expect(savedUser?.orgId).toBe(savedOrganization?.id);
    expect(mockJwt.sign).toHaveBeenCalledWith({
      sub: savedUser?.id,
      email: 'test@example.com',
      role: 'ADMIN',
      orgId: savedOrganization?.id,
    });
  });

  it('should fail if the user already exists', async () => {
    mockUserRepo.exists.mockResolvedValue(true);

    const result = await useCase.execute(registerDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
    expect(mockCrmRepo.findOrganizationBySlug).not.toHaveBeenCalled();
    expect(mockCrmRepo.saveOrganization).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('should fail if the organization slug already exists', async () => {
    mockUserRepo.exists.mockResolvedValue(false);
    mockCrmRepo.findOrganizationBySlug.mockResolvedValue(
      Organization.create({ name: 'Test Org', slug: 'test-org' }).getValue(),
    );

    const result = await useCase.execute(registerDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('organization');
    expect(mockCrmRepo.saveOrganization).not.toHaveBeenCalled();
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});
