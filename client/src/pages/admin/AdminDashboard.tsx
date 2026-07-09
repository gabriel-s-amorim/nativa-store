import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { fetchAdminDashboard } from "@/lib/adminApi";
import { formatPrice } from "@/lib/products";
import {
  DASHBOARD_PERIOD_LABELS,
  type DashboardPeriod,
  type DashboardStats,
} from "@shared/types/dashboard";
import { formatOrderShortId, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@shared/lib/orderLabels";
import {
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Minus,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Link } from "wouter";

const PERIODS: DashboardPeriod[] = ["7d", "30d", "90d", "all"];

const PIE_COLORS = ["#059669", "#C4522A", "#64748b", "#d97706"];

function formatShortDate(iso: string) {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="admin-trend-neutral inline-flex items-center gap-0.5 text-xs font-medium">
        <Minus className="size-3" />
        —
      </span>
    );
  }

  const isUp = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isUp ? "admin-trend-up bg-emerald-50" : "admin-trend-down bg-red-50"
      }`}
    >
      {isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(value)}%
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: number | null;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "default" | "warning" | "success";
}) {
  const iconBg =
    accent === "warning"
      ? "bg-amber-50 text-amber-600"
      : accent === "success"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="admin-kpi p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-[var(--admin-text)] sm:text-3xl">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">{sub}</p>}
          {trend !== undefined && (
            <div className="mt-2">
              <TrendBadge value={trend} />
            </div>
          )}
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-[var(--admin-text-muted)]">
        {label ? formatShortDate(String(label)) : ""}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.name === "Receita" ? formatPrice(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchAdminDashboard(period)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Não foi possível carregar o dashboard");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.timeSeries.map((point) => ({
      ...point,
      label: formatShortDate(point.date),
    }));
  }, [stats]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const todayLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (isLoading && !stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center py-24">
          <Spinner className="size-8 text-[var(--admin-text-secondary)]" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="admin-card p-10 text-center text-[var(--admin-text-secondary)]">
          Não foi possível carregar os dados.
        </div>
      </AdminLayout>
    );
  }

  const { overview } = stats;
  const paymentTotal = stats.paymentMethods.reduce((s, p) => s + p.count, 0);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-5 sm:space-y-6">
        <div className="admin-card overflow-hidden">
          <div className="relative p-5 sm:p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 left-1/3 size-32 rounded-full bg-[#C4522A]/20 blur-2xl" />
            </div>
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">{todayLabel}</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {greeting}, Nativa
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/75">
                  Visão geral da loja — receita, visitas, pedidos e carrinhos abandonados em tempo
                  real.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={
                      period === p
                        ? "admin-period-pill admin-period-pill-active bg-white text-slate-900"
                        : "admin-period-pill border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }
                  >
                    {DASHBOARD_PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Receita"
            value={formatPrice(overview.revenue)}
            trend={overview.revenueChange}
            icon={Wallet}
          />
          <KpiCard
            label="Visitas únicas"
            value={String(overview.visits)}
            sub={`${overview.pageViews} pageviews`}
            trend={overview.visitsChange}
            icon={Eye}
            accent="success"
          />
          <KpiCard
            label="Pedidos"
            value={String(overview.orders)}
            sub={`Ticket ${formatPrice(overview.averageOrderValue)}`}
            trend={overview.ordersChange}
            icon={ShoppingCart}
          />
          <KpiCard
            label="Novos clientes"
            value={String(overview.newCustomers)}
            trend={overview.newCustomersChange}
            icon={Users}
            accent="success"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="admin-card p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--admin-text)]">Receita e visitas</h3>
                <p className="text-xs text-[var(--admin-text-muted)]">Evolução no período selecionado</p>
              </div>
              <TrendingUp className="size-5 text-[var(--admin-text-muted)]" />
            </div>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C4522A" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#C4522A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Receita"
                    stroke="#C4522A"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="visits"
                    name="Visitas"
                    stroke="#059669"
                    strokeWidth={2}
                    fill="url(#visitsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card p-4 sm:p-5">
            <h3 className="text-base font-bold text-[var(--admin-text)]">Pagamentos</h3>
            <p className="mb-3 text-xs text-[var(--admin-text-muted)]">Mix no período</p>
            {paymentTotal === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--admin-text-muted)]">
                Sem pedidos no período
              </p>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.paymentMethods.filter((p) => p.count > 0)}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                      >
                        {stats.paymentMethods.map((entry, index) => (
                          <Cell key={entry.method} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-2">
                  {stats.paymentMethods.map((item, index) => (
                    <li key={item.method} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[var(--admin-text-secondary)]">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        {item.label}
                      </span>
                      <span className="font-semibold text-[var(--admin-text)]">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="admin-card border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <ShoppingBag className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[var(--admin-text)]">Carrinhos abandonados</h3>
                <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">
                  Sem atividade há mais de 24h
                </p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--admin-text)]">
                  {overview.abandonedCarts}
                </p>
                <p className="text-sm font-semibold text-amber-700">
                  {formatPrice(overview.abandonedCartsValue)} em potencial
                </p>
                <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
                  Taxa de conversão: {overview.cartConversionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="admin-card p-4 sm:p-5">
            <h3 className="font-bold text-[var(--admin-text)]">Pedidos por status</h3>
            <ul className="mt-4 space-y-3">
              {stats.ordersByStatus.map((item) => (
                <li key={item.status} className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${ORDER_STATUS_STYLES[item.status as keyof typeof ORDER_STATUS_STYLES]}`}
                  >
                    {ORDER_STATUS_LABELS[item.status as keyof typeof ORDER_STATUS_LABELS]}
                  </span>
                  <span className="text-lg font-bold text-[var(--admin-text)]">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-card p-4 sm:p-5 md:col-span-2 xl:col-span-1">
            <h3 className="font-bold text-[var(--admin-text)]">Estoque</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="admin-card-muted p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{overview.productsInStock}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Em estoque</p>
              </div>
              <div className="admin-card-muted p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{overview.productsOutOfStock}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">Sem estoque</p>
              </div>
            </div>
            <Link
              href="/admin/produtos"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] py-2.5 text-sm font-semibold text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-surface-hover)]"
            >
              <Package className="size-4" />
              Ver produtos
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="admin-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-[var(--admin-text)]">Top produtos</h3>
              <Link href="/admin/pedidos" className="text-xs font-semibold text-[var(--admin-accent)]">
                Ver pedidos
              </Link>
            </div>
            {stats.topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--admin-text-muted)]">
                Nenhuma venda no período
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <li
                    key={product.slug}
                    className="flex items-center gap-3 rounded-xl bg-[var(--admin-surface-hover)] p-3"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-[var(--admin-text-secondary)] shadow-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        {product.units} unidades vendidas
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[var(--admin-accent)]">
                      {formatPrice(product.revenue)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-[var(--admin-text)]">Pedidos recentes</h3>
              <Link href="/admin/pedidos" className="text-xs font-semibold text-[var(--admin-accent)]">
                Ver todos
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--admin-text-muted)]">
                Nenhum pedido ainda
              </p>
            ) : (
              <ul className="divide-y divide-[var(--admin-border)]">
                {stats.recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-[var(--admin-surface-hover)]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--admin-text)]">
                          #{formatOrderShortId(order.id)}
                        </p>
                        <p className="truncate text-xs text-[var(--admin-text-muted)]">
                          {order.customerName || "Cliente"} ·{" "}
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-[var(--admin-text)]">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-0.5 border-0 text-[10px] ring-1 ${ORDER_STATUS_STYLES[order.status as keyof typeof ORDER_STATUS_STYLES]}`}
                        >
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
