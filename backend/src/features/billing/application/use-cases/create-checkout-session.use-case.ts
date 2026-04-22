/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { StripeService } from '../../infrastructure/services/stripe.service';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { Result } from '../../../../core/domain/base/result';

export interface CreateCheckoutSessionDto {
  orgId: string;
  plan: 'PRO' | 'ENTERPRISE';
  successUrl: string;
  cancelUrl: string;
  userEmail?: string;
}

@Injectable()
export class CreateCheckoutSessionUseCase {
  private readonly logger = new Logger(CreateCheckoutSessionUseCase.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateCheckoutSessionDto): Promise<Result<string>> {
    try {
      const org = await this.prisma.organization.findUnique({
        where: { id: dto.orgId },
      });

      if (!org) {
        return Result.fail('Organization not found');
      }

      let customerId = (org as any).stripeCustomerId;

      if (!customerId) {
        const adminUser = await this.prisma.user.findFirst({
          where: { orgId: dto.orgId, role: 'ADMIN' },
          orderBy: { createdAt: 'asc' },
        });

        const customerEmail =
          dto.userEmail ||
          adminUser?.email ||
          `${org.slug}@enterprise.platform`;

        const customer = await this.stripeService.createCustomer(
          customerEmail,
          org.name,
        );
        customerId = customer.id;

        await this.prisma.organization.update({
          where: { id: dto.orgId },
          data: { stripeCustomerId: customerId } as any,
        });
      }

      const priceId = this.getPriceId(dto.plan);

      const session = await this.stripeService.createCheckoutSession({
        customerId,
        priceId,
        successUrl: dto.successUrl,
        cancelUrl: dto.cancelUrl,
        orgId: dto.orgId,
      });

      return Result.ok(session.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Checkout Session Error: ${message}`, stack);
      return Result.fail(message);
    }
  }

  private getPriceId(plan: string): string {
    const priceId =
      plan === 'PRO'
        ? process.env['STRIPE_PRO_PRICE_ID']
        : process.env['STRIPE_ENTERPRISE_PRICE_ID'];

    if (!priceId) {
      throw new Error(
        `Missing Stripe price ID for plan: ${plan}. Check environment variables.`,
      );
    }
    return priceId;
  }
}
