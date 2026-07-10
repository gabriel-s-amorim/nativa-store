import AdminLayout from "@/components/admin/AdminLayout";
import AdminMobileCard, { AdminDesktopTable, AdminMobileList } from "@/components/admin/AdminMobileCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminCustomer } from "@/lib/adminApi";
import { formatPrice } from "@/lib/products";
import { formatAddressLine, formatCepDisplay } from "@shared/types/address";
import {
  formatOrderShortId,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
} from "@shared/lib/orderLabels";
import type { AdminCustomerDetail } from "@shared/types/customer";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

function customerInitials(name: string | null) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminCustomerDetail() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;

    let cancelled = false;
    setIsLoading(true);

    fetchAdminCustomer(customerId)
      .then((data) => {
        if (!cancelled) setCustomer(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Não foi possível carregar o cliente");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  if (isLoading) {
    return (
      <AdminLayout title="Cliente" backHref="/admin/clientes">
        <div className="flex justify-center py-16">
          <Spinner className="size-7 text-[var(--admin-accent)]" />
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout title="Cliente" backHref="/admin/clientes">
        <div className="admin-card p-8 text-center">
          <p className="font-medium text-[var(--admin-text)]">Cliente não encontrado</p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link href="/admin/clientes">
              <ArrowLeft className="size-4" />
              Voltar para clientes
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const displayName = customer.fullName || "Cliente";

  return (
    <AdminLayout
      title={displayName}
      backHref="/admin/clientes"
      actions={
        <Button variant="outline" asChild>
          <Link href="/admin/clientes">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      }
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Hero perfil */}
        <div className="admin-card overflow-hidden">
          <div className="relative p-4 sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-8 left-1/4 size-24 rounded-full bg-[var(--admin-accent)]/25 blur-2xl" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white ring-1 ring-white/20 backdrop-blur-sm sm:size-[4.5rem] sm:text-xl">
                {customerInitials(customer.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {displayName}
                </h2>
                <p className="mt-0.5 truncate text-sm text-white/70">
                  {customer.email || "Sem e-mail"}
                </p>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={
                      customer.emailVerified
                        ? "border-0 bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30"
                        : "border-0 bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30"
                    }
                  >
                    {customer.emailVerified ? "E-mail verificado" : "E-mail pendente"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="admin-kpi p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  Pedidos
                </p>
                <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--admin-text)]">
                  {customer.orderCount}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <ShoppingBag className="size-4" />
              </div>
            </div>
          </div>
          <div className="admin-kpi p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  Total gasto
                </p>
                <p className="mt-1.5 text-xl font-bold tracking-tight text-[var(--admin-accent)] sm:text-2xl">
                  {formatPrice(customer.totalSpent)}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Wallet className="size-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="admin-card overflow-hidden">
          <div className="border-b border-[var(--admin-border)] px-4 py-3 sm:px-5">
            <h3 className="text-sm font-bold text-[var(--admin-text)]">Contato</h3>
          </div>
          <div className="space-y-0.5 p-2 sm:p-3">
            {customer.email ? (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors active:bg-[var(--admin-surface-hover)]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                    E-mail
                  </p>
                  <p className="truncate font-medium text-[var(--admin-text)]">{customer.email}</p>
                </div>
              </a>
            ) : null}
            {customer.phone ? (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors active:bg-[var(--admin-surface-hover)]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Phone className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                    Telefone
                  </p>
                  <p className="font-medium text-[var(--admin-text)]">{customer.phone}</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Phone className="size-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                    Telefone
                  </p>
                  <p className="text-[var(--admin-text-muted)]">Não informado</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Calendar className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  Cadastro
                </p>
                <p className="font-medium text-[var(--admin-text)]">
                  {new Date(customer.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Endereços */}
        <div className="admin-card overflow-hidden">
          <div className="border-b border-[var(--admin-border)] px-4 py-3 sm:px-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--admin-text)]">
              <MapPin className="size-4 text-[var(--admin-accent)]" />
              Endereços salvos
            </h3>
          </div>
          {customer.addresses.length === 0 ? (
            <p className="p-4 text-sm text-[var(--admin-text-muted)] sm:p-5">
              Nenhum endereço cadastrado.
            </p>
          ) : (
            <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4">
              {customer.addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-hover)] p-4 text-sm"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[var(--admin-text)]">{address.label}</span>
                    {address.isDefault && (
                      <Badge
                        variant="outline"
                        className="border-0 bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"
                      >
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <p className="leading-relaxed text-[var(--admin-text-secondary)]">
                    {formatAddressLine(address)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                    CEP {formatCepDisplay(address.cep)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos */}
        <div className="admin-card overflow-hidden">
          <div className="border-b border-[var(--admin-border)] px-4 py-3 sm:px-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--admin-text)]">
              <ShoppingCart className="size-4 text-[var(--admin-accent)]" />
              Pedidos do cliente
            </h3>
          </div>
          {customer.orders.length === 0 ? (
            <p className="p-4 text-sm text-[var(--admin-text-muted)] sm:p-5">
              Este cliente ainda não fez pedidos.
            </p>
          ) : (
            <>
              <AdminMobileList>
                {customer.orders.map((order) => (
                  <AdminMobileCard key={order.id} href={`/admin/pedidos/${order.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[var(--admin-accent)]">
                          #{formatOrderShortId(order.id)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm font-bold text-[var(--admin-text)]">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`border-0 ring-1 ${ORDER_STATUS_STYLES[order.status]}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                    </div>
                  </AdminMobileCard>
                ))}
              </AdminMobileList>

              <AdminDesktopTable>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="font-semibold text-[var(--admin-accent)] hover:underline"
                          >
                            #{formatOrderShortId(order.id)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[var(--admin-text-secondary)]">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{order.itemCount}</TableCell>
                        <TableCell className="font-medium text-[var(--admin-text)]">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-[var(--admin-text-secondary)]">
                          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border-0 ring-1 ${ORDER_STATUS_STYLES[order.status]}`}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AdminDesktopTable>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
