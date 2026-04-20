/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(event: any) {
    this.logger.log(`Handling Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const orgId = session.metadata?.['orgId'];
    const subscriptionId = session.subscription as string;

    if (!orgId || !subscriptionId) return;

    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        stripeSubscriptionId: subscriptionId,
      } as any,
    });
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const org = await this.prisma.organization.findFirst({
      where: { stripeSubscriptionId: subscription.id } as any,
    });

    if (!org) return;

    await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        subscriptionStatus: this.mapStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        // Map product/price to plan if needed
        plan: this.mapPriceToPlan(subscription.items.data[0].price.id),
      } as any,
    });
  }

  private mapStatus(status: string): any {
    const map: Record<string, string> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'UNPAID',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE_EXPIRED',
      trailing: 'TRIALING',
    };
    return map[status] || 'INCOMPLETE';
  }

  private mapPriceToPlan(priceId: string): any {
    if (priceId === process.env['STRIPE_PRO_PRICE_ID']) return 'PRO';
    if (priceId === process.env['STRIPE_ENTERPRISE_PRICE_ID'])
      return 'ENTERPRISE';
    return 'FREE';
  }
}
