import { Router } from "express";
import {
  generateVisitorSessionId,
  getVisitorSessionFromCookie,
  setVisitorSessionCookie,
} from "../lib/visitorSession";
import { recordPageView } from "../services/analytics";

const router = Router();

router.post("/page-view", async (req, res) => {
  try {
    const path = typeof req.body?.path === "string" ? req.body.path : "/";
    if (path.startsWith("/admin")) {
      res.status(204).send();
      return;
    }

    let sessionId = getVisitorSessionFromCookie(req.cookies ?? {});
    if (!sessionId) {
      sessionId = generateVisitorSessionId();
      setVisitorSessionCookie(res, sessionId);
    }

    await recordPageView(sessionId, path);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao registrar visita",
    });
  }
});

export default router;
