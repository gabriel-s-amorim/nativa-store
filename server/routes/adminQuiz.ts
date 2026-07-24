import {
  quizImportBodySchema,
  quizQuestionSchema,
  quizResultSchema,
  type QuizQuestionInput,
  type QuizResultInput,
} from "@shared/schemas/quiz";
import type { QuizImportError } from "@shared/types/quiz";
import { z } from "zod";
import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  createQuizQuestion,
  createQuizResult,
  deleteQuizQuestion,
  deleteQuizResult,
  exportQuiz,
  importQuiz,
  listQuizQuestions,
  listQuizResults,
  updateQuizOptionImage,
  updateQuizQuestion,
  updateQuizResult,
} from "../services/quiz";

const optionImageSchema = z.object({
  imageUrl: z
    .string()
    .refine(
      (value) => value === "" || value.startsWith("/") || /^https?:\/\//i.test(value),
      "URL de imagem inválida",
    ),
});

function statusFromMessage(message: string): number {
  if (message.includes("não encontrad")) return 404;
  if (message.includes("Já existe") || message.includes("Não é possível excluir")) return 409;
  return 500;
}

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [questions, results] = await Promise.all([listQuizQuestions(), listQuizResults()]);
    res.json({ questions, results });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar quiz",
    });
  }
});

router.post("/questions", requireAdmin, async (req, res) => {
  try {
    const parsed = quizQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const question = await createQuizQuestion(parsed.data);
    res.status(201).json(question);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar pergunta";
    res.status(statusFromMessage(message)).json({ error: message });
  }
});

router.put("/questions/:questionId", requireAdmin, async (req, res) => {
  try {
    const parsed = quizQuestionSchema.safeParse({ ...req.body, id: req.params.questionId });
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const question = await updateQuizQuestion(req.params.questionId, parsed.data);
    res.json(question);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar pergunta";
    res.status(statusFromMessage(message)).json({ error: message });
  }
});

router.delete("/questions/:questionId", requireAdmin, async (req, res) => {
  try {
    await deleteQuizQuestion(req.params.questionId);
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir pergunta";
    res.status(statusFromMessage(message)).json({ error: message });
  }
});

router.post("/results", requireAdmin, async (req, res) => {
  try {
    const parsed = quizResultSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const result = await createQuizResult(parsed.data);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar perfil";
    res.status(statusFromMessage(message)).json({ error: message });
  }
});

router.put("/results/:resultId", requireAdmin, async (req, res) => {
  try {
    const parsed = quizResultSchema.safeParse({ ...req.body, id: req.params.resultId });
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const result = await updateQuizResult(req.params.resultId, parsed.data);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar perfil";
    res.status(statusFromMessage(message)).json({ error: message });
  }
});

router.delete("/results/:resultId", requireAdmin, async (req, res) => {
  try {
    await deleteQuizResult(req.params.resultId);
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir perfil";
    res.status(statusFromMessage(message)).json({ error: message });
  }
});

router.patch(
  "/questions/:questionId/options/:optionId/image",
  requireAdmin,
  async (req, res) => {
    try {
      const parsed = optionImageSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
        return;
      }

      const question = await updateQuizOptionImage(
        req.params.questionId,
        req.params.optionId,
        parsed.data.imageUrl,
      );
      res.json(question);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar imagem da opção";
      res.status(statusFromMessage(message)).json({ error: message });
    }
  },
);

router.get("/export", requireAdmin, async (_req, res) => {
  try {
    const payload = await exportQuiz();
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao exportar quiz",
    });
  }
});

router.post("/import", requireAdmin, async (req, res) => {
  try {
    const bodyParsed = quizImportBodySchema.safeParse(req.body);

    if (!bodyParsed.success) {
      res.status(400).json({
        error: "Envie um objeto com arrays 'questions' e 'results'",
        issues: bodyParsed.error.issues,
      });
      return;
    }

    const errors: QuizImportError[] = [];
    const validQuestions: QuizQuestionInput[] = [];
    const validResults: QuizResultInput[] = [];
    const seenQuestionIds = new Set<string>();
    const seenResultIds = new Set<string>();

    bodyParsed.data.questions.forEach((item, index) => {
      const parsed = quizQuestionSchema.safeParse(item);
      if (!parsed.success) {
        errors.push({ section: "questions", index, issues: parsed.error.issues });
        return;
      }

      if (seenQuestionIds.has(parsed.data.id)) {
        errors.push({
          section: "questions",
          index,
          issues: [{ message: `Id de pergunta duplicado no payload: ${parsed.data.id}` }],
        });
        return;
      }

      seenQuestionIds.add(parsed.data.id);
      validQuestions.push(parsed.data);
    });

    bodyParsed.data.results.forEach((item, index) => {
      const parsed = quizResultSchema.safeParse(item);
      if (!parsed.success) {
        errors.push({ section: "results", index, issues: parsed.error.issues });
        return;
      }

      if (seenResultIds.has(parsed.data.id)) {
        errors.push({
          section: "results",
          index,
          issues: [{ message: `Id de resultado duplicado no payload: ${parsed.data.id}` }],
        });
        return;
      }

      seenResultIds.add(parsed.data.id);
      validResults.push(parsed.data);
    });

    if (validQuestions.length === 0 && validResults.length === 0) {
      res.status(400).json({
        error: "Nenhum item válido para importar",
        questions: { created: 0, updated: 0 },
        results: { created: 0, updated: 0 },
        errors,
      });
      return;
    }

    const report = await importQuiz(validQuestions, validResults, errors);
    res.json(report);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao importar quiz",
    });
  }
});

export default router;
