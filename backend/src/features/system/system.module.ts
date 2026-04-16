import { Module } from '@nestjs/common';
import { AuditLogsController } from './presentation/controllers/audit-logs.controller';

@Module({
  controllers: [AuditLogsController],
  // AuditService is globally provided via CoreModule — no need to import it here
})
export class SystemModule {}
