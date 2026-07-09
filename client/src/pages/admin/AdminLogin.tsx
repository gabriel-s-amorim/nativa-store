import NativaLogo from "@/components/NativaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminApiError } from "@/lib/adminApi";
import "@/styles/admin-theme.css";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(password);
      setLocation("/admin/dashboard");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Não foi possível entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-app admin-login-bg flex min-h-[100dvh] items-center justify-center px-4">
      <div className="admin-card w-full max-w-sm p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <NativaLogo className="h-11 w-auto" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--admin-text)]">
              Painel Administrativo
            </h1>
            <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
              Acesso restrito ao dono da loja
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-password" className="text-[var(--admin-text-secondary)]">
              Senha
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
              <Input
                id="admin-password"
                type="password"
                autoFocus
                className="admin-input h-11 pl-9"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={submitting || !password}
            className="mt-1 h-11 rounded-xl bg-[var(--admin-text)] text-white hover:bg-slate-800"
          >
            {submitting ? <Spinner className="size-4" /> : "Entrar no painel"}
          </Button>
        </form>
      </div>
    </div>
  );
}
