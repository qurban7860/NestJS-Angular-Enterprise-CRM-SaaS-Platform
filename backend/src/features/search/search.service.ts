import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(orgId: string, query: string) {
    if (!query || query.length < 2) return [];

    const q = query.toLowerCase();

    const [contacts, deals, tasks] = await Promise.all([
      this.prisma.contact.findMany({
        where: {
          orgId,
          isDeleted: false,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      this.prisma.deal.findMany({
        where: {
          orgId,
          isDeleted: false,
          title: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      }),
      this.prisma.task.findMany({
        where: {
          orgId,
          isDeleted: false,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    const results = [];

    if (contacts.length > 0) {
      results.push({
        type: 'Contacts',
        results: contacts.map((c: any) => ({
          id: c.id,
          title: `${c.firstName} ${c.lastName}`,
          subtitle: c.email,
          type: 'contact',
          url: `/crm/contacts/${c.id}`,
        })),
      });
    }

    if (deals.length > 0) {
      results.push({
        type: 'Deals',
        results: deals.map((d: any) => ({
          id: d.id,
          title: d.title,
          subtitle: `Stage: ${d.stage}`,
          type: 'deal',
          url: `/crm/deals/${d.id}`,
        })),
      });
    }

    if (tasks.length > 0) {
      results.push({
        type: 'Tasks',
        results: tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          subtitle: `Priority: ${t.priority}`,
          type: 'task',
          url: `/tasks`,
        })),
      });
    }

    return results;
  }
}
