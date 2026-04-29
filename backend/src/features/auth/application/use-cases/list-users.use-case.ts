import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos/auth.dto';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ListUsersUseCase implements UseCase<string, UserResponseDto[]> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(orgId: string): Promise<Result<UserResponseDto[]>> {
    const users = await this.userRepo.findByOrgId(orgId);

    return Result.ok<UserResponseDto[]>(
      users.map((user) => ({
        id: user.id,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        orgId: user.orgId,
        isActive: user.isActive,
      })),
    );
  }
}
