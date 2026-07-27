import AdminLayout from "@/components/admin/AdminLayout";
import { CONTENT_ICON_LABELS } from "@/components/help/ContentIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminApiError,
  fetchAdminContentPage,
  updateAdminContentPage,
} from "@/lib/adminApi";
import {
  CONTENT_ICON_KEYS,
  type ContentIconKey,
  type ContentPage,
  type ContentPageBody,
  type FaqContent,
  type HowToContent,
  type SectionsContent,
} from "@shared/types/contentPage";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

function emptyHowTo(): HowToContent {
  return {
    intro: "",
    steps: [{ iconKey: "check", title: "", description: "" }],
    tips: [],
    cta: { label: "Ver coleção", href: "/#colecoes" },
  };
}

function emptySections(): SectionsContent {
  return {
    intro: "",
    sections: [{ title: "", body: "" }],
    highlights: [],
  };
}

function emptyFaq(): FaqContent {
  return {
    intro: "",
    items: [{ question: "", answer: "" }],
  };
}

function normalizeContent(page: ContentPage): ContentPageBody {
  if (page.pageType === "howto") {
    const c = page.content as HowToContent;
    return {
      intro: c.intro ?? "",
      steps: c.steps?.length ? c.steps : emptyHowTo().steps,
      tips: c.tips ?? [],
      cta: c.cta ?? emptyHowTo().cta,
    };
  }
  if (page.pageType === "faq") {
    const c = page.content as FaqContent;
    return {
      intro: c.intro ?? "",
      items: c.items?.length ? c.items : emptyFaq().items,
    };
  }
  const c = page.content as SectionsContent;
  return {
    intro: c.intro ?? "",
    sections: c.sections?.length ? c.sections : emptySections().sections,
    highlights: c.highlights ?? [],
  };
}

