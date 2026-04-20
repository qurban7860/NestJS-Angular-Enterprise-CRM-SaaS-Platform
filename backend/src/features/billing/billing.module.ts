import { Module } from '@nestjs/common';
import { StripeService } from './infrastructure/services/stripe.service';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { CheckoutController } from './presentation/controllers/checkout.controller';
import { WebhookController } from './presentation/controllers/webhook.controller';

@Module({
  controllers: [CheckoutController, WebhookController],
  providers: [
    StripeService,
    CreateCheckoutSessionUseCase,
    HandleWebhookUseCase,
  ],
  exports: [StripeService],
})
export class BillingModule {}
