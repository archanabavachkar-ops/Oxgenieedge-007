import express from 'express';
import ivrService from '../services/ivr/IVRService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /ivr/flows - Fetch all IVR flows
router.get('/flows', async (req, res) => {
  const flows = await ivrService.getAllFlows();

  logger.info(`IVR flows list retrieved: ${flows.length} flows`);

  res.json({
    success: true,
    flows,
    count: flows.length,
  });
});

// GET /ivr/flows/:id - Fetch single IVR flow
router.get('/flows/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Flow ID is required',
    });
  }

  const flow = await ivrService.getFlow(id);

  logger.info(`IVR flow retrieved: ${id}`);

  res.json({
    success: true,
    flow,
  });
});

// POST /ivr/flows - Create new IVR flow
router.post('/flows', async (req, res) => {
  const { name, steps } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Flow name is required and must be a non-empty string',
    });
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'At least one step is required',
    });
  }

  const flow = await ivrService.createFlow(name, steps);

  logger.info(`IVR flow created: ${flow.id}`);

  res.status(201).json({
    success: true,
    flow,
  });
});

// PUT /ivr/flows/:id - Update IVR flow
router.put('/flows/:id', async (req, res) => {
  const { id } = req.params;
  const { name, steps, isActive } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Flow ID is required',
    });
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (steps !== undefined) updates.steps = steps;
  if (isActive !== undefined) updates.isActive = isActive;

  const flow = await ivrService.updateFlow(id, updates);

  logger.info(`IVR flow updated: ${id}`);

  res.json({
    success: true,
    flow,
  });
});

// DELETE /ivr/flows/:id - Delete IVR flow
router.delete('/flows/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Flow ID is required',
    });
  }

  const result = await ivrService.deleteFlow(id);

  logger.info(`IVR flow deleted: ${id}`);

  res.json(result);
});

// POST /ivr/execute - Execute IVR flow
router.post('/execute', async (req, res) => {
  const { callId, flowId } = req.body;

  if (!callId || typeof callId !== 'string' || callId.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Call ID is required',
    });
  }

  if (!flowId || typeof flowId !== 'string' || flowId.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Flow ID is required',
    });
  }

  const execution = await ivrService.executeFlow(callId, flowId);

  logger.info(`IVR flow execution started: ${execution.executionId}`);

  res.status(201).json({
    success: true,
    execution,
  });
});

// POST /ivr/dtmf - Process DTMF input
router.post('/dtmf', async (req, res) => {
  const { executionId, dtmfInput } = req.body;

  if (!executionId || typeof executionId !== 'string' || executionId.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Execution ID is required',
    });
  }

  if (!dtmfInput || typeof dtmfInput !== 'string' || dtmfInput.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'DTMF input is required',
    });
  }

  const result = await ivrService.processDTMFInput(executionId, dtmfInput);

  logger.info(`DTMF input processed: ${executionId} - Input: ${dtmfInput}`);

  res.json({
    success: true,
    result,
  });
});

// GET /ivr/status/:executionId - Get flow execution status
router.get('/status/:executionId', async (req, res) => {
  const { executionId } = req.params;

  if (!executionId) {
    return res.status(400).json({
      success: false,
      error: 'Execution ID is required',
    });
  }

  const status = await ivrService.getFlowStatus(executionId);

  logger.info(`IVR flow status retrieved: ${executionId}`);

  res.json({
    success: true,
    status,
  });
});

export default router;