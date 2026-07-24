import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminLayout from "@/components/admin/AdminLayout";
import TagsInput from "@/components/admin/TagsInput";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminApiError,
  createAdminQuizQuestion,
  createAdminQuizResult,
  deleteAdminQuizQuestion,
  deleteAdminQuizResult,
  exportQuiz,
  fetchAdminQuiz,
  importQuiz,
  updateAdminQuizQuestion,
  updateAdminQuizResult,
  uploadProductImage,
} from "@/lib/adminApi";
import { fetchProducts } from "@/lib/products";
import { QUIZ_TAG_ACCENT_COLORS } from "@shared/const/quizTagColors";
import { slugify } from "@shared/lib/slugify";
import type { QuizQuestionInput, QuizResultInput } from "@shared/schemas/quiz";
import type { Product } from "@shared/types/product";
import type {
  QuizExportPayload,
  QuizImportReport,
  QuizOption,
  QuizQuestion,
  QuizResult,
  QuizTagWeight,
} from "@shared/types/quiz";
import {
  Download,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const SUGGESTED_TAGS = Object.keys(QUIZ_TAG_ACCENT_COLORS);

type OptionForm = {
  id: string;
  label: string;
  imageUrl: string;
  tags: QuizTagWeight[];
};

type QuestionForm = {
  id: string;
  order: number;
  text: string;
  options: OptionForm[];
};

type ResultForm = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  recommendedProductIds: number[];
};

const EMPTY_OPTION = (): OptionForm => ({
  id: "",
  label: "",
  imageUrl: "",
  tags: [{ tag: "natureza", weight: 2 }],
});

function emptyQuestionForm(nextOrder: number): QuestionForm {
  return {
    id: `q${nextOrder}`,
    order: nextOrder,
    text: "",
    options: [EMPTY_OPTION(), EMPTY_OPTION()],
  };
}

const EMPTY_RESULT: ResultForm = {
  id: "",
  name: "",
  description: "",
  tags: [],
  recommendedProductIds: [],
};

function optionLetter(index: number): string {
  return String.fromCharCode(97 + index);
}

function syncOptionIds(questionId: string, options: OptionForm[]): OptionForm[] {
  const base = questionId.trim() || "q";
  return options.map((option, index) => ({
    ...option,
    id: `${base}-${optionLetter(index)}`,
  }));
}

function toQuestionForm(question: QuizQuestion): QuestionForm {
  return {
    id: question.id,
    order: question.order,
    text: question.text,
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      imageUrl: option.imageUrl,
      tags: option.tags.length > 0 ? option.tags : [{ tag: "natureza", weight: 1 }],
    })),
  };
}

function toResultForm(result: QuizResult): ResultForm {
  return {
    id: result.id,
    name: result.name,
    description: result.description,
    tags: result.tags,
    recommendedProductIds: result.recommendedProductIds,
  };
}

function toQuestionInput(form: QuestionForm): QuizQuestionInput {
  const id = form.id.trim();
  return {
    id,
    order: form.order,
    text: form.text.trim(),
    options: syncOptionIds(id, form.options).map(
      (option): QuizOption => ({
        id: option.id,
        label: option.label.trim(),
        imageUrl: option.imageUrl.trim(),
        tags: option.tags
          .map((tag) => ({ tag: tag.tag.trim(), weight: Number(tag.weight) || 1 }))
          .filter((tag) => tag.tag.length > 0),
      }),
    ),
  };
}

function toResultInput(form: ResultForm): QuizResultInput {
  return {
    id: form.id.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
    recommendedProductIds: form.recommendedProductIds,
  };
}

