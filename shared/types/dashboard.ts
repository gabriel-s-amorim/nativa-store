export type DashboardPeriod = "7d" | "30d" | "90d" | "all";

export interface DashboardOverview {
  revenue: number;
  revenueChange: number | null;
  orders: number;
  ordersChange: number | null;
  averageOrderValue: number;
  visits: number;
  visitsChange: number | null;
  pageViews: number;
  newCustomers: number;
  newCustomersChange: number | null;
  abandonedCarts: number;
  abandonedCartsValue: number;
  cartConversionRate: number;
  productsInStock: number;
  productsOutOfStock: number;
}

export interface DashboardTimePoint {
  date: string;
  revenue: number;
  orders: number;
  visits: number;
  pageViews: number;
}

export interface DashboardStatusSlice {
  status: string;
  label: string;
  count: number;
}

export interface DashboardPaymentSlice {
  method: string;
  label: string;
  count: number;
  revenue: number;
}

export interface DashboardTopProduct {
  slug: string;
  name: string;
  units: number;
  revenue: number;
}

export interface DashboardRecentOrder {
  id: string;
  customerName: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  period: DashboardPeriod;
  overview: DashboardOverview;
  timeSeries: DashboardTimePoint[];
  ordersByStatus: DashboardStatusSlice[];
  paymentMethods: DashboardPaymentSlice[];
  topProducts: DashboardTopProduct[];
  recentOrders: DashboardRecentOrder[];
}

export const DASHBOARD_PERIOD_LABELS: Record<DashboardPeriod, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  all: "Tudo",
};
