import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase implements UseCase<{ userId: string; orgId: string }, void> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(request: { userId: string; orgId: string; currentUserRole: string }): Promise<Result<void>> {
    const user = await this.userRepo.findById(request.userId);

    if (!user || user.orgId !== request.orgId) {
      return Result.fail('User not found or access denied');
    }

    if (user.role === 'ADMIN' && request.currentUserRole !== 'ADMIN') {
      return Result.fail('Only an administrator can delete an administrator account');
    }

    // We don't delete the last admin of an organization for safety
    if (user.role === 'ADMIN') {
        const members = await this.userRepo.findByOrgId(request.orgId);
        const admins = members.filter(m => m.role === 'ADMIN');
        if (admins.length <= 1) {
            return Result.fail('Cannot delete the last administrator of the organization');
        }
    }

    await this.userRepo.delete(request.userId);
    return Result.ok();
  }
}
