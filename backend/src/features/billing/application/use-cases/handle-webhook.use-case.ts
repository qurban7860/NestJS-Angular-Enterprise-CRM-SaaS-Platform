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
    const eventId = event.id;
    const eventType = event.type;

    this.logger.log(`Handling event: ${eventType} (${eventId})`);

    try {
      switch (eventType) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          this.logger.debug(`Unhandled event type: ${eventType}`);
      }

      this.logger.log(`Successfully processed event: ${eventType}`);
      return Result.ok();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error processing ${eventType}: ${errorMessage}`,
        errorStack,
      );

      // Return failure so controller can log it properly
      return Result.fail(errorMessage);
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const sessionId = session.id;
    const orgId = session.metadata?.orgId;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const customerEmail = session.customer_details?.email;
    const amountTotal = session.amount_total;

    this.logger.log(
      `Checkout completed: session=${sessionId}, orgId=${orgId}, subscription=${subscriptionId}, customer=${customerId}, email=${customerEmail}, amount=${amountTotal}`,
    );

    // Strategy 1: Use orgId from metadata (most reliable)
    if (orgId) {
      try {
        await this.prisma.organization.update({
          where: { id: orgId },
          data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'ACTIVE',
            plan: 'PRO',
          },
        });
        this.logger.log(`Updated org ${orgId} with PRO plan from metadata`);
        return;
      } catch (e) {
        const error = e as Error;
        this.logger.warn(
          `Failed to update org ${orgId} by metadata: ${error.message}`,
        );
        // Continue to fallback strategies
      }
    }

    // Strategy 2: Find org by stripeCustomerId
    if (customerId) {
      try {
        const org = await this.prisma.organization.findUnique({
          where: { stripeCustomerId: customerId },
        });
        if (org) {
          await this.prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'ACTIVE',
              plan: 'PRO',
            },
          });
          this.logger.log(`Updated org ${org.id} by customerId lookup`);
          return;
        }
      } catch (e) {
        const error = e as Error;
        this.logger.warn(
          `Failed to find org by customerId ${customerId}: ${error.message}`,
        );
      }
    }

    // Strategy 3: Find org by user email (for existing admin users)
    if (customerEmail) {
      try {
        const user = await this.prisma.user.findFirst({
          where: {
            email: customerEmail,
            role: 'ADMIN',
          },
          include: { org: true },
        });

        if (user?.org) {
          // Update customer association and subscription
          await this.prisma.organization.update({
            where: { id: user.org.id },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'ACTIVE',
              plan: 'PRO',
            },
          });
          this.logger.log(
            `Updated org ${user.org.id} by email lookup and assigned customer ${customerId}`,
          );
          return;
        }
      } catch (e) {
        const error = e as Error;
        this.logger.warn(
          `Failed to find org by email ${customerEmail}: ${error.message}`,
        );
      }
    }

    this.logger.warn(
      `Could not find organization for checkout session ${sessionId}. Data: orgId=${orgId}, customerId=${customerId}, email=${customerEmail}`,
    );
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const subscriptionId = subscription.id;
    const customerId = subscription.customer as string;
    const status = subscription.status;
    const currentPeriodEnd = subscription.current_period_end;

    this.logger.log(
      `Subscription updated: id=${subscriptionId}, customer=${customerId}, status=${status}`,
    );

    // Find org by subscriptionId first
    let org = await this.prisma.organization.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    // Fallback: find by customerId
    if (!org && customerId) {
      org = await this.prisma.organization.findUnique({
        where: { stripeCustomerId: customerId },
      });
    }

    if (!org) {
      this.logger.warn(
        `Organization not found for subscription ${subscriptionId}`,
      );
      return;
    }

    // Determine plan from price ID
    const priceId = subscription.items?.data?.[0]?.price?.id;
    const plan = this.mapPriceToPlan(priceId);

    // Map Stripe status to our enum
    const subscriptionStatus = this.mapStatus(status);

    await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        subscriptionStatus,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        plan,
      },
    });

    this.logger.log(
      `Updated org ${org.id}: plan=${plan}, status=${subscriptionStatus}`,
    );
  }

  private async handleInvoicePaymentSucceeded(invoice: any) {
    const invoiceId = invoice.id;
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;
    const amountPaid = invoice.amount_paid;

    this.logger.log(
      `Invoice paid: ${invoiceId}, customer=${customerId}, subscription=${subscriptionId}, amount=${amountPaid}`,
    );

    // Update subscription status to ACTIVE
    let org = await this.prisma.organization.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!org && subscriptionId) {
      org = await this.prisma.organization.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });
    }

    if (org) {
      await this.prisma.organization.update({
        where: { id: org.id },
        data: {
          subscriptionStatus: 'ACTIVE',
        },
      });
      this.logger.log(`Marked org ${org.id} as ACTIVE after invoice payment`);
    }
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    const invoiceId = invoice.id;
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;

    this.logger.log(
      `Invoice failed: ${invoiceId}, customer=${customerId}, subscription=${subscriptionId}`,
    );

    // Update subscription status to PAST_DUE
    let org = await this.prisma.organization.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!org && subscriptionId) {
      org = await this.prisma.organization.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });
    }

    if (org) {
      await this.prisma.organization.update({
        where: { id: org.id },
        data: {
          subscriptionStatus: 'PAST_DUE',
        },
      });
      this.logger.warn(`Marked org ${org.id} as PAST_DUE after failed payment`);
    }
  }

  private mapStatus(
    status: string,
  ): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING' | 'INCOMPLETE' {
    const map: Record<
      string,
      'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING' | 'INCOMPLETE'
    > = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'UNPAID',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE',
      trialing: 'TRIALING',
    };
    return map[status] || 'INCOMPLETE';
  }

  private mapPriceToPlan(
    priceId: string | undefined,
  ): 'FREE' | 'PRO' | 'ENTERPRISE' {
    if (!priceId) return 'PRO';
    if (priceId === process.env['STRIPE_PRO_PRICE_ID']) return 'PRO';
    if (priceId === process.env['STRIPE_ENTERPRISE_PRICE_ID'])
      return 'ENTERPRISE';
    return 'PRO';
  }
}
