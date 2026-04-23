/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class CustomRolesService {
  constructor(private prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.customRole.findMany({
      where: { orgId },
      include: { _count: { select: { users: true } } },
    });
  }

  create(
    orgId: string,
    data: { name: string; permissions: string[]; description?: string },
  ) {
    return this.prisma.customRole.create({
      data: { ...data, orgId },
    });
  }

  async update(
    id: string,
    orgId: string,
    data: { name?: string; permissions?: string[]; description?: string },
  ) {
    const role = await this.prisma.customRole.findFirst({
      where: { id, orgId },
    });
    if (!role) throw new NotFoundException('Role not found');

    return this.prisma.customRole.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, orgId: string) {
    const role = await this.prisma.customRole.findFirst({
      where: { id, orgId },
    });
    if (!role) throw new NotFoundException('Role not found');

    return this.prisma.customRole.delete({ where: { id } });
  }
}
