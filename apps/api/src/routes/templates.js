import express from 'express';
import MessageTemplatesService from '../services/messaging/MessageTemplatesService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /templates - Create message template
router.post('/', async (req, res) => {
  const { name, channel, content, variables } = req.body;

  if (!name || !channel || !content) {
    return res.status(400).json({
      error: 'Missing required fields: name, channel, content',
    });
  }

  const template = await MessageTemplatesService.createTemplate(
    name,
    channel,
    content,
    variables || []
  );

  logger.info(`Template created: ${template.templateId}`);

  res.status(201).json(template);
});

// GET /templates - Get templates for a channel
router.get('/', async (req, res) => {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({
      error: 'Missing required parameter: channel',
    });
  }

  const templates = await MessageTemplatesService.getTemplates(channel);

  res.json(templates);
});

// GET /templates/:id - Get single template
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const template = await MessageTemplatesService.getTemplate(id);

  res.json(template);
});

// PUT /templates/:id - Update template
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, content, variables } = req.body;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const template = await MessageTemplatesService.updateTemplate(
    id,
    name,
    content,
    variables
  );

  logger.info(`Template updated: ${id}`);

  res.json(template);
});

// DELETE /templates/:id - Delete template
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const result = await MessageTemplatesService.deleteTemplate(id);

  logger.info(`Template deleted: ${id}`);

  res.json(result);
});

export default router;