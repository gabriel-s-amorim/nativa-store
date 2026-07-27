import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  AdminApiError,
  fetchAdminContentPages,
  fetchAdminStoreSettings,
  updateAdminStoreSettings,
} from "@/lib/adminApi";
import type { ContentPageSummary } from "@shared/types/contentPage";
import type { StoreSettings, StoreSettingsInput } from "@shared/types/storeSettings";
import { DEFAULT_STORE_SETTINGS } from "@shared/types/storeSettings";
import { FileText, Pencil, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type Tab = "pages" | "settings";

const PAGE_TYPE_LABEL: Record<string, string> = {
  howto: "Como comprar",
  sections: "Seções",
  faq: "FAQ",
};

export default function AdminContent() {
  const [tab, setTab] = useState<Tab>("pages");
  const [pages, setPages] = useState<ContentPageSummary[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const [pageList, storeSettings] = await Promise.all([
        fetchAdminContentPages(),
        fetchAdminStoreSettings(),
      ]);
      setPages(pageList);
      setSettings(storeSettings);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const input: StoreSettingsInput = {
        contactEmail: settings.contactEmail,
        whatsappNumber: settings.whatsappNumber.replace(/\D/g, ""),
        whatsappDisplay: settings.whatsappDisplay,
        addressLine: settings.addressLine,
        instagramUrl: settings.instagramUrl,
        facebookUrl: settings.facebookUrl,
        tiktokUrl: settings.tiktokUrl,
        twitterUrl: settings.twitterUrl,
      };
      const saved = await updateAdminStoreSettings(input);
      setSettings(saved);
      toast.success("Contato e redes salvos");
    } catch (error) {
      const message =
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erro ao salvar";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout title="Conteúdo">
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === "pages" ? "default" : "outline"}
          className="gap-2"
          onClick={() => setTab("pages")}
        >
          <FileText className="size-4" />
          Páginas
        </Button>
        <Button
          type="button"
          variant={tab === "settings" ? "default" : "outline"}
          className="gap-2"
          onClick={() => setTab("settings")}
        >
          <Settings2 className="size-4" />
          Contato e redes
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="size-8 text-slate-400" />
        </div>
      ) : tab === "pages" ? (
        <div className="grid gap-3">
          {pages.map((page) => (
            <Card
              key={page.slug}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">{page.title}</p>
                <p className="text-xs text-slate-500">
                  /{page.slug} · {PAGE_TYPE_LABEL[page.pageType] ?? page.pageType}
                  {page.isPublished ? "" : " · rascunho"}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={`/admin/conteudo/${page.slug}`}>
                  <Pencil className="size-3.5" />
                  Editar
                </Link>
              </Button>
            </Card>
          ))}
          {pages.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma página cadastrada.</p>
          ) : null}
        </div>
      ) : (
        <Card className="max-w-2xl p-5">
          <form className="space-y-4" onSubmit={saveSettings}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="contactEmail">E-mail de contato</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, contactEmail: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsappNumber">WhatsApp (só dígitos, com DDI)</Label>
                <Input
                  id="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, whatsappNumber: e.target.value }))
                  }
                  placeholder="5511999999999"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsappDisplay">WhatsApp (exibição)</Label>
                <Input
                  id="whatsappDisplay"
                  value={settings.whatsappDisplay}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, whatsappDisplay: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="addressLine">Endereço / cidade</Label>
                <Input
                  id="addressLine"
                  value={settings.addressLine}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, addressLine: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="instagramUrl">Instagram</Label>
                <Input
                  id="instagramUrl"
                  value={settings.instagramUrl}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, instagramUrl: e.target.value }))
                  }
                  placeholder="https://www.instagram.com/..."
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="facebookUrl">Facebook</Label>
                <Input
                  id="facebookUrl"
                  value={settings.facebookUrl}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, facebookUrl: e.target.value }))
                  }
                  placeholder="https://www.facebook.com/..."
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tiktokUrl">TikTok</Label>
                <Input
                  id="tiktokUrl"
                  value={settings.tiktokUrl}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, tiktokUrl: e.target.value }))
                  }
                  placeholder="https://www.tiktok.com/..."
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="twitterUrl">Twitter / X (opcional)</Label>
                <Input
                  id="twitterUrl"
                  value={settings.twitterUrl}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, twitterUrl: e.target.value }))
                  }
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando…" : "Salvar contato e redes"}
            </Button>
          </form>
        </Card>
      )}
    </AdminLayout>
  );
}
