import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class CustomRolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.customRole.findMany({
      where: { orgId },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
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
    if (!role)
      throw new NotFoundException('Role not found in your organisation');

    return this.prisma.customRole.update({ where: { id }, data });
  }

  async delete(id: string, orgId: string) {
    const role = await this.prisma.customRole.findFirst({
      where: { id, orgId },
    });
    if (!role)
      throw new NotFoundException('Role not found in your organisation');

    return this.prisma.customRole.delete({ where: { id } });
  }

  async assignRoleToUser(roleId: string, userId: string, orgId: string) {
    const role = await this.prisma.customRole.findFirst({
      where: { id: roleId, orgId },
      select: { id: true, name: true },
    });
    if (!role) {
      throw new NotFoundException('Custom role not found in your organisation');
    }

    const targetUser = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
      select: { id: true, email: true },
    });
    if (!targetUser) {
      throw new NotFoundException('Target user not found in your organisation');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { customRoleId: roleId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        customRole: { select: { id: true, name: true, permissions: true } },
      },
    });

    return {
      message: `Role "${role.name}" assigned to user successfully`,
      user: updated,
    };
  }

  async unassignRoleFromUser(userId: string, orgId: string) {
    const targetUser = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
      select: { id: true, customRoleId: true },
    });
    if (!targetUser) {
      throw new NotFoundException('Target user not found in your organisation');
    }
    if (!targetUser.customRoleId) {
      throw new BadRequestException(
        'User does not have a custom role assigned',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { customRoleId: null },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    return {
      message: 'Custom role unassigned from user successfully',
      user: updated,
    };
  }
}
