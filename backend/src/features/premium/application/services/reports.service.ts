/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

/** Supported report types — accepts both short and long form */
type ReportType = 'SALES' | 'CRM' | 'PERFORMANCE' | 'PIPELINE';

const TYPE_NORMALIZER: Record<string, ReportType> = {
  SALES: 'SALES',
  SALES_ACTIVITY: 'SALES',
  CRM: 'CRM',
  CRM_HEALTH: 'CRM',
  PERFORMANCE: 'PERFORMANCE',
  TEAM_PERFORMANCE: 'PERFORMANCE',
  PIPELINE: 'PIPELINE',
  PIPELINE_FORECAST: 'PIPELINE',
};

/** Date range helpers */
function getDateRange(range: string): { gte: Date } | undefined {
  const now = new Date();
  const map: Record<string, number> = {
    LAST_7_DAYS: 7,
    LAST_30_DAYS: 30,
    LAST_90_DAYS: 90,
    LAST_365_DAYS: 365,
    ALL_TIME: 0,
  };
  const days = map[range] ?? 30;
  if (days === 0) return undefined;
  const gte = new Date(now);
  gte.setDate(gte.getDate() - days);
  return { gte };
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ── CRUD ──────────────────────────────────────────────────────────────────

  findAll(orgId: string) {
    return this.prisma.customReport.findMany({
      where: { orgId },
      include: { owner: { select: { firstName: true, lastName: true } } },
      orderBy: { updatedAt: 'desc' },
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

  // ── Report Engine ──────────────────────────────────────────────────────────

  async runReport(id: string, orgId: string) {
    const report = await this.findOne(id, orgId);
    const config = report.config as any;
    const rawType: string = (config?.type ?? 'SALES').toUpperCase();
    const reportType: ReportType = TYPE_NORMALIZER[rawType] ?? 'SALES';
    const range: string = config?.range ?? 'LAST_30_DAYS';
    const dateFilter = getDateRange(range);

    let data: any[] = [];
    let summary: Record<string, any> = {};

    switch (reportType) {
      case 'SALES':
        ({ data, summary } = await this._salesReport(orgId, dateFilter));
        break;
      case 'CRM':
        ({ data, summary } = await this._crmReport(orgId, dateFilter));
        break;
      case 'PERFORMANCE':
        ({ data, summary } = await this._performanceReport(orgId, dateFilter));
        break;
      case 'PIPELINE':
        ({ data, summary } = await this._pipelineReport(orgId, dateFilter));
        break;
      default:
        ({ data, summary } = await this._salesReport(orgId, dateFilter));
    }

    // Stamp lastGeneratedAt
    await this.prisma.customReport.update({
      where: { id },
      data: { lastGeneratedAt: new Date() },
    });

    return {
      reportName: report.name,
      reportType,
      range,
      generatedAt: new Date().toISOString(),
      summary,
      data,
    };
  }

  // ── Sales Activity Report ─────────────────────────────────────────────────
  private async _salesReport(
    orgId: string,
    dateFilter: { gte: Date } | undefined,
  ) {
    const where: any = { orgId, isDeleted: false };
    if (dateFilter) where.createdAt = dateFilter;

    const deals = await this.prisma.deal.findMany({
      where,
      select: {
        title: true,
        stage: true,
        valueAmount: true,
        valueCurrency: true,
        probability: true,
        createdAt: true,
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalValue = deals.reduce((acc, d) => acc + Number(d.valueAmount), 0);
    const avgDeal = deals.length ? totalValue / deals.length : 0;
    const closed = deals.filter((d) => d.stage === 'CLOSED_WON');
    const closedValue = closed.reduce(
      (acc, d) => acc + Number(d.valueAmount),
      0,
    );

    return {
      summary: {
        totalDeals: deals.length,
        totalPipelineValue: `$${totalValue.toFixed(2)}`,
        totalClosedValue: `$${closedValue.toFixed(2)}`,
        avgDealSize: `$${avgDeal.toFixed(2)}`,
        winRate: deals.length
          ? `${((closed.length / deals.length) * 100).toFixed(1)}%`
          : '0%',
      },
      data: deals.map((d) => ({
        title: d.title,
        stage: d.stage,
        value: `$${Number(d.valueAmount).toFixed(2)}`,
        currency: d.valueCurrency,
        probability: `${Number(d.probability ?? 0)}%`,
        owner: `${d.owner?.firstName ?? ''} ${d.owner?.lastName ?? ''}`.trim(),
        createdAt: d.createdAt.toISOString().split('T')[0],
      })),
    };
  }

  // ── CRM Health Report ─────────────────────────────────────────────────────
  private async _crmReport(
    orgId: string,
    dateFilter: { gte: Date } | undefined,
  ) {
    const where: any = { orgId, isDeleted: false };
    if (dateFilter) where.createdAt = dateFilter;

    const [contacts, leads, qualified, customers] = await Promise.all([
      this.prisma.contact.count({ where }),
      this.prisma.contact.count({ where: { ...where, status: 'LEAD' } }),
      this.prisma.contact.count({ where: { ...where, status: 'QUALIFIED' } }),
      this.prisma.contact.count({ where: { ...where, status: 'CUSTOMER' } }),
    ]);

    const recentContacts = await this.prisma.contact.findMany({
      where,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      summary: {
        totalContacts: contacts,
        leads,
        qualified,
        customers,
        conversionRate: leads
          ? `${(((qualified + customers) / leads) * 100).toFixed(1)}%`
          : '0%',
      },
      data: recentContacts.map((c) => ({
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        status: c.status,
        addedOn: c.createdAt.toISOString().split('T')[0],
      })),
    };
  }

  // ── Team Performance Report ───────────────────────────────────────────────
  private async _performanceReport(
    orgId: string,
    dateFilter: { gte: Date } | undefined,
  ) {
    const where: any = { orgId, isDeleted: false };
    if (dateFilter) where.createdAt = dateFilter;

    const tasks = await this.prisma.task.findMany({
      where,
      select: {
        status: true,
        priority: true,
        dueDate: true,
        assignee: { select: { firstName: true, lastName: true } },
      },
    });

    // Aggregate by assignee
    const byAssignee: Record<
      string,
      { total: number; done: number; overdue: number }
    > = {};

    tasks.forEach((t) => {
      const name = t.assignee
        ? `${t.assignee.firstName} ${t.assignee.lastName}`
        : 'Unassigned';
      if (!byAssignee[name])
        byAssignee[name] = { total: 0, done: 0, overdue: 0 };
      byAssignee[name].total++;
      if (t.status === 'DONE') byAssignee[name].done++;
      if (
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        t.status !== 'DONE'
      ) {
        byAssignee[name].overdue++;
      }
    });

    const data = Object.entries(byAssignee).map(([name, stats]) => ({
      teamMember: name,
      totalTasks: stats.total,
      completedTasks: stats.done,
      overdueTasks: stats.overdue,
      completionRate:
        stats.total > 0
          ? `${((stats.done / stats.total) * 100).toFixed(1)}%`
          : '0%',
    }));

    return {
      summary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'DONE').length,
        overdueTasks: tasks.filter(
          (t) =>
            t.dueDate &&
            new Date(t.dueDate) < new Date() &&
            t.status !== 'DONE',
        ).length,
        teamSize: Object.keys(byAssignee).filter((k) => k !== 'Unassigned')
          .length,
      },
      data,
    };
  }

  // ── Pipeline Forecast Report ──────────────────────────────────────────────
  private async _pipelineReport(
    orgId: string,
    dateFilter: { gte: Date } | undefined,
  ) {
    const where: any = { orgId, isDeleted: false };
    if (dateFilter) where.createdAt = dateFilter;

    const deals = await this.prisma.deal.findMany({
      where,
      select: {
        stage: true,
        valueAmount: true,
        probability: true,
        expectedCloseDate: true,
      },
    });

    const stages = [
      'PROSPECTING',
      'QUALIFICATION',
      'PROPOSAL',
      'NEGOTIATION',
      'CLOSED_WON',
      'CLOSED_LOST',
    ];

    const data = stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      const totalValue = stageDeals.reduce(
        (acc, d) => acc + Number(d.valueAmount),
        0,
      );
      const weightedValue = stageDeals.reduce(
        (acc, d) =>
          acc + Number(d.valueAmount) * (Number(d.probability ?? 0) / 100),
        0,
      );
      return {
        stage,
        dealCount: stageDeals.length,
        totalValue: `$${totalValue.toFixed(2)}`,
        weightedForecast: `$${weightedValue.toFixed(2)}`,
      };
    });

    const totalForecast = data.reduce(
      (acc, s) => acc + Number(s.weightedForecast.replace('$', '')),
      0,
    );

    return {
      summary: {
        totalDeals: deals.length,
        totalPipelineValue: `$${deals.reduce((a, d) => a + Number(d.valueAmount), 0).toFixed(2)}`,
        weightedForecast: `$${totalForecast.toFixed(2)}`,
        stagesActive: data.filter((s) => s.dealCount > 0).length,
      },
      data,
    };
  }
}
