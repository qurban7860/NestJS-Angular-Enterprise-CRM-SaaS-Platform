import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '../services/password-hasher.interface';
import type { IJwtService } from '../services/jwt.service.interface';
import { LoginDto, AuthResponseDto } from '../dtos/auth.dto';
import { UserMapper } from '../mappers/user.mapper';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class LoginUseCase implements UseCase<LoginDto, AuthResponseDto> {
  private userMapper = new UserMapper();

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('IPasswordHasher') private readonly hasher: IPasswordHasher,
    @Inject('IJwtService') private readonly jwt: IJwtService,
  ) {}

  async execute(request: LoginDto): Promise<Result<AuthResponseDto>> {
    const user = await this.userRepo.findByEmail(request.email);
    if (!user) {
      return Result.fail<AuthResponseDto>("Invalid email or password");
    }

    if (!user.isActive) {
      return Result.fail<AuthResponseDto>("User account is deactivated");
    }

    const isPasswordValid = await this.hasher.compare(request.password, user.passwordHash.value);
    if (!isPasswordValid) {
      return Result.fail<AuthResponseDto>("Invalid email or password");
    }

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
