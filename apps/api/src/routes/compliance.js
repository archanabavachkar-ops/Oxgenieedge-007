import express from 'express';
import ComplianceService from '../services/compliance/ComplianceService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /compliance/consent/:customerId
 * Check recording consent for customer
 */
router.get('/consent/:customerId', async (req, res) => {
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required',
    });
  }

  const result = await ComplianceService.checkRecordingConsent(customerId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /compliance/consent
 * Record new consent from customer
 */
router.post('/consent', async (req, res) => {
  const { customerId, method, metadata } = req.body;

  if (!customerId || !method) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: customerId, method',
    });
  }

  const result = await ComplianceService.recordConsent(customerId, method, metadata);

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * PUT /compliance/consent/:customerId
 * Update existing consent
 */
router.put('/consent/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const { method, expiryDate, metadata } = req.body;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required',
    });
  }

  const result = await ComplianceService.updateConsent(customerId, {
    method,
    expiryDate,
    metadata,
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /compliance/status/:customerId
 * Get full consent status for customer
 */
router.get('/status/:customerId', async (req, res) => {
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required',
    });
  }

  const result = await ComplianceService.getConsentStatus(customerId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /compliance/log
 * Log compliance event
 */
router.post('/log', async (req, res) => {
  const { customerId, eventType, details } = req.body;

  if (!customerId || !eventType) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: customerId, eventType',
    });
  }

  const result = await ComplianceService.logComplianceEvent(customerId, eventType, details);

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * GET /compliance/audit/:customerId
 * Get audit trail for customer
 */
router.get('/audit/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const { limit, offset, startDate, endDate } = req.query;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required',
    });
  }

  const result = await ComplianceService.getAuditTrail(customerId, {
    limit: limit ? parseInt(limit) : 50,
    offset: offset ? parseInt(offset) : 0,
    startDate,
    endDate,
  });

  res.json({
    success: true,
    data: result,
    count: result.length,
  });
});

/**
 * GET /compliance/allowed/:customerId
 * Check if recording is allowed for customer
 */
router.get('/allowed/:customerId', async (req, res) => {
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required',
    });
  }

  const result = await ComplianceService.isRecordingAllowed(customerId);

  res.json({
    success: true,
    data: result,
  });
});

export default router;