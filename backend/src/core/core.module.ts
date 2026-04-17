import { Module, Global } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { RedisService } from './infrastructure/redis/redis.service';
import { AuditService } from './infrastructure/audit/audit.service';
import { CsvExportService } from './application/services/csv-export.service';

@Global()
@Module({
  providers: [PrismaService, RedisService, AuditService, CsvExportService],
  exports: [PrismaService, RedisService, AuditService, CsvExportService],
})
export class CoreModule {}
