import { Module, Global } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { RedisService } from './infrastructure/redis/redis.service';
import { AuditService } from './infrastructure/audit/audit.service';

@Global()
@Module({
  providers: [PrismaService, RedisService, AuditService],
  exports: [PrismaService, RedisService, AuditService],
})
export class CoreModule {}
