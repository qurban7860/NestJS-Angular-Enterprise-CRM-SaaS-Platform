/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../../infrastructure/services/stripe.service';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook.use-case';
import { Public } from '../../../../core/presentation/decorators/public.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('billing/webhook')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly handleWebhook: HandleWebhookUseCase,
  ) {}

  @Public()
  @Post()
  async handle(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!sig) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const event = await this.stripeService.constructEvent(req.rawBody!, sig);
      await this.handleWebhook.execute(event);
      return { received: true };
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
