import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '../services/password-hasher.interface';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserMapper } from '../mappers/user.mapper';
import { PlanLimitsService } from '../../../../core/infrastructure/billing/plan-limits.service';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: 'MANAGER' | 'MEMBER';
  password?: string; // Optional, defaults to "Password123!" for demo
}

@Injectable()
export class CreateUserUseCase implements UseCase<
  CreateUserDto & { orgId: string },
  any
> {
  private userMapper = new UserMapper();

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('IPasswordHasher') private readonly hasher: IPasswordHasher,
    private readonly limitsService: PlanLimitsService,
  ) {}

  async execute(
    request: CreateUserDto & { orgId: string },
  ): Promise<Result<any>> {
    // 0. Check quota limit
    await this.limitsService.checkLimit(request.orgId, 'maxUsers');

    // 1. Check if user exists
    const exists = await this.userRepo.exists(request.email);
    if (exists) return Result.fail('User already exists');

    // 2. Hash password
    const rawPassword = request.password || 'Password123!';
    const hashedPassword = await this.hasher.hash(rawPassword);

    // 3. Create Entity
    const emailRes = Email.create(request.email);
    if (emailRes.isFailure) return Result.fail(emailRes.error!);

    const userRes = User.create({
      email: emailRes.getValue(),
      passwordHash: Password.createHashed(hashedPassword).getValue(),
      firstName: request.firstName,
      lastName: request.lastName,
      role: request.role,
      orgId: request.orgId,
      isActive: true,
    });

    if (userRes.isFailure) return Result.fail(userRes.error!);
    const user = userRes.getValue();

    // 4. Save
    await this.userRepo.save(user);

    return Result.ok(this.userMapper.toDto(user));
  }
}
