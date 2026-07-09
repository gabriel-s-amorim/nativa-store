export type OrderStatus = "pending" | "paid" | "canceled";

export type PaymentMethod = "pix" | "credit_card" | "boleto";

export interface ShippingAddress {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productSlug: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string | null;
  image: string;
}

export interface Order {
  id: string;
  customerId: string | null;
  status: OrderStatus;
  totalAmount: number;
  shippingAmount: number;
  couponCode: string | null;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  createdAt: string;
}

export interface CheckoutResponse {
  success: true;
  order: Order;
}
