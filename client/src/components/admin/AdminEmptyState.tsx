import type { ReactNode } from "react";

export default function AdminEmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-10 text-center text-[var(--admin-text-muted)] sm:p-12">
      <div className="opacity-50">{icon}</div>
      <p className="font-medium text-[var(--admin-text)]">{title}</p>
      <p className="max-w-xs text-sm">{description}</p>
    </div>
  );
}
