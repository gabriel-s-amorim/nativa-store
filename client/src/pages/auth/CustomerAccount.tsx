import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import type { CustomerProfile } from "@shared/types/customer";
import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? "Erro na requisição");
  }

  return body as T;
}

export default function CustomerAccount() {
  const { isLoading, session, user, signOut } = useCustomerAuth();
  const [, setLocation] = useLocation();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/entrar");
    }
  }, [isLoading, user, setLocation]);

  useEffect(() => {
    async function load() {
      if (!session?.access_token) return;
      setLoadingProfile(true);
      try {
        const data = await apiRequest<CustomerProfile>("/api/customers/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        setProfile(data);
        setFullName(data.fullName ?? "");
        setPhone(data.phone ?? "");
      } catch (error) {
        toast("Erro ao carregar perfil", {
          description: error instanceof Error ? error.message : "Tente novamente",
        });
      } finally {
        setLoadingProfile(false);
      }
    }

    load();
  }, [session?.access_token]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;

    setSaving(true);
    try {
      const updated = await apiRequest<CustomerProfile>("/api/customers/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
      });
      setProfile(updated);
      toast("Dados atualizados", { description: "Seu perfil foi salvo com sucesso." });
    } catch (error) {
      toast("Erro ao salvar", { description: error instanceof Error ? error.message : "Tente novamente" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setLocation("/");
    }
  }

  const busy = isLoading || loadingProfile;

  return (
    <div className="min-h-screen" style={{ background: "#F5F0E8" }}>
      <Navbar />
      <main className="container px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <Card className="border-[#E8D5C4] shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#3D2B1F]">
                  <UserCircle className="size-6 text-[#C4522A]" />
                  <h1
                    className="text-xl font-bold"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Minha conta
                  </h1>
                </div>
                <Button variant="outline" onClick={handleLogout} disabled={busy}>
                  Sair
                </Button>
              </div>
              <p className="mt-1 text-sm text-[#8B6F5E]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {user?.email ?? ""}
              </p>
            </CardHeader>
            <CardContent>
              {busy ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner className="size-6 text-[#C4522A]" />
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="customer-profile-name">Nome completo</Label>
                    <Input
                      id="customer-profile-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      disabled={saving}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="customer-profile-phone">Telefone</Label>
                    <Input
                      id="customer-profile-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      className="nativa-btn-primary rounded-lg"
                      disabled={saving || !fullName.trim()}
                    >
                      {saving ? <Spinner className="size-4" /> : "Salvar"}
                    </Button>

                    {!!profile && (
                      <p className="text-xs text-[#8B6F5E]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        Atualizado em {new Date(profile.updatedAt).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

