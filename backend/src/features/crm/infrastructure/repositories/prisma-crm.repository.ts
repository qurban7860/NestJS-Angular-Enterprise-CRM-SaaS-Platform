/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ICRMRepository } from '../../domain/repositories/crm.repository.interface';
import { Contact } from '../../domain/entities/contact.entity';
import { Company } from '../../domain/entities/company.entity';
import { Deal } from '../../domain/entities/deal.entity';
import { Organization } from '../../domain/entities/organization.entity';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaCRMRepository implements ICRMRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Organization ──────────────────────────────────────────
  async findOrganizationById(id: string): Promise<Organization | null> {
    const raw = await this.prisma.organization.findUnique({ where: { id } });
    if (!raw) return null;

    return Organization.create(
      {
        name: raw.name,
        slug: raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    ).getValue();
  }

  async findOrganizationBySlug(slug: string): Promise<Organization | null> {
    const raw = await this.prisma.organization.findUnique({ where: { slug } });
    if (!raw) return null;

    return Organization.create(
      {
        name: raw.name,
        slug: raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    ).getValue();
  }

  async saveOrganization(org: Organization): Promise<void> {
    const data = {
      name: org.name,
      slug: org.slug,
    };

    await this.prisma.organization.upsert({
      where: { id: org.id },
      update: data,
      create: { ...data, id: org.id },
    });
  }

  // ── Contact ───────────────────────────────────────────────
  async findContactById(id: string): Promise<Contact | null> {
    const raw = await this.prisma.contact.findUnique({ where: { id } });
    if (!raw) return null;
    return this.mapToContact(raw);
  }

  async findContactsByOrgId(orgId: string): Promise<Contact[]> {
    const raws = await this.prisma.contact.findMany({
      where: { orgId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return raws.map((raw) => this.mapToContact(raw));
  }

  async searchContacts(orgId: string, query: string): Promise<Contact[]> {
    const raws = await this.prisma.contact.findMany({
      where: {
        orgId,
        isDeleted: false,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    return raws.map((raw) => this.mapToContact(raw));
  }

  private mapToContact(raw: any): Contact {
    return Contact.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: raw.email,
        phone: raw.phone || undefined,
        status: raw.status as any,
        orgId: raw.orgId,
        ownerId: raw.ownerId,
        companyId: raw.companyId || undefined,
        tags: raw.tags,
        notes: raw.notes || undefined,
        isDeleted: raw.isDeleted,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    ).getValue();
  }

  async saveContact(contact: Contact): Promise<void> {
    const data = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      status: contact.status,
      orgId: contact.orgId,
      ownerId: contact.ownerId,
      companyId: contact.companyId,
      tags: contact.tags,
      notes: contact.notes,
      isDeleted: contact.isDeleted,
    };

    await this.prisma.contact.upsert({
      where: { id: contact.id },
      update: data,
      create: { ...data, id: contact.id },
    });
  }

  // ── Company ───────────────────────────────────────────────
  async findCompanyById(id: string): Promise<Company | null> {
    const raw = await this.prisma.company.findUnique({ where: { id } });
    if (!raw) return null;

    return Company.create(
      {
        name: raw.name,
        industry: raw.industry || undefined,
        website: raw.website || undefined,
        size: raw.size as any,
        orgId: raw.orgId,
        isDeleted: raw.isDeleted,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    ).getValue();
  }

  async saveCompany(company: Company): Promise<void> {
    const data = {
      name: company.name,
      industry: company.industry,
      website: company.website,
      size: company.size,
      orgId: company.orgId,
      isDeleted: company.isDeleted,
    };

    await this.prisma.company.upsert({
      where: { id: company.id },
      update: data,
      create: { ...data, id: company.id },
    });
  }

  // ── Deal ──────────────────────────────────────────────────
  async findDealById(id: string): Promise<Deal | null> {
    const raw = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!raw) return null;
    return this.mapToDeal(raw);
  }

  async findDealsByOrgId(orgId: string): Promise<Deal[]> {
    const raws = await this.prisma.deal.findMany({
      where: { orgId, isDeleted: false },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return raws.map((raw) => this.mapToDeal(raw));
  }

  async searchDeals(orgId: string, query: string): Promise<Deal[]> {
    const raws = await this.prisma.deal.findMany({
      where: {
        orgId,
        isDeleted: false,
        OR: [{ title: { contains: query, mode: 'insensitive' } }],
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });
    return raws.map((raw) => this.mapToDeal(raw));
  }

  private mapToDeal(raw: any): Deal {
    const deal = Deal.create(
      {
        title: raw.title,
        valueAmount: Number(raw.valueAmount),
        valueCurrency: raw.valueCurrency,
        stage: raw.stage as any,
        orgId: raw.orgId,
        ownerId: raw.ownerId,
        contactId: raw.contactId,
        companyId: raw.companyId,
        expectedCloseDate: raw.expectedCloseDate || undefined,
        probability: raw.probability ? Number(raw.probability) : undefined,
        closedAt: raw.closedAt || undefined,
        isDeleted: raw.isDeleted,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    ).getValue();

    if (raw.contact) {
      (deal as any).contact = raw.contact;
    }

    return deal;
  }

  async saveDeal(deal: Deal): Promise<void> {
    const data = {
      title: deal.title,
      valueAmount: deal.valueAmount,
      valueCurrency: deal.valueCurrency,
      stage: deal.stage,
      orgId: deal.orgId,
      ownerId: deal.ownerId,
      contactId: deal.contactId ?? null,
      companyId: deal.companyId ?? null,
      expectedCloseDate: deal.expectedCloseDate ?? null,
      probability: deal.probability ?? null,
      closedAt: deal.closedAt ?? null,
      isDeleted: deal.isDeleted,
    };

    await this.prisma.deal.upsert({
      where: { id: deal.id },
      update: data,
      create: { ...data, id: deal.id },
    });
  }
}
