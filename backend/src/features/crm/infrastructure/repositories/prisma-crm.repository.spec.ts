import type { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { PrismaCRMRepository } from './prisma-crm.repository';

describe('PrismaCRMRepository', () => {
  it('scopes contact lookup by both contact and organization ids', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prisma = {
      contact: {
        findFirst,
      },
    } as unknown as PrismaService;
    const repository = new PrismaCRMRepository(prisma);

    await repository.findContactById('contact-a', 'org-a');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'contact-a',
        orgId: 'org-a',
      },
    });
  });
});
