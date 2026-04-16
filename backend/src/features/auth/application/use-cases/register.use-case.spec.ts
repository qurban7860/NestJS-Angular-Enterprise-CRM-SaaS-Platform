/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IPasswordHasher } from '../services/password-hasher.interface';
import type { IJwtService } from '../services/jwt.service.interface';
import { ICRMRepository } from '../../../crm/domain/repositories/crm.repository.interface';
import { RegisterDto } from '../dtos/auth.dto';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockCrmRepo: jest.Mocked<ICRMRepository>;
  let mockHasher: jest.Mocked<IPasswordHasher>;
  let mockJwt: jest.Mocked<IJwtService>;

  beforeEach(() => {
    mockUserRepo = {
      exists: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockCrmRepo = {
      // Add necessary CRM repository methods if called by the use case
    } as any;

    mockHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockJwt = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verify: jest.fn(),
    } as any;

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

  it('should successfully register a new user', async () => {
    mockUserRepo.exists.mockResolvedValue(false);
    mockHasher.hash.mockResolvedValue('hashed-password');
    mockUserRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute(registerDto);

    expect(result.isSuccess).toBe(true);
    expect(mockUserRepo.save).toHaveBeenCalled();
    const value = result.getValue();
    expect(value.user.email).toBe('test@example.com');
  });

  it('should fail if user already exists', async () => {
    mockUserRepo.exists.mockResolvedValue(true);

    const result = await useCase.execute(registerDto);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });
});
