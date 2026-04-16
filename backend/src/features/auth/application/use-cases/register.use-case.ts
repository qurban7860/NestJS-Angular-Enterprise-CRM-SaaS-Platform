/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { ICRMRepository } from '../../../crm/domain/repositories/crm.repository.interface';
import type { IPasswordHasher } from '../services/password-hasher.interface';
import type { IJwtService } from '../services/jwt.service.interface';
import { RegisterDto, AuthResponseDto } from '../dtos/auth.dto';
import { UserMapper } from '../mappers/user.mapper';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { User } from '../../domain/entities/user.entity';
import { Organization } from '../../../crm/domain/entities/organization.entity';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class RegisterUseCase implements UseCase<RegisterDto, AuthResponseDto> {
  private userMapper = new UserMapper();

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ICRMRepository') private readonly crmRepo: ICRMRepository,
    @Inject('IPasswordHasher') private readonly hasher: IPasswordHasher,
    @Inject('IJwtService') private readonly jwt: IJwtService,
  ) {}

  async execute(request: RegisterDto): Promise<Result<AuthResponseDto>> {
    // 1. Check if user already exists
    const userExists = await this.userRepo.exists(request.email);
    if (userExists) {
      return Result.fail<AuthResponseDto>("A user with this email already exists");
    }

    // 2. Generate and check Organization Slug
    const slug = Organization.generateSlug(request.orgName);
    const existingOrg = await this.crmRepo.findOrganizationBySlug(slug);
    if (existingOrg) {
      return Result.fail<AuthResponseDto>("An organization with this name (or slug) already exists");
    }

    // 3. Create Password VO and Hash it
    const passwordResult = Password.create(request.password);
    if (passwordResult.isFailure) return Result.fail<AuthResponseDto>(passwordResult.error!);

    const hashedPassword = await this.hasher.hash(passwordResult.getValue().value);

    // 4. Create Organization Entity
    const orgResult = Organization.create({ name: request.orgName, slug });
    if (orgResult.isFailure) return Result.fail<AuthResponseDto>(orgResult.error!);
    const organization = orgResult.getValue();

    // 5. Create User Entity
    const emailResult = Email.create(request.email);
    if (emailResult.isFailure) return Result.fail<AuthResponseDto>(emailResult.error!);

    const userOrError = User.create({
      email: emailResult.getValue(),
      passwordHash: Password.createHashed(hashedPassword).getValue(),
      firstName: request.firstName,
      lastName: request.lastName,
      role: 'ADMIN', // First user in org is always admin
      orgId: organization.id,
      isActive: true,
    });

    if (userOrError.isFailure) return Result.fail<AuthResponseDto>(userOrError.error!);
    const user = userOrError.getValue();

    // 6. Persistence
    try {
      await this.crmRepo.saveOrganization(organization);
      await this.userRepo.save(user);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return Result.fail<AuthResponseDto>(`Onboarding failed: ${e.message}`);
    }

    // 7. Sign JWT so the user is immediately authenticated after registration
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email.value,
      role: user.role,
      orgId: user.orgId,
    });

    return Result.ok<AuthResponseDto>({
      user: this.userMapper.toDto(user),
      accessToken,
    });
  }
}
