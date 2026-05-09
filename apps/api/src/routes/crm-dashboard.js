
import express from 'express';
import { CrmDashboardService } from '../services/CrmDashboardService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /crm/dashboard/kpis - Get KPI data via Service Layer
router.get('/kpis', async (req, res, next) => {
  try {
    const kpis = await CrmDashboardService.getKPIs();
    res.json({
      success: true,
      ...kpis
    });
  } catch (error) {
    next(error);
  }
});

export default router;
