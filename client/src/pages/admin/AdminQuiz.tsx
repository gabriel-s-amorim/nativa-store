import AdminLayout from "@/components/admin/AdminLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  AdminApiError,
  exportQuiz,
  fetchAdminQuiz,
  importQuiz,
  updateQuizOptionImage,
  uploadProductImage,
} from "@/lib/adminApi";
import type { QuizExportPayload, QuizImportReport, QuizQuestion, QuizResult } from "@shared/types/quiz";
import { Download, ImagePlus, RefreshCcw, Sparkles, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AdminQuiz() {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<QuizImportReport | null>(null);

  const loadQuiz = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminQuiz();
      setQuestions(data.questions);
      setResults(data.results);
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Erro ao carregar quiz");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

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
      const errorCount = report.errors.length;

      if (created + updated > 0) {
        toast.success(`Importação concluída: ${created} criados, ${updated} atualizados`);
      } else {
        toast.error("Nenhum item válido importado");
      }

      if (errorCount > 0) {
        toast.warning(`${errorCount} item(ns) com erro de validação`);
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

  async function handleOptionImageUpload(
    questionId: string,
    optionId: string,
    file: File,
  ) {
    const key = `${questionId}:${optionId}`;
    setUploadingKey(key);
    try {
      const { url } = await uploadProductImage(file, "quiz");
      const updated = await updateQuizOptionImage(questionId, optionId, url);
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      toast.success("Imagem da opção atualizada");
    } catch (error) {
      toast.error(error instanceof AdminApiError ? error.message : "Erro ao enviar imagem");
    } finally {
      setUploadingKey(null);
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
          <Button type="button" variant="outline" onClick={() => void handleExport()} disabled={isExporting}>
            <Download className="size-4" />
            Exportar JSON
          </Button>
          <Button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="size-4" />
            {isImporting ? "Importando…" : "Importar JSON"}
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
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4" />
              Importação em massa
            </CardTitle>
            <CardDescription>
              Envie um arquivo .json com arrays <code>questions</code> e <code>results</code>. Depois,
              troque as imagens das opções abaixo pelo upload — elas vão para o Storage (pasta quiz).
            </CardDescription>
          </CardHeader>
          {lastReport && (
            <CardContent>
              <Alert>
                <AlertTitle>Última importação</AlertTitle>
                <AlertDescription className="space-y-1">
                  <p>
                    Perguntas: {lastReport.questions.created} criadas, {lastReport.questions.updated}{" "}
                    atualizadas
                  </p>
                  <p>
                    Resultados: {lastReport.results.created} criados, {lastReport.results.updated}{" "}
                    atualizados
                  </p>
                  {lastReport.errors.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {lastReport.errors.slice(0, 10).map((error) => (
                        <li key={`${error.section}-${error.index}`}>
                          [{error.section}] índice {error.index}:{" "}
                          {Array.isArray(error.issues)
                            ? error.issues
                                .map((issue) =>
                                  typeof issue === "object" &&
                                  issue !== null &&
                                  "message" in issue
                                    ? String((issue as { message: string }).message)
                                    : JSON.stringify(issue),
                                )
                                .join("; ")
                            : String(error.issues)}
                        </li>
                      ))}
                      {lastReport.errors.length > 10 && (
                        <li>…e mais {lastReport.errors.length - 10} erro(s)</li>
                      )}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="size-8" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Perguntas e imagens ({questions.length})</CardTitle>
                <CardDescription>
                  Clique em “Trocar imagem” em cada opção. JPG, PNG, WEBP ou GIF.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma pergunta cadastrada. Importe o JSON primeiro.
                  </p>
                ) : (
                  questions.map((question) => (
                    <div key={question.id} className="space-y-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          #{question.order} · {question.id}
                        </p>
                        <h3 className="text-sm font-semibold">{question.text}</h3>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {question.options.map((option) => {
                          const key = `${question.id}:${option.id}`;
                          const isUploading = uploadingKey === key;
                          return (
                            <div
                              key={option.id}
                              className="overflow-hidden rounded-lg border bg-card"
                            >
                              <div className="aspect-[4/5] bg-muted">
                                {option.imageUrl ? (
                                  <img
                                    src={option.imageUrl}
                                    alt={option.label}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                    Sem imagem
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2 p-3">
                                <p className="text-sm font-medium leading-snug">{option.label}</p>
                                <p className="truncate font-mono text-[10px] text-muted-foreground">
                                  {option.id}
                                </p>
                                <label className="block">
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    disabled={!!uploadingKey}
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      if (file) {
                                        void handleOptionImageUpload(question.id, option.id, file);
                                      }
                                      event.target.value = "";
                                    }}
                                  />
                                  <span
                                    className={`inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold ${
                                      isUploading || uploadingKey
                                        ? "pointer-events-none opacity-50"
                                        : "hover:bg-muted"
                                    }`}
                                  >
                                    <ImagePlus className="size-3.5" />
                                    {isUploading ? "Enviando…" : "Trocar imagem"}
                                  </span>
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resultados ({results.length})</CardTitle>
                <CardDescription>Perfis de estilo e produtos recomendados.</CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum resultado cadastrado.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Id</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Produtos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-mono text-xs">{result.id}</TableCell>
                          <TableCell>{result.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {result.tags.join(", ")}
                          </TableCell>
                          <TableCell className="text-right">
                            {result.recommendedProductIds.length}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
