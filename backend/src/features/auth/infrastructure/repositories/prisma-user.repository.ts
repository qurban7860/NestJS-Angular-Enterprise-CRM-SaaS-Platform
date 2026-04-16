/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { UserMapper } from '../../application/mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  private mapper = new UserMapper();

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return this.mapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return this.mapper.toDomain(user);
  }

  async findByOrgId(orgId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { orgId, isActive: true },
    });

    return users.map((user) => this.mapper.toDomain(user));
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const data = this.mapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false }, // Soft delete by default
    });
  }
}
