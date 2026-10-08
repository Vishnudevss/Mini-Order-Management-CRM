import { Controller, Get } from '@nestjs/common';
import { ShopifyService } from '../shopify/shopify.service';

@Controller('products')
export class ProductsController {
  constructor(private shopify: ShopifyService) {}

  @Get()
  list() {
    return this.shopify.fetchProducts();
  }
}