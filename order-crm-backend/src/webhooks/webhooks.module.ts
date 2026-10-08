import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { OrdersModule } from '../orders/orders.module';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [OrdersModule, ShopifyModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}