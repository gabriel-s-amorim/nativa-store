import Footer from "@/components/Footer";
import FaqContentView from "@/components/help/FaqContentView";
import HowToContentView from "@/components/help/HowToContentView";
import SectionsContentView from "@/components/help/SectionsContentView";
import Navbar from "@/components/Navbar";
import { Spinner } from "@/components/ui/spinner";
import { fetchContentPage } from "@/lib/contentPages";
import { getAppUrl } from "@/lib/appUrl";
import { usePageMeta } from "@/lib/seo";
import { fetchStoreSettings } from "@/lib/storeSettings";
import { buildWhatsAppUrl, defaultWhatsAppMessage } from "@/lib/whatsapp";
import {
  buildContentPageJsonLd,
} from "@shared/lib/contentPageSeo";
import type {
  ContentPage,
  FaqContent,
  HowToContent,
  SectionsContent,
} from "@shared/types/contentPage";
import type { StoreSettings } from "@shared/types/storeSettings";
import { DEFAULT_STORE_SETTINGS } from "@shared/types/storeSettings";
import { SITE_NAME } from "@shared/const/site";
import { ChevronRight, Mail, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

export default function HelpPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<ContentPage | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    Promise.all([fetchContentPage(slug), fetchStoreSettings()]).then(
      ([pageData, settingsData]) => {
        if (cancelled) return;
        setSettings(settingsData);
        if (!pageData) {
          setNotFound(true);
          setPage(null);
        } else {
          setPage(pageData);
        }
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const path = `/${slug}`;
  const baseUrl = getAppUrl();

  const jsonLd = useMemo(() => {
    if (!page) return undefined;
    return buildContentPageJsonLd({ baseUrl, page });
  }, [baseUrl, page]);

  usePageMeta(
    page
      ? {
          title: page.seoTitle || `${page.title} — ${SITE_NAME}`,
          description: page.seoDescription,
          path,
          jsonLd,
        }
      : notFound
        ? {
            title: `Página não encontrada — ${SITE_NAME}`,
            description: "Esta página de ajuda não está disponível.",
            path,
            noIndex: true,
          }
        : {
            title: `Ajuda — ${SITE_NAME}`,
            description: "Páginas de ajuda da Nativa Store.",
            path,
          },
  );

  const whatsappHref = buildWhatsAppUrl(
    defaultWhatsAppMessage(),
    settings.whatsappNumber,
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -10%, #F8EBD8 0%, #F5F0E8 45%, #EDE4D4 100%)",
      }}
    >
      <Navbar />
      <main className="pt-24 md:pt-28 pb-16">
        <div className="container">
          <nav
            className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-[#5C4A3A]/70"
            style={{ fontFamily: "'Nunito', sans-serif" }}
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[#C4522A] transition-colors">
              Início
            </Link>
            <ChevronRight size={12} aria-hidden />
            <span className="text-[#3D2B1F] font-semibold">
              {page?.title ?? "Ajuda"}
            </span>
          </nav>

          {loading ? (
            <div
              className="flex min-h-[40vh] items-center justify-center"
              role="status"
              aria-label="Carregando página"
            >
              <Spinner className="size-8 text-[#C4522A]/50" />
            </div>
          ) : notFound || !page ? (
            <div className="mx-auto max-w-lg py-16 text-center">
              <h1
                className="mb-3 text-3xl font-semibold text-[#3D2B1F]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                Página não encontrada
              </h1>
              <p
                className="mb-8 text-[#5C4A3A]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Esta página de ajuda não está disponível no momento.
              </p>
              <Link
                href="/"
                className="inline-flex rounded-full px-6 py-3 text-sm font-bold text-white"
                style={{ background: "#C4522A", fontFamily: "'Nunito', sans-serif" }}
              >
                Voltar à loja
              </Link>
            </div>
          ) : (
            <>
              <header className="mx-auto mb-12 max-w-3xl text-center">
                <p
                  className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#C4522A]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Nativa Store · Ajuda
                </p>
                <h1
                  className="mb-4 text-4xl font-semibold text-[#3D2B1F] md:text-5xl"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {page.title}
                </h1>
                <div
                  className="mx-auto h-1 w-16 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #C4522A, #E8821A)",
                  }}
                  aria-hidden
                />
              </header>

              {page.pageType === "howto" ? (
                <HowToContentView content={page.content as HowToContent} />
              ) : page.pageType === "faq" ? (
                <FaqContentView content={page.content as FaqContent} />
              ) : (
                <SectionsContentView content={page.content as SectionsContent} />
              )}

              <aside
                className="mx-auto mt-16 max-w-2xl rounded-3xl px-6 py-8 text-center md:px-10"
                style={{
                  background: "linear-gradient(145deg, #1A3D2B, #24553B)",
                  color: "white",
                }}
              >
                <h2
                  className="mb-2 text-xl font-semibold"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Ainda tem dúvida?
                </h2>
                <p
                  className="mb-6 text-sm text-white/70"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Fale com a gente — atendimento humano, no tempo da conversa.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    <MessageCircle size={16} aria-hidden />
                    WhatsApp {settings.whatsappDisplay}
                  </a>
                  {settings.contactEmail ? (
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/15"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      <Mail size={16} aria-hidden />
                      {settings.contactEmail}
                    </a>
                  ) : null}
                </div>
              </aside>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
