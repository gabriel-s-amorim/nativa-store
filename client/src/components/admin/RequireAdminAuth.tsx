import { Spinner } from "@/components/ui/spinner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

export default function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--admin-surface-hover)]">
        <Spinner className="size-8 text-[var(--admin-accent)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
