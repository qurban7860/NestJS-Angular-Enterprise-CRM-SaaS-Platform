/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../../infrastructure/audit/audit.service';

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Map HTTP methods to audit actions
const METHOD_TO_ACTION: Record<string, 'CREATE' | 'UPDATE' | 'DELETE'> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// Extract entity type from URL paths like /api/v1/contacts/abc-123
function extractEntityType(url: string): {
  entityType: string;
  entityId: string;
} {
  const parts = url
    .replace(/^\/api\/v\d+\//, '')
    .split('/')
    .filter(Boolean);
  const entityType = parts[0]?.toUpperCase() ?? 'UNKNOWN';
  const entityId = parts[1] ?? 'N/A';
  return { entityType, entityId };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;

    if (!MUTATION_METHODS.includes(method)) {
      return next.handle();
    }

    const user = (req as any).user;
    if (!user?.id || !user?.orgId) {
      // Skip unauthenticated routes (e.g., /auth/login)
      return next.handle();
    }

    const action = METHOD_TO_ACTION[method]!;
    const { entityType, entityId } = extractEntityType(url);
    const requestBody = req.body;

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.auditService.log({
            userId: user.id,
            orgId: user.orgId,
            action,
            entityType,
            entityId: (responseBody as any)?.id ?? entityId,
            changes: {
              after: responseBody,
              request: requestBody,
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          });
        },
      }),
    );
  }
}
