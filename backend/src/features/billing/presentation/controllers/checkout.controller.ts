/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body } from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from '../../application/use-cases/create-checkout-session.use-case';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing/checkout')
export class CheckoutController {
  constructor(private readonly createSession: CreateCheckoutSessionUseCase) {}

  @Post('session')
  @ApiOperation({ summary: 'Create a Stripe Checkout session' })
  async create(
    @CurrentUser() user: any,
    @Body() body: { plan: 'PRO' | 'ENTERPRISE' },
  ) {
    const result = await this.createSession.execute({
      orgId: user.orgId,
      plan: body.plan,
      successUrl: `${process.env['CORS_ORIGIN']}/billing/success`,
      cancelUrl: `${process.env['CORS_ORIGIN']}/billing/cancel`,
    });

    if (result.isFailure) {
      throw result.error;
    }

    return { url: result.getValue() };
  }
}