function IconSelect({
  value,
  onChange,
}: {
  value: ContentIconKey;
  onChange: (value: ContentIconKey) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ContentIconKey)}>
      <SelectTrigger>
        <SelectValue placeholder="Ícone" />
      </SelectTrigger>
      <SelectContent>
        {CONTENT_ICON_KEYS.map((key) => (
          <SelectItem key={key} value={key}>
            {CONTENT_ICON_LABELS[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const tmp = copy[index]!;
  copy[index] = copy[next]!;
  copy[next] = tmp;
  return copy;
}

export default function AdminContentPageEditor() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const [page, setPage] = useState<ContentPage | null>(null);
  const [title, setTitle] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [content, setContent] = useState<ContentPageBody>(emptySections());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    fetchAdminContentPage(slug)
      .then((data) => {
        if (cancelled) return;
        setPage(data);
        setTitle(data.title);
        setSeoTitle(data.seoTitle);
        setSeoDescription(data.seoDescription);
        setIsPublished(data.isPublished);
        setContent(normalizeContent(data));
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!page) return;
    setIsSaving(true);
    try {
      const saved = await updateAdminContentPage(slug, {
        title,
        seoTitle,
        seoDescription,
        pageType: page.pageType,
        content,
        isPublished,
      });
      setPage(saved);
      setContent(normalizeContent(saved));
      toast.success("Página salva");
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
    <AdminLayout title={page?.title ?? "Editar página"} backHref="/admin/conteudo">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 px-0">
          <Link href="/admin/conteudo">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {isLoading || !page ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="size-8 text-slate-400" />
        </div>
      ) : (
        <form className="mx-auto max-w-3xl space-y-6" onSubmit={handleSave}>
          <Card className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título (H1)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seoTitle">Título SEO</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={70}
                required
              />
              <p className="text-[11px] text-slate-500">{seoTitle.length}/70</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seoDescription">Meta description</Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                maxLength={180}
                rows={3}
                required
              />
              <p className="text-[11px] text-slate-500">{seoDescription.length}/180</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked === true)}
              />
              Publicada (visível na loja e no sitemap)
            </label>
          </Card>

          {page.pageType === "howto" ? (
            <HowToEditor
              content={content as HowToContent}
              onChange={(next) => setContent(next)}
            />
          ) : null}
          {page.pageType === "sections" ? (
            <SectionsEditor
              content={content as SectionsContent}
              onChange={(next) => setContent(next)}
            />
          ) : null}
          {page.pageType === "faq" ? (
            <FaqEditor
              content={content as FaqContent}
              onChange={(next) => setContent(next)}
            />
          ) : null}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando…" : "Salvar página"}
            </Button>
            <Button asChild type="button" variant="outline">
              <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
                Ver na loja
              </a>
            </Button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}

function HowToEditor({
  content,
  onChange,
}: {
  content: HowToContent;
  onChange: (value: HowToContent) => void;
}) {
  return (
    <Card className="space-y-5 p-5">
      <div className="space-y-1.5">
        <Label>Introdução</Label>
        <Textarea
          value={content.intro}
          onChange={(e) => onChange({ ...content, intro: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Passos</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() =>
              onChange({
                ...content,
                steps: [
                  ...content.steps,
                  { iconKey: "check", title: "", description: "" },
                ],
              })
            }
          >
            <Plus className="size-3.5" />
            Passo
          </Button>
        </div>
        {content.steps.map((step, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Passo {index + 1}
              </p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() =>
                    onChange({
                      ...content,
                      steps: moveItem(content.steps, index, -1),
                    })
                  }
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() =>
                    onChange({
                      ...content,
                      steps: moveItem(content.steps, index, 1),
                    })
                  }
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 text-red-600"
                  onClick={() =>
                    onChange({
                      ...content,
                      steps: content.steps.filter((_, i) => i !== index),
                    })
                  }
                  disabled={content.steps.length <= 1}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            <IconSelect
              value={step.iconKey}
              onChange={(iconKey) => {
                const steps = [...content.steps];
                steps[index] = { ...step, iconKey };
                onChange({ ...content, steps });
              }}
            />
            <Input
              placeholder="Título"
              value={step.title}
              onChange={(e) => {
                const steps = [...content.steps];
                steps[index] = { ...step, title: e.target.value };
                onChange({ ...content, steps });
              }}
              required
            />
            <Textarea
              placeholder="Descrição"
              value={step.description}
              onChange={(e) => {
                const steps = [...content.steps];
                steps[index] = { ...step, description: e.target.value };
                onChange({ ...content, steps });
              }}
              rows={2}
              required
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Dicas</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange({ ...content, tips: [...content.tips, ""] })}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        {content.tips.map((tip, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={tip}
              onChange={(e) => {
                const tips = [...content.tips];
                tips[index] = e.target.value;
                onChange({ ...content, tips });
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() =>
                onChange({
                  ...content,
                  tips: content.tips.filter((_, i) => i !== index),
                })
              }
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>CTA — texto</Label>
          <Input
            value={content.cta.label}
            onChange={(e) =>
              onChange({ ...content, cta: { ...content.cta, label: e.target.value } })
            }
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>CTA — link</Label>
          <Input
            value={content.cta.href}
            onChange={(e) =>
              onChange({ ...content, cta: { ...content.cta, href: e.target.value } })
            }
            required
          />
        </div>
      </div>
    </Card>
  );
}

function SectionsEditor({
  content,
  onChange,
}: {
  content: SectionsContent;
  onChange: (value: SectionsContent) => void;
}) {
  return (
    <Card className="space-y-5 p-5">
      <div className="space-y-1.5">
        <Label>Introdução</Label>
        <Textarea
          value={content.intro}
          onChange={(e) => onChange({ ...content, intro: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Destaques</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...content,
                highlights: [
                  ...content.highlights,
                  { iconKey: "check", title: "", text: "" },
                ],
              })
            }
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        {content.highlights.map((item, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
            <IconSelect
              value={item.iconKey}
              onChange={(iconKey) => {
                const highlights = [...content.highlights];
                highlights[index] = { ...item, iconKey };
                onChange({ ...content, highlights });
              }}
            />
            <Input
              placeholder="Título"
              value={item.title}
              onChange={(e) => {
                const highlights = [...content.highlights];
                highlights[index] = { ...item, title: e.target.value };
                onChange({ ...content, highlights });
              }}
            />
            <Input
              placeholder="Texto"
              value={item.text}
              onChange={(e) => {
                const highlights = [...content.highlights];
                highlights[index] = { ...item, text: e.target.value };
                onChange({ ...content, highlights });
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-red-600"
              onClick={() =>
                onChange({
                  ...content,
                  highlights: content.highlights.filter((_, i) => i !== index),
                })
              }
            >
              Remover
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Seções</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...content,
                sections: [...content.sections, { title: "", body: "" }],
              })
            }
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        {content.sections.map((section, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() =>
                  onChange({
                    ...content,
                    sections: moveItem(content.sections, index, -1),
                  })
                }
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() =>
                  onChange({
                    ...content,
                    sections: moveItem(content.sections, index, 1),
                  })
                }
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-red-600"
                disabled={content.sections.length <= 1}
                onClick={() =>
                  onChange({
                    ...content,
                    sections: content.sections.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <Input
              placeholder="Título da seção"
              value={section.title}
              onChange={(e) => {
                const sections = [...content.sections];
                sections[index] = { ...section, title: e.target.value };
                onChange({ ...content, sections });
              }}
              required
            />
            <Textarea
              placeholder="Texto (use enter para novos parágrafos)"
              value={section.body}
              onChange={(e) => {
                const sections = [...content.sections];
                sections[index] = { ...section, body: e.target.value };
                onChange({ ...content, sections });
              }}
              rows={4}
              required
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

function FaqEditor({
  content,
  onChange,
}: {
  content: FaqContent;
  onChange: (value: FaqContent) => void;
}) {
  return (
    <Card className="space-y-5 p-5">
      <div className="space-y-1.5">
        <Label>Introdução</Label>
        <Textarea
          value={content.intro}
          onChange={(e) => onChange({ ...content, intro: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Perguntas</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...content,
                items: [...content.items, { question: "", answer: "" }],
              })
            }
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
        {content.items.map((item, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() =>
                  onChange({
                    ...content,
                    items: moveItem(content.items, index, -1),
                  })
                }
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() =>
                  onChange({
                    ...content,
                    items: moveItem(content.items, index, 1),
                  })
                }
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-red-600"
                disabled={content.items.length <= 1}
                onClick={() =>
                  onChange({
                    ...content,
                    items: content.items.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <Input
              placeholder="Pergunta"
              value={item.question}
              onChange={(e) => {
                const items = [...content.items];
                items[index] = { ...item, question: e.target.value };
                onChange({ ...content, items });
              }}
              required
            />
            <Textarea
              placeholder="Resposta"
              value={item.answer}
              onChange={(e) => {
                const items = [...content.items];
                items[index] = { ...item, answer: e.target.value };
                onChange({ ...content, items });
              }}
              rows={3}
              required
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
