/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../../infrastructure/services/stripe.service';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook.use-case';
import { Public } from '../../../../core/presentation/decorators/public.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly handleWebhook: HandleWebhookUseCase,
  ) {}

  @Public()
  @Post(['billing/webhook', 'v1/billing/webhook'])
  async handle(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log('Webhook received - Processing Stripe event');

    // Validate signature header
    if (!sig) {
      this.logger.warn('Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Validate raw body exists
    const rawBody = req.body instanceof Buffer ? req.body : req.rawBody;

    if (!rawBody) {
      this.logger.error(
        'Missing raw body - body parser may not be configured correctly',
      );
      throw new BadRequestException(
        'Missing raw body. Ensure raw body parsing is enabled.',
      );
    }

    try {
      // Construct and verify the Stripe event
      const event = await this.stripeService.constructEvent(rawBody, sig);
      this.logger.log(
        `Event constructed successfully: type=${event.type}, id=${event.id}`,
      );

      // Process the event through the use case
      const result = await this.handleWebhook.execute(event);

      if (result.isFailure) {
        this.logger.error(`Webhook processing failed: ${result.error}`);
        // Still return 200 to Stripe to prevent retries for non-recoverable errors
        return { received: true, error: result.error };
      }

      this.logger.log(`Webhook processed successfully: type=${event.type}`);

      return { received: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;

      this.logger.error(`Webhook error: ${errorMessage}`, errorStack);

      // Return BadRequest to trigger Stripe retry
      throw new BadRequestException(`Webhook Error: ${errorMessage}`);
    }
  }
}
