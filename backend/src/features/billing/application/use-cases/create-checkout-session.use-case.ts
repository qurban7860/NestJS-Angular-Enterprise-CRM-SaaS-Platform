/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { StripeService } from '../../infrastructure/services/stripe.service';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { Result } from '../../../../core/domain/base/result';

export interface CreateCheckoutSessionDto {
  orgId: string;
  plan: 'PRO' | 'ENTERPRISE';
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateCheckoutSessionDto): Promise<Result<string>> {
    const org = await this.prisma.organization.findUnique({
      where: { id: dto.orgId },
    });

    if (!org) {
      return Result.fail('Organization not found');
    }

    let customerId = (org as any).stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer if it doesn't exist
      const customer = await this.stripeService.createCustomer(
        `${org.slug}@enterprise.platform`, // Placeholder email or use admin email
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
  }

  private getPriceId(plan: string): string {
    // In a real app, these would come from environment or DB
    return plan === 'PRO'
      ? process.env['STRIPE_PRO_PRICE_ID']!
      : process.env['STRIPE_ENTERPRISE_PRICE_ID']!;
  }
}
