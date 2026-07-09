import type { DashboardPeriod } from "@shared/types/dashboard";
import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import { getDashboardStats } from "../services/adminDashboard";

const router = Router();

const VALID_PERIODS = new Set<DashboardPeriod>(["7d", "30d", "90d", "all"]);

router.get("/", requireAdmin, async (req, res) => {
  try {
    const raw = typeof req.query.period === "string" ? req.query.period : "30d";
    const period = VALID_PERIODS.has(raw as DashboardPeriod) ? (raw as DashboardPeriod) : "30d";
    const stats = await getDashboardStats(period);
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar dashboard",
    });
  }
});

export default router;
