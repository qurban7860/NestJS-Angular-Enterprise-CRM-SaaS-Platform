import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';

export interface UpdateUserDto {
  userId: string;
  orgId: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER';
  isActive?: boolean;
  customRoleId?: string | null;
}

@Injectable()
export class UpdateUserUseCase implements UseCase<UpdateUserDto, any> {
  private userMapper = new UserMapper();

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(request: UpdateUserDto): Promise<Result<any>> {
    const user = await this.userRepo.findById(request.userId);

    if (!user || user.orgId !== request.orgId) {
      return Result.fail('User not found in this organization');
    }

    if (request.firstName !== undefined && request.lastName !== undefined) {
      user.updateProfile(request.firstName, request.lastName);
    }

    if (request.role !== undefined) {
      user.changeRole(request.role);
    }

    if (request.isActive !== undefined) {
      if (request.isActive) user.activate();
      else user.deactivate();
    }

    // Handle customRoleId directly via props for now as it's a simple property
    // In a stricter DDD we'd have a domain method, but for this platform's scope
    // updating the aggregate root's internal state is acceptable.
    if (request.customRoleId !== undefined) {
      (user as any).props.customRoleId = request.customRoleId;
    }

    await this.userRepo.save(user);

    return Result.ok(this.userMapper.toDto(user));
  }
}
