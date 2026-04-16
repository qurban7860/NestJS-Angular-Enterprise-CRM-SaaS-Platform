import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface AuditLogEntry {
  userId: string;
  orgId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entityType: string;
  entityId: string;
  changes?: Record<string, { before?: any; after?: any }>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a business event to the audit log asynchronously.
   * Fire-and-forget: errors here should never block the main request.
   */
  log(entry: AuditLogEntry): void {
    const { changes, ...rest } = entry;
    this.prisma.auditLog
      .create({
        data: {
          ...rest,
          changes: changes ?? {},
        },
      })
      .catch((err) => {
        console.error('[AuditService] Failed to write audit log:', err?.message);
      });
  }

  /**
   * Paginated retrieval of audit logs for a given organization.
   * Restricted to ADMIN users only (enforced at controller level).
   */
  async findByOrg(
    orgId: string,
    page = 1,
    limit = 25,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where: { orgId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
