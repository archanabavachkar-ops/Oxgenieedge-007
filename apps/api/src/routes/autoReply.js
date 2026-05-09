import express from 'express';
import AutoReplyService from '../services/messaging/AutoReplyService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /auto-reply - Create auto-reply rule
router.post('/', async (req, res) => {
  const { name, channel, trigger, response, conditions } = req.body;

  if (!name || !channel || !trigger || !response) {
    return res.status(400).json({
      error: 'Missing required fields: name, channel, trigger, response',
    });
  }

  const rule = await AutoReplyService.createAutoReply(
    name,
    channel,
    trigger,
    response,
    conditions || {}
  );

  logger.info(`Auto-reply rule created: ${rule.ruleId}`);

  res.status(201).json(rule);
});

// GET /auto-reply - Get auto-replies for a channel
router.get('/', async (req, res) => {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({
      error: 'Missing required parameter: channel',
    });
  }

  const rules = await AutoReplyService.getAutoReplies(channel);

  res.json(rules);
});

// PUT /auto-reply/:id - Update auto-reply rule
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, trigger, response, conditions } = req.body;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const rule = await AutoReplyService.updateAutoReply(
    id,
    name,
    trigger,
    response,
    conditions
  );

  logger.info(`Auto-reply rule updated: ${id}`);

  res.json(rule);
});

// DELETE /auto-reply/:id - Delete auto-reply rule
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const result = await AutoReplyService.deleteAutoReply(id);

  logger.info(`Auto-reply rule deleted: ${id}`);

  res.json(result);
});

export default router;