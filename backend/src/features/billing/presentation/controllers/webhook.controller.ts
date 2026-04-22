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
    this.logger.log('Webhook received');

    if (!sig) {
      this.logger.warn('Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Missing raw body');
      }

      const event = await this.stripeService.constructEvent(rawBody, sig);
      this.logger.log(`Processing event: ${event.type}`);

      const result = await this.handleWebhook.execute(event);
      if (result.isFailure) {
        this.logger.error(`Handler failed: ${result.error}`);
      }

      return { received: true };
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Webhook error: ${errorMessage}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new BadRequestException(`Webhook Error: ${errorMessage}`);
    }
  }
}
