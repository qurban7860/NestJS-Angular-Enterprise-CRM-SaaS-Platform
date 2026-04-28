/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaBroadcastRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.broadcast.create({
      data,
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
  }

  async findActive(orgId?: string) {
    return this.prisma.broadcast.findMany({
      where: {
        isActive: true,
        OR: [
          { orgId: null },
          { orgId: orgId }
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
    });
  }

  async deactivate(id: string) {
    return this.prisma.broadcast.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
