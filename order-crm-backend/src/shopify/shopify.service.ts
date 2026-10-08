import { BadGatewayException, BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);
  private token: string | null = null;
  private expiresAt = 0;

  constructor(private config: ConfigService) {}

  private get domain() {
    return this.config.get<string>('SHOPIFY_STORE_DOMAIN');
  }
  private get version() {
    return this.config.get<string>('SHOPIFY_API_VERSION') || '2025-10';
  }

  private async getToken(): Promise<string> {
    // reuse the cached token until 5 minutes before it expires
    if (this.token && Date.now() < this.expiresAt - 5 * 60 * 1000) {
      return this.token;
    }
    try {
      const res = await axios.post(
        `https://${this.domain}/admin/oauth/access_token`,
        {
          client_id: this.config.get('SHOPIFY_CLIENT_ID'),
          client_secret: this.config.get('SHOPIFY_CLIENT_SECRET'),
          grant_type: 'client_credentials',
        },
      );
      this.token = res.data.access_token;
      this.expiresAt = Date.now() + (res.data.expires_in ?? 86399) * 1000;
      return this.token as string;
    } catch (err: any) {
      this.logger.error('Failed to get Shopify token: ' + err.message);
      throw new BadGatewayException('Could not authenticate with Shopify');
    }
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  private async request(url: string, attempt = 1): Promise<any> {
    try {
      const token = await this.getToken();
      return await axios.get(url, {
        headers: { 'X-Shopify-Access-Token': token },
      });
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 401 && attempt < 2) {
        this.token = null; // force a fresh token and try once more
        return this.request(url, attempt + 1);
      }
      if ((status === 429 || status >= 500) && attempt < 3) {
        const wait = Number(err.response?.headers?.['retry-after'] || 2) * 1000;
        this.logger.warn(`Shopify ${status}, retrying in ${wait}ms`);
        await this.sleep(wait);
        return this.request(url, attempt + 1);
      }
      if (err instanceof BadGatewayException) throw err;
      this.logger.error(`Shopify request failed (${status}): ${err.message}`);
      throw new BadGatewayException('Shopify API request failed');
    }
  }

  // Fetch every order, following Shopify's cursor pagination
  async fetchAllOrders(): Promise<any[]> {
    let url: string | null =
      `https://${this.domain}/admin/api/${this.version}/orders.json?status=any&limit=250`;
    const all: any[] = [];

    while (url) {
      const res = await this.request(url);
      all.push(...(res.data.orders || []));
      const link: string = res.headers['link'] || '';
      const next = link.match(/<([^>]+)>;\s*rel="next"/);
      url = next ? next[1] : null;
    }
    return all;
  }

    async registerWebhooks(callbackUrl: string) {
    const token = await this.getToken();
    const topics = ['ORDERS_CREATE', 'ORDERS_UPDATED'];
    const results: any[] = [];

    for (const topic of topics) {
      const query = `mutation($topic: WebhookSubscriptionTopic!, $url: URL!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: { callbackUrl: $url, format: JSON }) {
          webhookSubscription { id }
          userErrors { field message }
        }
      }`;
      try {
        const res = await axios.post(
          `https://${this.domain}/admin/api/${this.version}/graphql.json`,
          { query, variables: { topic, url: callbackUrl } },
          { headers: { 'X-Shopify-Access-Token': token } },
        );
        results.push({ topic, result: res.data });
      } catch (err: any) {
        this.logger.error(`Webhook registration failed for ${topic}: ${err.message}`);
        throw new BadGatewayException('Could not register webhooks with Shopify');
      }
    }
    return results;
  }

  // Products shown in the Create Order form
  async fetchProducts() {
    const res = await this.request(
      `https://${this.domain}/admin/api/${this.version}/products.json?status=active&limit=250&fields=id,title,variants`,
    );
    return (res.data.products || []).flatMap((p: any) =>
      (p.variants || []).map((v: any) => ({
        variantId: String(v.id),
        name: v.title && v.title !== 'Default Title' ? `${p.title} - ${v.title}` : p.title,
        price: v.price,
        sku: v.sku || null,
      })),
    );
  }

  // Create the order in Shopify, returns its id like gid://shopify/Order/123
  async createOrder(input: {
    email?: string;
    firstName?: string;
    lastName?: string;
    paid: boolean;
    items: { variantId: string; quantity: number }[];
  }): Promise<string> {
    const token = await this.getToken();

    const order: any = {
      lineItems: input.items.map((i) => ({
        variantId: `gid://shopify/ProductVariant/${i.variantId}`,
        quantity: i.quantity,
      })),
      financialStatus: input.paid ? 'PAID' : 'PENDING',
    };
    if (input.email) {
      order.email = input.email;
      order.customer = {
        toUpsert: { email: input.email, firstName: input.firstName, lastName: input.lastName },
      };
    }

    const query = `mutation orderCreate($order: OrderCreateOrderInput!) {
      orderCreate(order: $order) {
        order { id name }
        userErrors { field message }
      }
    }`;

    let body: any;
    try {
      const res = await axios.post(
        `https://${this.domain}/admin/api/${this.version}/graphql.json`,
        { query, variables: { order } },
        { headers: { 'X-Shopify-Access-Token': token } },
      );
      body = res.data;
    } catch (err: any) {
      this.logger.error('orderCreate request failed: ' + err.message);
      throw new BadGatewayException('Could not reach Shopify to create the order');
    }

    if (body.errors) {
      this.logger.error('orderCreate errors: ' + JSON.stringify(body.errors));
      throw new BadGatewayException('Shopify rejected the request: ' + JSON.stringify(body.errors));
    }
    const result = body.data.orderCreate;
    if (result.userErrors?.length) {
      throw new BadRequestException(result.userErrors.map((e: any) => e.message).join(', '));
    }
    return result.order.id;
  }

  // Read one order back from Shopify so we can save it
  async fetchOrder(gid: string) {
    const numericId = gid.split('/').pop();
    const res = await this.request(
      `https://${this.domain}/admin/api/${this.version}/orders/${numericId}.json`,
    );
    return res.data.order;
  }

}