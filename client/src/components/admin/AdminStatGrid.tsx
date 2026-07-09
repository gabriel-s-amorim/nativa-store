import type { ReactNode } from "react";

export interface AdminStatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "terracota" | "green";
}

export default function AdminStatGrid({ items }: { items: AdminStatItem[] }) {
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:pb-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const iconBg =
          item.accent === "green"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-600";

        return (
          <div
            key={item.label}
            className="admin-kpi min-w-[72%] shrink-0 snap-start p-4 sm:min-w-[48%] lg:min-w-0"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">
                  {item.value}
                </p>
              </div>
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
