import {
  Controller,
  Headers,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { ShopifyService } from '../shopify/shopify.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private orders: OrdersService,
    private shopify: ShopifyService,
  ) {}

  // Call this once to tell Shopify where to send webhooks
  @Post('register')
  register() {
    const base = this.config.get<string>('PUBLIC_URL');
    return this.shopify.registerWebhooks(`${base}/webhooks/shopify`);
  }

  @Post('shopify')
  @HttpCode(200)
  async handle(
    @Req() req: any,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-webhook-id') webhookId: string,
    @Headers('x-shopify-topic') topic: string,
  ) {
    // 1. Verify the request really came from Shopify
    const secret = this.config.get<string>('SHOPIFY_CLIENT_SECRET') as string;
    const digest = createHmac('sha256', secret).update(req.rawBody).digest('base64');
    const a = Buffer.from(digest);
    const b = Buffer.from(hmac || '');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // 2. Skip duplicate deliveries (the webhook id is unique in the table)
    try {
      await this.prisma.webhookEvent.create({ data: { webhookId, topic } });
    } catch (err: any) {
      if (err.code === 'P2002') {
        this.logger.warn(`Duplicate webhook ${webhookId} ignored`);
        return { duplicate: true };
      }
      this.logger.error('Database error saving webhook event: ' + err.message);
      throw new InternalServerErrorException();
    }

    // 3. Process the order
    try {
      if (topic === 'orders/create' || topic === 'orders/updated') {
        await this.orders.upsertFromShopify(req.body);
      }
      return { ok: true };
    } catch (err: any) {
      // remove the record so Shopify's retry can be processed again
      await this.prisma.webhookEvent.delete({ where: { webhookId } }).catch(() => null);
      this.logger.error(`Webhook ${webhookId} failed: ${err.message}`);
      throw new InternalServerErrorException(); // 500 makes Shopify retry later
    }
  }

}