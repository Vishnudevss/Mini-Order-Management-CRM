export class CreateOrderItemDto {
  variantId: string;
  quantity: number;
}

export class CreateOrderDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  paid?: boolean;
  items: CreateOrderItemDto[];
}