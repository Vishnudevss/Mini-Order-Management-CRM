import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ProductsController } from './products.controller';
import { OrdersService } from './orders.service';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [ShopifyModule],
  controllers: [OrdersController, ProductsController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}