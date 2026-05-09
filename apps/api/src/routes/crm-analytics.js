
import express from 'express';
import { AnalyticsService } from '../services/AnalyticsService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /crm/analytics/funnel
router.get('/funnel', async (req, res, next) => {
  try {
    const data = await AnalyticsService.getFunnel();
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

// GET /crm/analytics/sources
router.get('/sources', async (req, res, next) => {
  try {
    const data = await AnalyticsService.getSources();
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

// GET /crm/analytics/pipeline
router.get('/pipeline', async (req, res, next) => {
  try {
    const data = await AnalyticsService.getPipeline();
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

// GET /crm/analytics/quality
router.get('/quality', async (req, res, next) => {
  try {
    const data = await AnalyticsService.getQuality();
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
});

export default router;
