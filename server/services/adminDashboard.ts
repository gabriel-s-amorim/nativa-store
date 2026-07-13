import { ABANDONED_CART_HOURS } from "@shared/const/analytics";
import { VISIBLE_ORDER_FILTER } from "@shared/const/order";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@shared/lib/orderLabels";
import type {
  DashboardOverview,
  DashboardPaymentSlice,
  DashboardPeriod,
  DashboardRecentOrder,
  DashboardStats,
  DashboardStatusSlice,
  DashboardTimePoint,
  DashboardTopProduct,
} from "@shared/types/dashboard";
import type { OrderStatus, PaymentMethod } from "@shared/types/order";
import { supabase } from "../lib/supabase";

const MS_DAY = 24 * 60 * 60 * 1000;

function periodToDays(period: DashboardPeriod): number | null {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  if (period === "90d") return 90;
  return null;
}

function startDateForPeriod(period: DashboardPeriod): Date | null {
  const days = periodToDays(period);
  if (days === null) return null;
  return new Date(Date.now() - days * MS_DAY);
}

function previousStartDateForPeriod(period: DashboardPeriod): Date | null {
  const days = periodToDays(period);
  if (days === null) return null;
  return new Date(Date.now() - days * 2 * MS_DAY);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function buildDateRange(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function inRange(iso: string, start: Date | null, end?: Date | null): boolean {
  const time = new Date(iso).getTime();
  if (start && time < start.getTime()) return false;
  if (end && time >= end.getTime()) return false;
  return true;
}

async function fetchOrdersRows() {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_id, status, total_amount, payment_method, created_at")
    .or(VISIBLE_ORDER_FILTER)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function fetchCustomerProfiles() {
  const { data, error } = await supabase
    .from("customer_profiles")
    .select("id, full_name, created_at");

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function fetchPageViews() {
  const { data, error } = await supabase
    .from("store_page_views")
    .select("session_id, path, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("store_page_views")) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

async function fetchAbandonedCarts() {
  const staleBefore = new Date(
    Date.now() - ABANDONED_CART_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data: carts, error } = await supabase
    .from("carts")
    .select("id, updated_at")
    .eq("status", "active")
    .lt("updated_at", staleBefore);

  if (error) throw new Error(error.message);
  if (!carts?.length) return { count: 0, value: 0 };

  const cartIds = carts.map(c => c.id);
  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select("cart_id, quantity, unit_price")
    .in("cart_id", cartIds);

  if (itemsError) throw new Error(itemsError.message);

  const valueByCart = new Map<string, number>();
  for (const item of items ?? []) {
    const current = valueByCart.get(item.cart_id) ?? 0;
    valueByCart.set(
      item.cart_id,
      current + Number(item.quantity) * Number(item.unit_price)
    );
  }

  let count = 0;
  let value = 0;
  for (const cart of carts) {
    const cartValue = valueByCart.get(cart.id) ?? 0;
    if (cartValue <= 0) continue;
    count += 1;
    value += cartValue;
  }

  return { count, value };
}

async function fetchCartConversion() {
  const { data, error } = await supabase.from("carts").select("status");
  if (error) throw new Error(error.message);

  const converted = (data ?? []).filter(c => c.status === "converted").length;
  const { count: abandoned } = await fetchAbandonedCarts();
  const denominator = converted + abandoned;
  const rate =
    denominator === 0 ? 0 : Math.round((converted / denominator) * 1000) / 10;
  return rate;
}

async function fetchTopProducts(
  start: Date | null
): Promise<DashboardTopProduct[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, created_at")
    .eq("status", "paid");

  if (error) throw new Error(error.message);

  const orderIds = (orders ?? [])
    .filter(o => inRange(o.created_at, start))
    .map(o => o.id);

  if (!orderIds.length) return [];

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_slug, name, quantity, price")
    .in("order_id", orderIds);

  if (itemsError) throw new Error(itemsError.message);

  const map = new Map<string, DashboardTopProduct>();
  for (const item of items ?? []) {
    const key = item.product_slug;
    const current = map.get(key) ?? {
      slug: item.product_slug,
      name: item.name,
      units: 0,
      revenue: 0,
    };
    current.units += Number(item.quantity);
    current.revenue += Number(item.quantity) * Number(item.price);
    map.set(key, current);
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

async function fetchProductStockCounts() {
  const { data, error } = await supabase
    .from("products")
    .select("in_stock, stock_count");
  if (error) throw new Error(error.message);

  let inStock = 0;
  let outOfStock = 0;
  for (const row of data ?? []) {
    if (row.in_stock && Number(row.stock_count) > 0) inStock += 1;
    else outOfStock += 1;
  }

  return { inStock, outOfStock };
}

function computeOverview(
  period: DashboardPeriod,
  orders: Awaited<ReturnType<typeof fetchOrdersRows>>,
  customers: Awaited<ReturnType<typeof fetchCustomerProfiles>>,
  pageViews: Awaited<ReturnType<typeof fetchPageViews>>,
  abandoned: { count: number; value: number },
  cartConversionRate: number,
  stock: { inStock: number; outOfStock: number }
): DashboardOverview {
  const start = startDateForPeriod(period);
  const prevStart = previousStartDateForPeriod(period);
  const prevEnd = start;

  const paidInPeriod = orders.filter(
    o => o.status === "paid" && inRange(o.created_at, start)
  );
  const paidPrevPeriod = orders.filter(
    o => o.status === "paid" && inRange(o.created_at, prevStart, prevEnd)
  );

  const revenue = paidInPeriod.reduce((s, o) => s + Number(o.total_amount), 0);
  const revenuePrev = paidPrevPeriod.reduce(
    (s, o) => s + Number(o.total_amount),
    0
  );

  const ordersCount = paidInPeriod.length;
  const ordersPrev = paidPrevPeriod.length;

  const viewsInPeriod = pageViews.filter(v => inRange(v.created_at, start));
  const viewsPrevPeriod = pageViews.filter(v =>
    inRange(v.created_at, prevStart, prevEnd)
  );

  const uniqueSessions = new Set(viewsInPeriod.map(v => v.session_id)).size;
  const uniqueSessionsPrev = new Set(viewsPrevPeriod.map(v => v.session_id))
    .size;

  const newCustomers = customers.filter(c =>
    inRange(c.created_at, start)
  ).length;
  const newCustomersPrev = customers.filter(c =>
    inRange(c.created_at, prevStart, prevEnd)
  ).length;

  return {
    revenue,
    revenueChange: prevStart ? pctChange(revenue, revenuePrev) : null,
    orders: ordersCount,
    ordersChange: prevStart ? pctChange(ordersCount, ordersPrev) : null,
    averageOrderValue: ordersCount === 0 ? 0 : revenue / ordersCount,
    visits: uniqueSessions,
    visitsChange: prevStart
      ? pctChange(uniqueSessions, uniqueSessionsPrev)
      : null,
    pageViews: viewsInPeriod.length,
    newCustomers,
    newCustomersChange: prevStart
      ? pctChange(newCustomers, newCustomersPrev)
      : null,
    abandonedCarts: abandoned.count,
    abandonedCartsValue: abandoned.value,
    cartConversionRate,
    productsInStock: stock.inStock,
    productsOutOfStock: stock.outOfStock,
  };
}

function buildTimeSeries(
  period: DashboardPeriod,
  orders: Awaited<ReturnType<typeof fetchOrdersRows>>,
  pageViews: Awaited<ReturnType<typeof fetchPageViews>>
): DashboardTimePoint[] {
  const days = periodToDays(period) ?? 30;
  const end = new Date();
  const start =
    startDateForPeriod(period) ?? new Date(Date.now() - days * MS_DAY);
  const keys = buildDateRange(start, end);

  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();
  const visitsByDay = new Map<string, Set<string>>();
  const pageViewsByDay = new Map<string, number>();

  for (const key of keys) {
    revenueByDay.set(key, 0);
    ordersByDay.set(key, 0);
    visitsByDay.set(key, new Set());
    pageViewsByDay.set(key, 0);
  }

  for (const order of orders) {
    if (order.status !== "paid") continue;
    const key = toDateKey(order.created_at);
    if (!revenueByDay.has(key)) continue;
    revenueByDay.set(
      key,
      (revenueByDay.get(key) ?? 0) + Number(order.total_amount)
    );
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
  }

  for (const view of pageViews) {
    const key = toDateKey(view.created_at);
    if (!visitsByDay.has(key)) continue;
    visitsByDay.get(key)!.add(view.session_id);
    pageViewsByDay.set(key, (pageViewsByDay.get(key) ?? 0) + 1);
  }

  return keys.map(date => ({
    date,
    revenue: revenueByDay.get(date) ?? 0,
    orders: ordersByDay.get(date) ?? 0,
    visits: visitsByDay.get(date)?.size ?? 0,
    pageViews: pageViewsByDay.get(date) ?? 0,
  }));
}

function buildStatusSlices(
  period: DashboardPeriod,
  orders: Awaited<ReturnType<typeof fetchOrdersRows>>
): DashboardStatusSlice[] {
  const start = startDateForPeriod(period);
  const filtered = orders.filter(o => inRange(o.created_at, start));
  const counts = new Map<OrderStatus, number>();

  for (const order of filtered) {
    const status = order.status as OrderStatus;
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return (["paid", "pending", "canceled"] as OrderStatus[]).map(status => ({
    status,
    label: ORDER_STATUS_LABELS[status],
    count: counts.get(status) ?? 0,
  }));
}

function buildPaymentSlices(
  period: DashboardPeriod,
  orders: Awaited<ReturnType<typeof fetchOrdersRows>>
): DashboardPaymentSlice[] {
  const start = startDateForPeriod(period);
  const filtered = orders.filter(
    o => o.status === "paid" && inRange(o.created_at, start)
  );
  const map = new Map<PaymentMethod, { count: number; revenue: number }>();

  for (const order of filtered) {
    const method = order.payment_method as PaymentMethod;
    const current = map.get(method) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += Number(order.total_amount);
    map.set(method, current);
  }

  return (["pix", "credit_card", "boleto"] as PaymentMethod[]).map(method => ({
    method,
    label: PAYMENT_METHOD_LABELS[method],
    count: map.get(method)?.count ?? 0,
    revenue: map.get(method)?.revenue ?? 0,
  }));
}

async function buildRecentOrders(
  orders: Awaited<ReturnType<typeof fetchOrdersRows>>,
  customers: Awaited<ReturnType<typeof fetchCustomerProfiles>>
): Promise<DashboardRecentOrder[]> {
  const nameMap = new Map(
    customers.map(c => [c.id, String(c.full_name ?? "")])
  );

  return orders.slice(0, 6).map(order => ({
    id: order.id,
    customerName: order.customer_id
      ? nameMap.get(order.customer_id) || null
      : null,
    totalAmount: Number(order.total_amount),
    status: order.status,
    createdAt: order.created_at,
  }));
}

export async function getDashboardStats(
  period: DashboardPeriod
): Promise<DashboardStats> {
  const [
    orders,
    customers,
    pageViews,
    abandoned,
    cartConversionRate,
    stock,
    topProducts,
  ] = await Promise.all([
    fetchOrdersRows(),
    fetchCustomerProfiles(),
    fetchPageViews(),
    fetchAbandonedCarts(),
    fetchCartConversion(),
    fetchProductStockCounts(),
    fetchTopProducts(startDateForPeriod(period)),
  ]);

  return {
    period,
    overview: computeOverview(
      period,
      orders,
      customers,
      pageViews,
      abandoned,
      cartConversionRate,
      stock
    ),
    timeSeries: buildTimeSeries(period, orders, pageViews),
    ordersByStatus: buildStatusSlices(period, orders),
    paymentMethods: buildPaymentSlices(period, orders),
    topProducts,
    recentOrders: await buildRecentOrders(orders, customers),
  };
}
