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
import { EventEmitter2 } from '@nestjs/event-emitter';

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_TO_ACTION: Record<string, 'CREATE' | 'UPDATE' | 'DELETE'> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

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
  constructor(private readonly eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;

    if (!MUTATION_METHODS.includes(method)) {
      return next.handle();
    }

    const user = (req as any).user;
    if (!user?.id || !user?.orgId) {
      return next.handle();
    }

    const action = METHOD_TO_ACTION[method]!;
    const { entityType, entityId } = extractEntityType(url);
    const requestBody = req.body;

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          // Emit event instead of direct service call to keep core logic clean
          this.eventEmitter.emit('audit.log', {
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
