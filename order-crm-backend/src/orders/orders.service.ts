import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyService } from '../shopify/shopify.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private shopify: ShopifyService,
  ) {}

  // Convert a Shopify order into our database shape
  private mapOrder(o: any) {
    const cust = o.customer;
    const addr = o.shipping_address || o.billing_address;
    const name =
      [cust?.first_name, cust?.last_name].filter(Boolean).join(' ') ||
      addr?.name ||
      null;

    return {
      shopifyOrderId: String(o.id),
      orderNumber: String(o.name),
      customerName: name,
      customerEmail: o.email || cust?.email || null,
      status: o.financial_status || 'unknown',
      fulfillmentStatus: o.fulfillment_status || null,
      totalAmount: o.total_price,
      currency: o.currency,
      orderDate: new Date(o.created_at),
      shopifyUpdatedAt: new Date(o.updated_at),
      items: (o.line_items || []).map((i: any) => ({
        shopifyLineItemId: String(i.id),
        title: i.title,
        sku: i.sku || null,
        quantity: i.quantity,
        price: i.price,
      })),
    };
  }

  // Create or update one order (used by sync AND webhooks)
  async upsertFromShopify(shopifyOrder: any) {
    const { items, ...orderData } = this.mapOrder(shopifyOrder);

    const existing = await this.prisma.order.findUnique({
      where: { shopifyOrderId: orderData.shopifyOrderId },
      select: { shopifyUpdatedAt: true },
    });
    if (existing && existing.shopifyUpdatedAt > orderData.shopifyUpdatedAt) {
      return { skipped: true };
    }

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.upsert({
        where: { shopifyOrderId: orderData.shopifyOrderId },
        create: orderData,
        update: orderData,
      });
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.orderItem.createMany({
        data: items.map((i: any) => ({ ...i, orderId: order.id })),
      });
    });
    return { skipped: false };
  }

  async syncAll() {
    const orders = await this.shopify.fetchAllOrders();
    let synced = 0;
    let failed = 0;
    for (const o of orders) {
      try {
        await this.upsertFromShopify(o);
        synced++;
      } catch (err: any) {
        failed++;
        this.logger.error(`Failed to save order ${o.id}: ${err.message}`);
      }
    }
    return { total: orders.length, synced, failed };
  }

  async findAll(q: {
    search?: string;
    status?: string;
    fulfillmentStatus?: string;
    from?: string;
    to?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(parseInt(q.page || '1'), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '10'), 1), 100);

    const where: any = {};
    if (q.search) {
      where.OR = [
        { orderNumber: { contains: q.search, mode: 'insensitive' } },
        { customerName: { contains: q.search, mode: 'insensitive' } },
        { customerEmail: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.status) where.status = q.status;
    if (q.fulfillmentStatus) {
      where.fulfillmentStatus =
        q.fulfillmentStatus === 'unfulfilled' ? null : q.fulfillmentStatus;
    }
    if (q.from || q.to) {
      where.orderDate = {};
      if (q.from) where.orderDate.gte = new Date(q.from);
      if (q.to) where.orderDate.lte = new Date(q.to + 'T23:59:59.999Z');
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { orderDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

    async createOrder(dto: CreateOrderDto) {
    const items = (dto.items || []).map((i) => ({
      variantId: String(i.variantId || ''),
      quantity: Number(i.quantity),
    }));
    if (items.length === 0) throw new BadRequestException('Add at least one item');
    for (const i of items) {
      if (!/^\d+$/.test(i.variantId) || !Number.isInteger(i.quantity) || i.quantity < 1) {
        throw new BadRequestException('Each item needs a product and a quantity of 1 or more');
      }
    }
    if (dto.email && !/^\S+@\S+\.\S+$/.test(dto.email)) {
      throw new BadRequestException('Invalid email');
    }

    // 1. create in Shopify, 2. read it back, 3. save in our database
    const gid = await this.shopify.createOrder({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      paid: !!dto.paid,
      items,
    });
    const shopifyOrder = await this.shopify.fetchOrder(gid);
    await this.upsertFromShopify(shopifyOrder);

    return this.prisma.order.findUnique({
      where: { shopifyOrderId: String(shopifyOrder.id) },
      include: { items: true },
    });
  }
}