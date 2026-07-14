import AdminLayout from "@/components/admin/AdminLayout";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import { AdminDesktopTable, AdminMobileList } from "@/components/admin/AdminMobileCard";
import AdminStatGrid from "@/components/admin/AdminStatGrid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteAdminOrders,
  exportAdminOrdersCsv,
  exportAdminOrdersPdf,
  fetchAdminOrders,
} from "@/lib/adminApi";
import { formatPrice } from "@/lib/products";
import {
  formatOrderShortId,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
} from "@shared/lib/orderLabels";
import type { AdminOrderSummary, OrderStatus } from "@shared/types/order";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Package,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type PeriodFilter = "all" | "7d" | "30d";
type BulkAction = "csv" | "pdf" | "delete" | null;

export default function AdminOrdersList() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<BulkAction>(null);
  const [isActing, setIsActing] = useState(false);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch {
      toast.error("Não foi possível carregar os pedidos");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const now = Date.now();
    const periodMs =
      period === "7d" ? 7 * 24 * 60 * 60 * 1000 : period === "30d" ? 30 * 24 * 60 * 60 * 1000 : 0;

    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesPeriod =
        period === "all" || now - new Date(order.createdAt).getTime() <= periodMs;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        formatOrderShortId(order.id).toLowerCase().includes(query) ||
        (order.customerName?.toLowerCase().includes(query) ?? false) ||
        (order.customerEmail?.toLowerCase().includes(query) ?? false);

      return matchesStatus && matchesPeriod && matchesSearch;
    });
  }, [orders, search, status, period]);

  const filteredIds = useMemo(
    () => filteredOrders.map((order) => order.id),
    [filteredOrders]
  );

  const selectedVisibleCount = useMemo(
    () => filteredIds.filter((id) => selectedIds.has(id)).length,
    [filteredIds, selectedIds]
  );

  const allVisibleSelected =
    filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && selectedVisibleCount < filteredIds.length;

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === "paid");
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      total: orders.length,
      paid: paidOrders.length,
      pending: pendingOrders.length,
      revenue,
    };
  }, [orders]);

  function toggleOrder(orderId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of filteredIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function runBulkAction(action: Exclude<BulkAction, null>) {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    setIsActing(true);
    try {
      if (action === "csv") {
        await exportAdminOrdersCsv(ids);
        toast.success(`CSV exportado (${ids.length} pedido${ids.length > 1 ? "s" : ""})`);
      } else if (action === "pdf") {
        await exportAdminOrdersPdf(ids);
        toast.success(`PDF gerado (${ids.length} pedido${ids.length > 1 ? "s" : ""})`);
      } else {
        const result = await deleteAdminOrders(ids);
        setOrders((prev) => prev.filter((order) => !selectedIds.has(order.id)));
        clearSelection();
        toast.success(
          result.deleted === 1
            ? "1 pedido excluído"
            : `${result.deleted} pedidos excluídos`
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível concluir a operação"
      );
    } finally {
      setIsActing(false);
      setPendingAction(null);
    }
  }

  function requestAction(action: Exclude<BulkAction, null>) {
    if (!selectedIds.size) {
      toast.error("Selecione ao menos um pedido");
      return;
    }
    if (action === "delete") {
      setPendingAction("delete");
      return;
    }
    void runBulkAction(action);
  }

  return (
    <AdminLayout title="Pedidos">
      <AdminStatGrid
        items={[
          { label: "Total", value: String(stats.total), icon: ShoppingCart },
          { label: "Confirmados", value: String(stats.paid), icon: CheckCircle2, accent: "green" },
          { label: "Pendentes", value: String(stats.pending), icon: Clock },
          { label: "Faturamento", value: formatPrice(stats.revenue), icon: Wallet },
        ]}
      />

      <Card className="admin-card mt-4 border-0 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <Input
              placeholder="Buscar pedido, cliente ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 w-full rounded-xl lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {ORDER_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
              <SelectTrigger className="h-11 w-full rounded-xl lg:w-44">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {selectedIds.size > 0 && (
        <div className="sticky top-2 z-20 mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--admin-accent)]/25 bg-[var(--admin-surface)] p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[var(--admin-accent-soft)] px-2.5 py-1 text-sm font-semibold text-[var(--admin-accent)]">
              {selectedIds.size} selecionado{selectedIds.size > 1 ? "s" : ""}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-[var(--admin-text-muted)]"
              onClick={clearSelection}
              disabled={isActing}
            >
              <X className="size-3.5" />
              Limpar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl"
              onClick={() => requestAction("csv")}
              disabled={isActing}
            >
              <Download className="size-3.5" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl border-[var(--admin-accent)]/40 text-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)]"
              onClick={() => requestAction("pdf")}
              disabled={isActing}
            >
              {isActing ? (
                <Spinner className="size-3.5" />
              ) : (
                <FileText className="size-3.5" />
              )}
              PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => requestAction("delete")}
              disabled={isActing}
            >
              <Trash2 className="size-3.5" />
              Excluir
            </Button>
          </div>
        </div>
      )}

      <Card className="admin-card mt-4 overflow-hidden border-0">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-[var(--admin-text-muted)]">
            <Spinner className="size-5" />
            Carregando pedidos...
          </div>
        ) : filteredOrders.length === 0 ? (
          <AdminEmptyState
            icon={<Package className="size-8" />}
            title="Nenhum pedido encontrado"
            description="Ajuste os filtros ou aguarde novas compras na loja."
          />
        ) : (
          <>
            <AdminMobileList>
              {filteredOrders.map((order) => {
                const checked = selectedIds.has(order.id);
                return (
                  <div
                    key={order.id}
                    className="flex items-stretch gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 shadow-sm"
                  >
                    <div className="flex items-center pl-1">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleOrder(order.id, value === true)
                        }
                        aria-label={`Selecionar pedido ${formatOrderShortId(order.id)}`}
                      />
                    </div>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="group flex min-w-0 flex-1 items-center gap-3 py-1"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--admin-accent)]">
                              #{formatOrderShortId(order.id)}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-medium text-[var(--admin-text)]">
                              {order.customerName || "Cliente removido"}
                            </p>
                            <p className="truncate text-xs text-[var(--admin-text-muted)]">
                              {new Date(order.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                              {PAYMENT_METHOD_LABELS[order.paymentMethod]} · {order.itemCount}{" "}
                              {order.itemCount === 1 ? "item" : "itens"}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <p className="text-base font-bold text-[var(--admin-text)]">
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
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-[var(--admin-text-muted)]" />
                    </Link>
                  </div>
                );
              })}
            </AdminMobileList>

            <AdminDesktopTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          allVisibleSelected
                            ? true
                            : someVisibleSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(value) => toggleAllVisible(value === true)}
                        aria-label="Selecionar todos os pedidos visíveis"
                      />
                    </TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const checked = selectedIds.has(order.id);
                    return (
                      <TableRow
                        key={order.id}
                        data-state={checked ? "selected" : undefined}
                        className="hover:bg-[var(--admin-surface-hover)] data-[state=selected]:bg-[var(--admin-accent-soft)]/40"
                      >
                        <TableCell>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              toggleOrder(order.id, value === true)
                            }
                            aria-label={`Selecionar pedido ${formatOrderShortId(order.id)}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="font-semibold text-[var(--admin-accent)] hover:underline"
                          >
                            #{formatOrderShortId(order.id)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-[var(--admin-text)]">
                            {order.customerName || "Cliente removido"}
                          </div>
                          <div className="text-xs text-[var(--admin-text-muted)]">
                            {order.customerEmail || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--admin-text-muted)]">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{order.itemCount}</TableCell>
                        <TableCell className="font-medium text-[var(--admin-text)]">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-[var(--admin-text-muted)]">
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
                    );
                  })}
                </TableBody>
              </Table>
            </AdminDesktopTable>
          </>
        )}
      </Card>

      <AlertDialog
        open={pendingAction === "delete"}
        onOpenChange={(open) => {
          if (!open && !isActing) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {selectedIds.size} pedido{selectedIds.size > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove definitivamente os pedidos selecionados, itens e
              registros de frete/pagamento vinculados. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isActing}
              className="bg-red-600 hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                void runBulkAction("delete");
              }}
            >
              {isActing ? <Spinner className="size-4" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
