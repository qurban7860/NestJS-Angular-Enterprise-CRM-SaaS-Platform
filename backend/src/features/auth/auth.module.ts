import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { Argon2HasherService } from './infrastructure/services/argon2-hasher.service';
import { JwtWrapperService } from './infrastructure/services/jwt-wrapper.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    CrmModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    ListUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,

    // Strategies
    JwtStrategy,

    // Interface Mappings (Infrastructure)
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IPasswordHasher',
      useClass: Argon2HasherService,
    },
    {
      provide: 'IJwtService',
      useClass: JwtWrapperService,
    },
  ],
  exports: [
    // Exporting Use Cases for potential use in other modules
    RegisterUseCase,
    LoginUseCase,
    'IUserRepository',
    'IJwtService',
  ],
})
export class AuthModule {}
