import { calculateShippingAmount, CART_STATUS_ACTIVE } from "@shared/const/cart";
import type { CartItemRow, CartRow } from "@shared/lib/cartMapper";
import {
  mapCartItemToOrderItemPayload,
  mapOrderItemRowToOrderItem,
  mapOrderRowToOrder,
  type OrderRow,
} from "@shared/lib/orderMapper";
import type { CheckoutInput } from "@shared/schemas/order";
import type { Order } from "@shared/types/order";
import { supabase } from "../lib/supabase";

async function fetchCustomerCartRow(customerId: string): Promise<CartRow | null> {
  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("customer_id", customerId)
    .eq("status", CART_STATUS_ACTIVE)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as CartRow | null;
}

async function fetchCartItems(cartId: string): Promise<CartItemRow[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CartItemRow[];
}

async function fetchOrderWithItems(orderId: string): Promise<Order> {
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("id", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  const items = (itemRows ?? []).map(mapOrderItemRowToOrderItem);
  return mapOrderRowToOrder(orderRow as OrderRow, items);
}

export async function createOrderFromCheckout(
  customerId: string,
  input: CheckoutInput,
): Promise<Order> {
  const cartRow = await fetchCustomerCartRow(customerId);

  if (!cartRow) {
    throw new Error("Carrinho vazio");
  }

  const cartItems = await fetchCartItems(cartRow.id);

  if (cartItems.length === 0) {
    throw new Error("Carrinho vazio");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0,
  );
  const shippingAmount = calculateShippingAmount(subtotal);
  const totalAmount = subtotal + shippingAmount;

  const itemsPayload = cartItems.map(mapCartItemToOrderItemPayload);

  const { data, error } = await supabase.rpc("checkout_create_order", {
    p_customer_id: customerId,
    p_cart_id: cartRow.id,
    p_status: "paid",
    p_total_amount: totalAmount,
    p_shipping_amount: shippingAmount,
    p_coupon_code: cartRow.coupon_code,
    p_shipping_address: input.shippingAddress,
    p_payment_method: input.paymentMethod,
    p_items: itemsPayload,
  });

  if (error) throw new Error(error.message);

  const orderRow = data as OrderRow;
  return fetchOrderWithItems(orderRow.id);
}
