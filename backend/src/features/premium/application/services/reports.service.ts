/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.customReport.findMany({
      where: { orgId },
      include: { owner: { select: { firstName: true, lastName: true } } },
    });
  }

  create(
    orgId: string,
    userId: string,
    data: { name: string; description?: string; config: any },
  ) {
    return this.prisma.customReport.create({
      data: { ...data, orgId, ownerId: userId },
    });
  }

  async findOne(id: string, orgId: string) {
    const report = await this.prisma.customReport.findFirst({
      where: { id, orgId },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async delete(id: string, orgId: string) {
    const report = await this.prisma.customReport.findFirst({
      where: { id, orgId },
    });
    if (!report) throw new NotFoundException('Report not found');
    return this.prisma.customReport.delete({ where: { id } });
  }

  // Analytics Engine Placeholder
  async runReport(id: string, orgId: string) {
    const report = await this.findOne(id, orgId);
    // Here we would implement complex aggregation logic based on report.config
    // For now, return a placeholder data structure
    return {
      reportName: report.name,
      generatedAt: new Date(),
      data: [
        { label: 'Jan', value: 4500 },
        { label: 'Feb', value: 5200 },
        { label: 'Mar', value: 4800 },
      ],
    };
  }
}
