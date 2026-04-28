import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BroadcastGateway } from './presentation/gateways/broadcast.gateway';
import { BroadcastController } from './presentation/controllers/broadcast.controller';
import { CreateBroadcastUseCase } from './application/use-cases/create-broadcast.use-case';
import { PrismaBroadcastRepository } from './infrastructure/repositories/prisma-broadcast.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [BroadcastController],
  providers: [
    BroadcastGateway,
    CreateBroadcastUseCase,
    PrismaBroadcastRepository,
  ],
  exports: [BroadcastGateway],
})
export class BroadcastingModule {}