function OptionImageField({
  value,
  uploading,
  onChange,
  onUpload,
}: {
  value: string;
  uploading: boolean;
  onChange: (url: string) => void;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label>Imagem da resposta</Label>
      <p className="text-xs text-[var(--admin-text-muted)]">
        JPG, PNG ou WEBP — convertida automaticamente para .webp no servidor.
      </p>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-hover)]">
          <img src={value} alt="" className="aspect-[4/5] w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="size-8 rounded-full bg-white/95 shadow"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-label="Trocar imagem"
            >
              <Upload className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              className="size-8 rounded-full bg-white/95 text-red-600 shadow"
              onClick={() => onChange("")}
              aria-label="Remover imagem"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-hover)]/50 text-[var(--admin-text-muted)] transition hover:border-[var(--admin-accent)]/50 hover:bg-[var(--admin-accent-soft)]/40"
        >
          {uploading ? <Spinner className="size-5" /> : <ImagePlus className="size-6 opacity-70" />}
          <span className="text-sm font-medium">{uploading ? "Enviando…" : "Enviar imagem"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export default function AdminQuiz() {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastReport, setLastReport] = useState<QuizImportReport | null>(null);

  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(() => emptyQuestionForm(1));
  const [idTouched, setIdTouched] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [uploadingOptionIndex, setUploadingOptionIndex] = useState<number | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<QuizResult | null>(null);
  const [resultForm, setResultForm] = useState<ResultForm>(EMPTY_RESULT);
  const [resultIdTouched, setResultIdTouched] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<QuizResult | null>(null);
  const [isDeletingResult, setIsDeletingResult] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const bagProducts = useMemo(
    () => products.filter((product) => product.category === "Bolsas"),
    [products],
  );

  const filteredBags = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return bagProducts;
    return bagProducts.filter((product) => product.name.toLowerCase().includes(query));
  }, [bagProducts, productSearch]);

  const productNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const product of products) map.set(product.id, product.name);
    return map;
  }, [products]);

  const loadQuiz = useCallback(async () => {
    setIsLoading(true);
    try {
      const [quizData, productsData] = await Promise.all([fetchAdminQuiz(), fetchProducts()]);
      setQuestions(quizData.questions);
      setResults(quizData.results);
      setProducts(productsData);
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Erro ao carregar quiz");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (editingQuestion || idTouched) return;
    const nextId = `q${questionForm.order}`;
    setQuestionForm((prev) => ({
      ...prev,
      id: nextId,
      options: syncOptionIds(nextId, prev.options),
    }));
  }, [questionForm.order, editingQuestion, idTouched]);

  useEffect(() => {
    if (editingResult || resultIdTouched) return;
    const slug = slugify(resultForm.name);
    setResultForm((prev) => ({
      ...prev,
      id: slug ? `r-${slug}` : "",
    }));
  }, [resultForm.name, editingResult, resultIdTouched]);

  function openCreateQuestion() {
    setEditingQuestion(null);
    setIdTouched(false);
    setQuestionForm(emptyQuestionForm(questions.length + 1));
    setQuestionDialogOpen(true);
  }

  function openEditQuestion(question: QuizQuestion) {
    setEditingQuestion(question);
    setIdTouched(true);
    setQuestionForm(toQuestionForm(question));
    setQuestionDialogOpen(true);
  }

  function openCreateResult() {
    setEditingResult(null);
    setResultIdTouched(false);
    setResultForm(EMPTY_RESULT);
    setProductSearch("");
    setResultDialogOpen(true);
  }

  function openEditResult(result: QuizResult) {
    setEditingResult(result);
    setResultIdTouched(true);
    setResultForm(toResultForm(result));
    setProductSearch("");
    setResultDialogOpen(true);
  }

  function updateOption(index: number, patch: Partial<OptionForm>) {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? { ...option, ...patch } : option)),
    }));
  }

  function addOption() {
    setQuestionForm((prev) => {
      if (prev.options.length >= 6) return prev;
      return {
        ...prev,
        options: syncOptionIds(prev.id, [...prev.options, EMPTY_OPTION()]),
      };
    });
  }

  function removeOption(index: number) {
    setQuestionForm((prev) => {
      if (prev.options.length <= 2) return prev;
      const next = prev.options.filter((_, i) => i !== index);
      return { ...prev, options: syncOptionIds(prev.id, next) };
    });
  }

  function updateOptionTag(optionIndex: number, tagIndex: number, patch: Partial<QuizTagWeight>) {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => {
        if (i !== optionIndex) return option;
        return {
          ...option,
          tags: option.tags.map((tag, j) => (j === tagIndex ? { ...tag, ...patch } : tag)),
        };
      }),
    }));
  }

  function addOptionTag(optionIndex: number) {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === optionIndex
          ? { ...option, tags: [...option.tags, { tag: SUGGESTED_TAGS[0] ?? "natureza", weight: 1 }] }
          : option,
      ),
    }));
  }

  function removeOptionTag(optionIndex: number, tagIndex: number) {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => {
        if (i !== optionIndex) return option;
        if (option.tags.length <= 1) return option;
        return { ...option, tags: option.tags.filter((_, j) => j !== tagIndex) };
      }),
    }));
  }

  async function handleOptionUpload(optionIndex: number, file: File) {
    setUploadingOptionIndex(optionIndex);
    try {
      const { url } = await uploadProductImage(file, "quiz");
      updateOption(optionIndex, { imageUrl: url });
      toast.success("Imagem enviada (WebP)");
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Erro ao enviar imagem");
    } finally {
      setUploadingOptionIndex(null);
    }
  }

  async function handleSaveQuestion() {
    const input = toQuestionInput(questionForm);

    if (!input.id) {
      toast.error("Informe o id da pergunta");
      return;
    }
    if (!input.text) {
      toast.error("Informe o texto da pergunta");
      return;
    }
    if (input.options.length < 2) {
      toast.error("Cada pergunta precisa de pelo menos 2 respostas");
      return;
    }
    if (input.options.some((option) => !option.label)) {
      toast.error("Preencha o texto de todas as respostas");
      return;
    }
    if (input.options.some((option) => option.tags.length === 0)) {
      toast.error("Cada resposta precisa de ao menos uma tag de estilo");
      return;
    }
    if (input.options.some((option) => !option.imageUrl)) {
      toast.error("Envie a imagem de todas as respostas");
      return;
    }

    setIsSavingQuestion(true);
    try {
      if (editingQuestion) {
        const updated = await updateAdminQuizQuestion(editingQuestion.id, input);
        setQuestions((prev) =>
          prev
            .map((question) => (question.id === updated.id ? updated : question))
            .sort((a, b) => a.order - b.order),
        );
        toast.success("Pergunta atualizada");
      } else {
        const created = await createAdminQuizQuestion(input);
        setQuestions((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        toast.success("Pergunta criada");
      }
      setQuestionDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Não foi possível salvar");
    } finally {
      setIsSavingQuestion(false);
    }
  }

  async function handleConfirmDeleteQuestion() {
    if (!questionToDelete) return;
    setIsDeletingQuestion(true);
    try {
      await deleteAdminQuizQuestion(questionToDelete.id);
      setQuestions((prev) => prev.filter((question) => question.id !== questionToDelete.id));
      toast.success("Pergunta excluída");
      setQuestionToDelete(null);
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Não foi possível excluir");
    } finally {
      setIsDeletingQuestion(false);
    }
  }

  function toggleProduct(productId: number) {
    setResultForm((prev) => ({
      ...prev,
      recommendedProductIds: prev.recommendedProductIds.includes(productId)
        ? prev.recommendedProductIds.filter((id) => id !== productId)
        : [...prev.recommendedProductIds, productId],
    }));
  }

  async function handleSaveResult() {
    const input = toResultInput(resultForm);

    if (!input.id) {
      toast.error("Informe o id do perfil");
      return;
    }
    if (!input.name) {
      toast.error("Informe o nome do perfil");
      return;
    }
    if (!input.description) {
      toast.error("Informe a descrição do perfil");
      return;
    }
    if (input.tags.length === 0) {
      toast.error("Informe ao menos uma tag do perfil");
      return;
    }

    setIsSavingResult(true);
    try {
      if (editingResult) {
        const updated = await updateAdminQuizResult(editingResult.id, input);
        setResults((prev) => prev.map((result) => (result.id === updated.id ? updated : result)));
        toast.success("Perfil atualizado");
      } else {
        const created = await createAdminQuizResult(input);
        setResults((prev) => [...prev, created]);
        toast.success("Perfil criado");
      }
      setResultDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Não foi possível salvar");
    } finally {
      setIsSavingResult(false);
    }
  }

  async function handleConfirmDeleteResult() {
    if (!resultToDelete) return;
    setIsDeletingResult(true);
    try {
      await deleteAdminQuizResult(resultToDelete.id);
      setResults((prev) => prev.filter((result) => result.id !== resultToDelete.id));
      toast.success("Perfil excluído");
      setResultToDelete(null);
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Não foi possível excluir");
    } finally {
      setIsDeletingResult(false);
    }
  }

  async function handleJsonFile(file: File) {
    setIsImporting(true);
    setLastReport(null);

    try {
      const text = await file.text();
      let parsed: unknown;

      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("Arquivo JSON inválido");
        return;
      }

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        (!Array.isArray((parsed as QuizExportPayload).questions) &&
          !Array.isArray((parsed as QuizExportPayload).results))
      ) {
        toast.error("O JSON deve conter arrays 'questions' e/ou 'results'");
        return;
      }

      const payload = parsed as QuizExportPayload;
      const report = await importQuiz({
        questions: Array.isArray(payload.questions) ? payload.questions : [],
        results: Array.isArray(payload.results) ? payload.results : [],
      });

      setLastReport(report);
      const created = report.questions.created + report.results.created;
      const updated = report.questions.updated + report.results.updated;

      if (created + updated > 0) {
        toast.success(`Importação: ${created} criados, ${updated} atualizados`);
      } else {
        toast.error("Nenhum item válido importado");
      }

      if (report.errors.length > 0) {
        toast.warning(`${report.errors.length} item(ns) com erro`);
      }

      await loadQuiz();
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Erro ao importar quiz");
    } finally {
      setIsImporting(false);
      if (jsonInputRef.current) jsonInputRef.current.value = "";
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const payload = await exportQuiz();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `nativa-quiz-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("JSON exportado");
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Erro ao exportar quiz");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AdminLayout
      title="Quiz de Curadoria"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void loadQuiz()} disabled={isLoading}>
            <RefreshCcw className="size-4" />
            Atualizar
          </Button>
          <Button type="button" variant="outline" onClick={openCreateResult}>
            <Plus className="size-4" />
            Novo perfil
          </Button>
          <Button type="button" className="admin-btn-primary" onClick={openCreateQuestion}>
            <Plus className="size-4" />
            Nova pergunta
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="border-[var(--admin-border)] p-4">
          <p className="text-sm text-[var(--admin-text-secondary)]">
            Cadastre perguntas, respostas (com imagem) e os perfis de resultado com as bolsas
            recomendadas. O matching usa as tags de estilo: respostas acumulam pontos e o perfil com
            mais pontos vence.
          </p>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-16 text-[var(--admin-text-muted)]">
            <Spinner className="size-5" />
            Carregando quiz…
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-[var(--admin-text)]">
                    Perguntas ({questions.length})
                  </h2>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    Cada pergunta precisa de pelo menos 2 respostas com imagem e tags.
                  </p>
                </div>
                <Button type="button" size="sm" className="admin-btn-primary" onClick={openCreateQuestion}>
                  <Plus className="size-3.5" />
                  Nova pergunta
                </Button>
              </div>

              <Card className="overflow-hidden border-[var(--admin-border)]">
                {questions.length === 0 ? (
                  <div className="space-y-4 p-4">
                    <AdminEmptyState
                      icon={<Sparkles className="size-8" />}
                      title="Nenhuma pergunta cadastrada"
                      description="Crie a primeira pergunta ou importe um JSON de backup."
                    />
                    <div className="flex justify-center pb-6">
                      <Button type="button" className="admin-btn-primary" onClick={openCreateQuestion}>
                        <Plus className="size-4" />
                        Criar pergunta
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--admin-border)]">
                    {questions.map((question) => (
                      <li key={question.id} className="space-y-3 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                              #{question.order} · {question.id}
                            </p>
                            <p className="font-semibold text-[var(--admin-text)]">{question.text}</p>
                            <p className="text-xs text-[var(--admin-text-muted)]">
                              {question.options.length} resposta(s)
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEditQuestion(question)}
                            >
                              <Pencil className="size-3.5" />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setQuestionToDelete(question)}
                            >
                              <Trash2 className="size-3.5" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className="overflow-hidden rounded-xl border border-[var(--admin-border)]"
                            >
                              <div className="aspect-[4/5] bg-[var(--admin-surface-hover)]">
                                {option.imageUrl ? (
                                  <img
                                    src={option.imageUrl}
                                    alt={option.label}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-xs text-[var(--admin-text-muted)]">
                                    Sem imagem
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1 p-2.5">
                                <p className="text-sm font-medium leading-snug text-[var(--admin-text)]">
                                  {option.label}
                                </p>
                                <p className="text-[11px] text-[var(--admin-text-muted)]">
                                  {option.tags.map((tag) => `${tag.tag}×${tag.weight}`).join(" · ")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-[var(--admin-text)]">
                    Perfis de resultado ({results.length})
                  </h2>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    Nome, descrição, tags e bolsas recomendadas para cada perfil.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={openCreateResult}>
                  <Plus className="size-3.5" />
                  Novo perfil
                </Button>
              </div>

              <Card className="overflow-hidden border-[var(--admin-border)]">
                {results.length === 0 ? (
                  <div className="p-4">
                    <AdminEmptyState
                      icon={<Sparkles className="size-8" />}
                      title="Nenhum perfil cadastrado"
                      description="Crie os perfis que o quiz pode indicar e vincule as bolsas."
                    />
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--admin-border)]">
                    {results.map((result) => (
                      <li
                        key={result.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="font-semibold text-[var(--admin-text)]">{result.name}</p>
                          <p className="font-mono text-[11px] text-[var(--admin-text-muted)]">
                            {result.id}
                          </p>
                          <p className="line-clamp-2 text-sm text-[var(--admin-text-secondary)]">
                            {result.description}
                          </p>
                          <p className="text-xs text-[var(--admin-text-muted)]">
                            Tags: {result.tags.join(", ")}
                          </p>
                          <p className="text-xs text-[var(--admin-text-muted)]">
                            Bolsas:{" "}
                            {result.recommendedProductIds.length === 0
                              ? "nenhuma"
                              : result.recommendedProductIds
                                  .map((id) => productNameById.get(id) ?? `#${id}`)
                                  .join(", ")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEditResult(result)}
                          >
                            <Pencil className="size-3.5" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setResultToDelete(result)}
                          >
                            <Trash2 className="size-3.5" />
                            Excluir
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>

            <Card className="border-[var(--admin-border)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--admin-text)]">Backup JSON</p>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    Opcional — para exportar ou importar tudo de uma vez.
                  </p>
                  {lastReport && (
                    <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                      Última importação: {lastReport.questions.created + lastReport.results.created}{" "}
                      criados, {lastReport.questions.updated + lastReport.results.updated} atualizados
                      {lastReport.errors.length > 0
                        ? `, ${lastReport.errors.length} erro(s)`
                        : ""}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleExport()}
                    disabled={isExporting}
                  >
                    <Download className="size-3.5" />
                    Exportar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => jsonInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    <Upload className="size-3.5" />
                    {isImporting ? "Importando…" : "Importar"}
                  </Button>
                  <input
                    ref={jsonInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleJsonFile(file);
                    }}
                  />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Editar pergunta" : "Nova pergunta"}</DialogTitle>
            <DialogDescription>
              Defina o enunciado e as respostas. Cada resposta precisa de imagem e tags de estilo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <Label htmlFor="quiz-question-text">Pergunta</Label>
                <Input
                  id="quiz-question-text"
                  value={questionForm.text}
                  onChange={(event) =>
                    setQuestionForm((prev) => ({ ...prev, text: event.target.value }))
                  }
                  placeholder="Ex: Sua bolsa te acompanha pra onde?"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-question-order">Ordem</Label>
                <Input
                  id="quiz-question-order"
                  type="number"
                  min={1}
                  value={questionForm.order}
                  onChange={(event) =>
                    setQuestionForm((prev) => ({
                      ...prev,
                      order: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-question-id">Id interno</Label>
              <Input
                id="quiz-question-id"
                value={questionForm.id}
                onChange={(event) => {
                  setIdTouched(true);
                  const nextId = slugify(event.target.value) || event.target.value.trim();
                  setQuestionForm((prev) => ({
                    ...prev,
                    id: nextId,
                    options: syncOptionIds(nextId, prev.options),
                  }));
                }}
                disabled={Boolean(editingQuestion)}
                placeholder="Ex: q1"
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-[var(--admin-text-muted)]">
                Não muda depois de criado. Os ids das respostas são gerados automaticamente
                (ex: q1-a, q1-b).
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label>Respostas</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addOption}
                  disabled={questionForm.options.length >= 6}
                >
                  <Plus className="size-3.5" />
                  Adicionar resposta
                </Button>
              </div>

              {questionForm.options.map((option, optionIndex) => (
                <div
                  key={`${option.id || "opt"}-${optionIndex}`}
                  className="space-y-3 rounded-xl border border-[var(--admin-border)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--admin-text)]">
                      Resposta {optionLetter(optionIndex).toUpperCase()}
                      <span className="ml-2 font-mono text-[11px] font-normal text-[var(--admin-text-muted)]">
                        {option.id || `${questionForm.id || "q"}-${optionLetter(optionIndex)}`}
                      </span>
                    </p>
                    {questionForm.options.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => removeOption(optionIndex)}
                      >
                        <Trash2 className="size-3.5" />
                        Remover
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                    <OptionImageField
                      value={option.imageUrl}
                      uploading={uploadingOptionIndex === optionIndex}
                      onChange={(url) => updateOption(optionIndex, { imageUrl: url })}
                      onUpload={(file) => void handleOptionUpload(optionIndex, file)}
                    />

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Texto da resposta</Label>
                        <Input
                          value={option.label}
                          onChange={(event) =>
                            updateOption(optionIndex, { label: event.target.value })
                          }
                          placeholder="Ex: Pé na areia, sem hora pra voltar"
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label>Tags de estilo (peso)</Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => addOptionTag(optionIndex)}
                          >
                            <Plus className="size-3.5" />
                            Tag
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {option.tags.map((tag, tagIndex) => (
                            <div key={`${optionIndex}-${tagIndex}`} className="flex gap-2">
                              <Input
                                list="quiz-suggested-tags"
                                value={tag.tag}
                                onChange={(event) =>
                                  updateOptionTag(optionIndex, tagIndex, {
                                    tag: event.target.value.toLowerCase(),
                                  })
                                }
                                placeholder="ex: natureza"
                                className="h-10 rounded-xl"
                              />
                              <Input
                                type="number"
                                min={1}
                                step={1}
                                value={tag.weight}
                                onChange={(event) =>
                                  updateOptionTag(optionIndex, tagIndex, {
                                    weight: Math.max(1, Number(event.target.value) || 1),
                                  })
                                }
                                className="h-10 w-20 rounded-xl"
                                aria-label="Peso"
                              />
                              {option.tags.length > 1 && (
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => removeOptionTag(optionIndex, tagIndex)}
                                  aria-label="Remover tag"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-[var(--admin-text-muted)]">
                          Sugestões: {SUGGESTED_TAGS.join(", ")}. Use peso 2 na tag principal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <datalist id="quiz-suggested-tags">
                {SUGGESTED_TAGS.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setQuestionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="admin-btn-primary"
              onClick={() => void handleSaveQuestion()}
              disabled={isSavingQuestion || uploadingOptionIndex !== null}
            >
              {isSavingQuestion ? <Spinner className="size-4" /> : null}
              {editingQuestion ? "Salvar pergunta" : "Criar pergunta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingResult ? "Editar perfil" : "Novo perfil"}</DialogTitle>
            <DialogDescription>
              O perfil vence quando as tags das respostas batem com as tags abaixo. Vincule as
              bolsas que serão recomendadas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="quiz-result-name">Nome do perfil</Label>
              <Input
                id="quiz-result-name"
                value={resultForm.name}
                onChange={(event) =>
                  setResultForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Ex: Espírito Livre"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-result-id">Id interno</Label>
              <Input
                id="quiz-result-id"
                value={resultForm.id}
                onChange={(event) => {
                  setResultIdTouched(true);
                  setResultForm((prev) => ({ ...prev, id: slugify(event.target.value) }));
                }}
                disabled={Boolean(editingResult)}
                placeholder="Ex: r-natureza"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-result-description">Descrição</Label>
              <Textarea
                id="quiz-result-description"
                value={resultForm.description}
                onChange={(event) =>
                  setResultForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Texto mostrado na tela de resultado"
                className="min-h-28 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags do perfil</Label>
              <TagsInput
                value={resultForm.tags}
                onChange={(tags) => setResultForm((prev) => ({ ...prev, tags }))}
                placeholder="Digite e Enter — ex: natureza"
              />
              <p className="text-xs text-[var(--admin-text-muted)]">
                Devem bater com as tags das respostas. Sugestões: {SUGGESTED_TAGS.join(", ")}.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Bolsas recomendadas</Label>
              <Input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Buscar bolsa…"
                className="h-10 rounded-xl"
              />
              <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-[var(--admin-border)] p-3">
                {filteredBags.length === 0 ? (
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    {bagProducts.length === 0
                      ? "Nenhuma bolsa cadastrada ainda."
                      : "Nenhuma bolsa encontrada com esse nome."}
                  </p>
                ) : (
                  filteredBags.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--admin-surface-hover)]"
                    >
                      <Checkbox
                        checked={resultForm.recommendedProductIds.includes(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                      <span className="truncate text-[var(--admin-text)]">{product.name}</span>
                    </label>
                  ))
                )}
              </div>
              {resultForm.recommendedProductIds.length > 0 && (
                <p className="text-xs text-[var(--admin-text-muted)]">
                  {resultForm.recommendedProductIds.length} bolsa(s) selecionada(s)
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setResultDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="admin-btn-primary"
              onClick={() => void handleSaveResult()}
              disabled={isSavingResult}
            >
              {isSavingResult ? <Spinner className="size-4" /> : null}
              {editingResult ? "Salvar perfil" : "Criar perfil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(questionToDelete)}
        onOpenChange={(open) => !open && setQuestionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pergunta?</AlertDialogTitle>
            <AlertDialogDescription>
              A pergunta e todas as respostas dela saem do quiz. Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingQuestion}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDeleteQuestion()}
              disabled={isDeletingQuestion}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingQuestion ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(resultToDelete)}
        onOpenChange={(open) => !open && setResultToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Se já houver conclusões do quiz neste perfil, a exclusão pode ser bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingResult}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDeleteResult()}
              disabled={isDeletingResult}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingResult ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
