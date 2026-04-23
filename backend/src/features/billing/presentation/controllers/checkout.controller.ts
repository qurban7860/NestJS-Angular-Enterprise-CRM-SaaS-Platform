/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Body,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from '../../application/use-cases/create-checkout-session.use-case';
import { StripeService } from '../../infrastructure/services/stripe.service';
import { PrismaService } from '../../../../core/infrastructure/prisma/prisma.service';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlanLimitsService } from '../../../../core/infrastructure/billing/plan-limits.service';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing/checkout')
export class CheckoutController {
  constructor(
    private readonly createSession: CreateCheckoutSessionUseCase,
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly limitsService: PlanLimitsService,
  ) {}

  @Get('limits')
  @ApiOperation({ summary: 'Get organization plan limits' })
  async getLimits(@CurrentUser() user: any) {
    return this.limitsService.getLimits(user.orgId);
  }

  @Post('session')
  @ApiOperation({ summary: 'Create a Stripe Checkout session' })
  async create(
    @CurrentUser() user: any,
    @Body() body: { plan: 'PREMIUM' | 'ENTERPRISE' },
  ) {
    const baseUrls = (process.env['CORS_ORIGIN'] || '').split(',');
    const baseUrl = baseUrls[0].trim();
    if (!baseUrl) {
      throw new InternalServerErrorException(
        'CORS_ORIGIN environment variable is not set',
      );
    }

    const result = await this.createSession.execute({
      orgId: user.orgId,
      plan: body.plan,
      userEmail: user.email,
      successUrl: `${baseUrl}/billing/success`,
      cancelUrl: `${baseUrl}/billing/cancel`,
    });

    if (result.isFailure) {
      if (result.error === 'Organization not found') {
        throw new BadRequestException(result.error);
      }
      throw new InternalServerErrorException(
        result.error || 'Failed to create checkout session',
      );
    }

    return { url: result.getValue() };
  }

  @Get('status')
  @ApiOperation({ summary: 'Sync subscription status from Stripe' })
  async syncStatus(@CurrentUser() user: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: user.orgId },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    // Step 1: If we have a stripeCustomerId, check Stripe for existing subscriptions
    if (org.stripeCustomerId) {
      try {
        const subs = await this.stripeService.listSubscriptions(
          org.stripeCustomerId,
        );
        if (subs.data.length > 0) {
          const sub = subs.data[0];
          await this.prisma.organization.update({
            where: { id: user.orgId },
            data: {
              stripeSubscriptionId: sub.id,
              subscriptionStatus: this.mapStripeStatus(sub.status),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              plan: this.mapPriceToPlan(sub.items.data[0]?.price?.id),
            } as any,
          });
          return {
            plan: this.mapPriceToPlan(sub.items.data[0]?.price?.id),
            status: this.mapStripeStatus(sub.status),
            currentPeriodEnd: new Date(
              sub.current_period_end * 1000,
            ).toISOString(),
          };
        }
      } catch {
        // Fall through to check stripeSubscriptionId directly
      }
    }

    // Step 2: If we have a stripeSubscriptionId, fetch it directly
    if (org.stripeSubscriptionId) {
      try {
        const sub = await this.stripeService.getSubscription(
          org.stripeSubscriptionId,
        );
        await this.prisma.organization.update({
          where: { id: user.orgId },
          data: {
            subscriptionStatus: this.mapStripeStatus(sub.status),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            plan: this.mapPriceToPlan(sub.items.data[0]?.price?.id),
          } as any,
        });
        return {
          plan: this.mapPriceToPlan(sub.items.data[0]?.price?.id),
          status: this.mapStripeStatus(sub.status),
          currentPeriodEnd: new Date(
            sub.current_period_end * 1000,
          ).toISOString(),
        };
      } catch {
        // Subscription might be canceled/deleted
        return {
          plan: org.plan,
          status: org.subscriptionStatus,
          currentPeriodEnd: org.currentPeriodEnd,
        };
      }
    }

    return { plan: 'FREE', status: null, currentPeriodEnd: null };
  }

  // For local testing via Stripe CLI - creates a subscription for testing
  @Post('test-subscription')
  @ApiOperation({ summary: 'Create test subscription for local CLI testing' })
  async createTestSubscription(@CurrentUser() user: any) {
    // Get or create customer
    const org = await this.prisma.organization.findUnique({
      where: { id: user.orgId },
    });

    let customerId = org?.stripeCustomerId;

    if (!customerId && org) {
      // Create a customer in Stripe for this org
      const customer = await this.stripeService.createCustomer(
        user.email,
        org.name,
      );
      customerId = customer.id;

      await this.prisma.organization.update({
        where: { id: user.orgId },
        data: { stripeCustomerId: customerId } as any,
      });
    }

    if (!customerId) {
      throw new BadRequestException('No stripe customer found');
    }

    // Create a subscription in Stripe using the price
    const priceId = process.env['STRIPE_PREMIUM_PRICE_ID'];
    if (!priceId) {
      throw new InternalServerErrorException('STRIPE_PREMIUM_PRICE_ID not set');
    }

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['data.latest_invoice.payment_intent'],
    });

    // Update org with subscription
    await this.prisma.organization.update({
      where: { id: user.orgId },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: this.mapStripeStatus(subscription.status),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plan: 'PREMIUM',
      } as any,
    });

    return {
      subscriptionId: subscription.id,
      status: this.mapStripeStatus(subscription.status),
      customerId,
      plan: 'PREMIUM',
    };
  }

  private get stripe() {
    return this.stripeService.getStripeInstance();
  }

  private mapStripeStatus(status: string): any {
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
    if (!priceId) return 'PREMIUM';
    if (priceId === process.env['STRIPE_PREMIUM_PRICE_ID']) return 'PREMIUM';
    if (priceId === process.env['STRIPE_ENTERPRISE_PRICE_ID'])
      return 'ENTERPRISE';
    return 'PREMIUM';
  }
}
