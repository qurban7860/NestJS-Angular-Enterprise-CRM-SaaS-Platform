import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account deactivated');
    }
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
        org: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      orgId: user.orgId,
      orgName: userWithRole?.org?.name ?? 'Unknown Organization',
      customRole: userWithRole?.customRole ?? null,
    };
  }
}
