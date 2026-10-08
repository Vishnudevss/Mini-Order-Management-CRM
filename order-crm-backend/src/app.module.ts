import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { WebhooksModule } from './webhooks/webhooks.module';


@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    OrdersModule,
    WebhooksModule],
})
export class AppModule {}
