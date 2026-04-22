/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { Result } from '../../../../core/domain/base/result';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(event: any): Promise<Result<void>> {
    this.logger.log(`Handling Stripe event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        default:
          this.logger.debug(`Unhandled event type: ${event.type}`);
      }
      return Result.ok();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Webhook error: ${errorMessage}`, errorStack);
      return Result.ok();
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const orgId = session.metadata?.['orgId'];
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const customerEmail = session.customer_details?.email;

    this.logger.log(
      `Checkout completed - orgId: ${orgId}, subscription: ${subscriptionId}, customer: ${customerId}, email: ${customerEmail}`,
    );

    if (orgId) {
      try {
        await this.prisma.organization.update({
          where: { id: orgId },
          data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'ACTIVE',
            plan: 'PRO',
          } as any,
        });
        this.logger.log(`Updated org ${orgId} with subscription from metadata`);
        return;
      } catch (e) {
        const error = e as Error;
        this.logger.warn(`Failed to update org ${orgId}: ${error.message}`);
      }
    }

    if (customerId) {
      const org = await this.prisma.organization.findFirst({
        where: { stripeCustomerId: customerId } as any,
      });
      if (org) {
        await this.prisma.organization.update({
          where: { id: org.id },
          data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'ACTIVE',
            plan: 'PRO',
          } as any,
        });
        this.logger.log(`Updated org ${org.id} by customerId lookup`);
        return;
      }
    }

    // Strategy 3: Find org by user email (first ADMIN user in any org that doesn't have stripeCustomerId)
    if (customerEmail) {
      const user = await this.prisma.user.findFirst({
        where: { email: customerEmail, role: 'ADMIN' },
        include: { org: true },
      });
      if (user && user.org && !user.org.stripeCustomerId) {
        // This org doesn't have a stripeCustomerId yet - assign it
        await this.prisma.organization.update({
          where: { id: user.org.id },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'ACTIVE',
            plan: 'PRO',
          } as any,
        });
        this.logger.log(
          `Created customer for org ${user.org.id} by email lookup`,
        );
        return;
      }
    }

    this.logger.warn(`Could not find organization for checkout session`);
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const subscriptionId = subscription.id;
    const customerId = subscription.customer as string;

    this.logger.log(
      `Subscription updated - id: ${subscriptionId}, customer: ${customerId}, status: ${subscription.status}`,
    );

    let org = await this.prisma.organization.findFirst({
      where: { stripeSubscriptionId: subscriptionId } as any,
    });

    if (!org && customerId) {
      org = await this.prisma.organization.findFirst({
        where: { stripeCustomerId: customerId } as any,
      });
    }

    if (!org) {
      this.logger.warn(
        `Organization not found for subscription ${subscriptionId}`,
      );
      return;
    }

    const priceId = subscription.items?.data?.[0]?.price?.id;
    const plan = this.mapPriceToPlan(priceId);

    await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        subscriptionStatus: this.mapStatus(subscription.status),
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined,
        plan,
      } as any,
    });

    this.logger.log(
      `Updated org ${org.id} plan to ${plan}, status to ${this.mapStatus(subscription.status)}`,
    );
  }

  private mapStatus(status: string): any {
    const map: Record<string, string> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'UNPAID',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE_EXPIRED',
      trialing: 'TRIALING',
    };
    return map[status] || 'INCOMPLETE';
  }

  private mapPriceToPlan(priceId: string | undefined): any {
    if (!priceId) return 'PRO';
    if (priceId === process.env['STRIPE_PRO_PRICE_ID']) return 'PRO';
    if (priceId === process.env['STRIPE_ENTERPRISE_PRICE_ID'])
      return 'ENTERPRISE';
    return 'PRO';
  }
}
