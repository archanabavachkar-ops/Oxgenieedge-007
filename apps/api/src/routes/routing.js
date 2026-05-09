import express from 'express';
import routingService from '../services/routing/CallRoutingService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /routing/rules - Fetch all routing rules
router.get('/rules', async (req, res) => {
  const rules = await routingService.getRoutingRules();

  logger.info(`Routing rules list retrieved: ${rules.length} rules`);

  res.json({
    success: true,
    rules,
    count: rules.length,
  });
});

// POST /routing/rules - Create new routing rule
router.post('/rules', async (req, res) => {
  const { name, priority, conditions, target_queue, target_agent, is_active } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Rule name is required',
    });
  }

  if (priority === undefined || typeof priority !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'Priority must be a number',
    });
  }

  const rule = await routingService.createRoutingRule({
    name,
    priority,
    conditions,
    target_queue,
    target_agent,
    is_active,
  });

  logger.info(`Routing rule created: ${rule.id}`);

  res.status(201).json({
    success: true,
    rule,
  });
});

// PUT /routing/rules/:id - Update routing rule
router.put('/rules/:id', async (req, res) => {
  const { id } = req.params;
  const { name, priority, conditions, target_queue, target_agent, is_active } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Rule ID is required',
    });
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (priority !== undefined) updates.priority = priority;
  if (conditions !== undefined) updates.conditions = conditions;
  if (target_queue !== undefined) updates.target_queue = target_queue;
  if (target_agent !== undefined) updates.target_agent = target_agent;
  if (is_active !== undefined) updates.is_active = is_active;

  const rule = await routingService.updateRoutingRule(id, updates);

  logger.info(`Routing rule updated: ${id}`);

  res.json({
    success: true,
    rule,
  });
});

// DELETE /routing/rules/:id - Delete routing rule
router.delete('/rules/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Rule ID is required',
    });
  }

  const result = await routingService.deleteRoutingRule(id);

  logger.info(`Routing rule deleted: ${id}`);

  res.json(result);
});

// POST /routing/find-agent - Find best available agent
router.post('/find-agent', async (req, res) => {
  const { customerId, language, leadSource, customerSegment, strategy } = req.body;

  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Customer ID is required',
    });
  }

  const callData = {
    customerId,
    language,
    leadSource,
    customerSegment,
    strategy,
  };

  const agent = await routingService.findBestAgent(callData);

  logger.info(`Best agent found: ${agent.agentId}`);

  res.json({
    success: true,
    agent,
  });
});

// POST /routing/assign-agent - Assign agent to call
router.post('/assign-agent', async (req, res) => {
  const { callId, agentId } = req.body;

  if (!callId || typeof callId !== 'string' || callId.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Call ID is required',
    });
  }

  if (!agentId || typeof agentId !== 'string' || agentId.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Agent ID is required',
    });
  }

  const assignment = await routingService.assignAgent(callId, agentId);

  logger.info(`Agent assigned: ${agentId} to call ${callId}`);

  res.json({
    success: true,
    assignment,
  });
});

// GET /routing/agent-availability/:agentId - Get agent availability
router.get('/agent-availability/:agentId', async (req, res) => {
  const { agentId } = req.params;

  if (!agentId) {
    return res.status(400).json({
      success: false,
      error: 'Agent ID is required',
    });
  }

  const availability = await routingService.getAgentAvailability(agentId);

  logger.info(`Agent availability retrieved: ${agentId}`);

  res.json({
    success: true,
    availability,
  });
});

// GET /routing/queue-status/:queue - Get queue status
router.get('/queue-status/:queue', async (req, res) => {
  const { queue } = req.params;

  const queueStatus = await routingService.getQueueStatus(queue || null);

  logger.info(`Queue status retrieved: ${queue || 'all'}`);

  res.json({
    success: true,
    queueStatus,
  });
});

// GET /routing/agents/total - Get total agent statistics
router.get('/agents/total', async (req, res) => {
  const stats = await routingService.getTotalAgents();

  logger.info(`Agent statistics retrieved`);

  res.json({
    success: true,
    stats,
  });
});

export default router;