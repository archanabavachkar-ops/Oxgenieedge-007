import express from 'express';
import ClickToCallService from '../services/clickToCall/ClickToCallService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /click-to-call/initiate
 * Initiate a click-to-call
 */
router.post('/initiate', async (req, res) => {
  const { phoneNumber, customerId, agentId, metadata } = req.body;

  if (!phoneNumber || !customerId || !agentId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: phoneNumber, customerId, agentId',
    });
  }

  const result = await ClickToCallService.initiateClickToCall(
    phoneNumber,
    customerId,
    agentId,
    metadata
  );

  res.status(201).json({
    success: result.success,
    data: result,
  });
});

/**
 * GET /click-to-call/status/:callId
 * Get click-to-call status
 */
router.get('/status/:callId', async (req, res) => {
  const { callId } = req.params;

  if (!callId) {
    return res.status(400).json({
      success: false,
      error: 'Call ID is required',
    });
  }

  const result = await ClickToCallService.getCallStatus(callId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /click-to-call/:callId/end
 * End a click-to-call
 */
router.post('/:callId/end', async (req, res) => {
  const { callId } = req.params;
  const { reason, metadata } = req.body;

  if (!callId) {
    return res.status(400).json({
      success: false,
      error: 'Call ID is required',
    });
  }

  const result = await ClickToCallService.endClickToCall(callId, {
    reason,
    metadata,
  });

  res.json({
    success: result.success,
    data: result,
  });
});

/**
 * GET /click-to-call/history/:customerId
 * Get call history for customer
 */
router.get('/history/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const { limit, offset, startDate, endDate } = req.query;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required',
    });
  }

  const result = await ClickToCallService.getCallHistory(customerId, {
    limit: limit ? parseInt(limit) : 20,
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
 * GET /click-to-call/details/:callId
 * Get detailed call information
 */
router.get('/details/:callId', async (req, res) => {
  const { callId } = req.params;

  if (!callId) {
    return res.status(400).json({
      success: false,
      error: 'Call ID is required',
    });
  }

  const result = await ClickToCallService.getCallDetails(callId);

  res.json({
    success: true,
    data: result,
  });
});

export default router;