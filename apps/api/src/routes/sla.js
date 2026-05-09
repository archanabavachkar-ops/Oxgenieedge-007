import express from 'express';
import SLAService from '../services/messaging/SLAService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /sla - Create SLA policy
router.post('/', async (req, res) => {
  const { name, channel, firstResponseTime, resolutionTime } = req.body;

  if (!name || !channel || !firstResponseTime || !resolutionTime) {
    return res.status(400).json({
      error: 'Missing required fields: name, channel, firstResponseTime, resolutionTime',
    });
  }

  const policy = await SLAService.createSLAPolicy(
    name,
    channel,
    firstResponseTime,
    resolutionTime
  );

  logger.info(`SLA policy created: ${policy.policyId}`);

  res.status(201).json(policy);
});

// GET /sla - Get SLA policies for a channel
router.get('/', async (req, res) => {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({
      error: 'Missing required parameter: channel',
    });
  }

  const policies = await SLAService.getSLAPolicies(channel);

  res.json(policies);
});

// GET /sla/compliance/:conversationId - Check SLA compliance
router.get('/compliance/:conversationId', async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({
      error: 'Missing required parameter: conversationId',
    });
  }

  const compliance = await SLAService.checkSLACompliance(conversationId);

  res.json(compliance);
});

// GET /sla/metrics - Get SLA metrics for a channel
router.get('/metrics', async (req, res) => {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({
      error: 'Missing required parameter: channel',
    });
  }

  const metrics = await SLAService.getSLAMetrics(channel);

  res.json(metrics);
});

export default router;