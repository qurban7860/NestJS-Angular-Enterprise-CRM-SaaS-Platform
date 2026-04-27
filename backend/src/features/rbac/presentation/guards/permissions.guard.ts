import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import {
  PERMISSIONS_KEY,
  Permission,
} from '../decorators/require-permissions.decorator';

interface AuthenticatedUser {
  id: string;
  orgId: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  customRole?: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    const user = request.user;
    if (user.role === 'ADMIN') return true;

    let customRole = user.customRole;

    if (customRole === undefined) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          customRole: {
            select: { id: true, name: true, permissions: true },
          },
        },
      });
      customRole = dbUser?.customRole ?? null;
      request.user.customRole = customRole;
    }

    if (!customRole) {
      this.logger.warn(
        `Permission denied: user=${user.id} has no customRole assigned. ` +
          `Required: [${requiredPermissions.join(', ')}]`,
      );
      throw new ForbiddenException(
        'You have not been assigned a custom role. Contact your organization admin.',
      );
    }

    const userPermissions = new Set(customRole.permissions);
    const missingPermissions = requiredPermissions.filter(
      (p) => !userPermissions.has(p),
    );

    if (missingPermissions.length > 0) {
      this.logger.warn(
        `Permission denied: user=${user.id} role="${customRole.name}" ` +
          `missing=[${missingPermissions.join(', ')}]`,
      );
      throw new ForbiddenException({
        message: 'Insufficient permissions for this action.',
        missing: missingPermissions,
        yourRole: customRole.name,
      });
    }

    return true;
  }
}
