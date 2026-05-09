import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to validate rule structure
const validateRuleStructure = (rule) => {
  const errors = [];

  if (!rule.name || typeof rule.name !== 'string' || rule.name.trim() === '') {
    errors.push('Rule name is required and must be a non-empty string');
  }

  if (!rule.trigger_integration || typeof rule.trigger_integration !== 'string') {
    errors.push('Trigger integration is required');
  }

  if (!rule.trigger_event || typeof rule.trigger_event !== 'string') {
    errors.push('Trigger event is required');
  }

  if (!rule.conditions || !Array.isArray(rule.conditions)) {
    errors.push('Conditions must be an array');
  }

  if (!rule.actions || !Array.isArray(rule.actions)) {
    errors.push('Actions must be an array');
  }

  if (rule.actions.length === 0) {
    errors.push('At least one action is required');
  }

  return errors;
};

// Helper function to execute automation actions
const executeActions = async (actions, triggerData) => {
  const results = [];

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'webhook':
          if (action.webhook_url) {
            const response = await fetch(action.webhook_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(triggerData),
            });
            results.push({
              type: 'webhook',
              status: response.ok ? 'success' : 'failed',
              message: response.ok ? 'Webhook executed' : `HTTP ${response.status}`,
            });
          }
          break;

        case 'notification':
          if (action.notification_type && action.message) {
            results.push({
              type: 'notification',
              status: 'success',
              message: 'Notification queued',
            });
          }
          break;

        case 'email':
          if (action.email_to && action.email_subject) {
            results.push({
              type: 'email',
              status: 'success',
              message: 'Email queued',
            });
          }
          break;

        case 'create_record':
          if (action.collection && action.data) {
            try {
              const record = await pb.collection(action.collection).create(action.data);
              results.push({
                type: 'create_record',
                status: 'success',
                message: `Record created in ${action.collection}`,
                record_id: record.id,
              });
            } catch (error) {
              results.push({
                type: 'create_record',
                status: 'failed',
                message: error.message,
              });
            }
          }
          break;

        default:
          results.push({
            type: action.type,
            status: 'skipped',
            message: 'Unknown action type',
          });
      }
    } catch (error) {
      logger.error(`Error executing action ${action.type}: ${error.message}`);
      results.push({
        type: action.type,
        status: 'failed',
        message: error.message,
      });
    }
  }

  return results;
};

// GET /automation-rules - Fetch all automation rules
router.get('/', async (req, res) => {
  const { is_active, trigger_integration, limit = 20, offset = 0 } = req.query;

  // Build filter
  let filter = '';

  if (is_active !== undefined) {
    const activeBool = is_active === 'true' || is_active === true;
    filter += `is_active = ${activeBool}`;
  }

  if (trigger_integration) {
    filter += filter ? ` && trigger_integration = "${trigger_integration}"` : `trigger_integration = "${trigger_integration}"`;
  }

  // Fetch rules with pagination
  const rules = await pb.collection('automation_rules').getFullList({
    filter: filter || undefined,
    sort: '-created_at',
    limit: Math.min(parseInt(limit) || 20, 100),
    skip: parseInt(offset) || 0,
  });

  // Get total count
  const allRules = await pb.collection('automation_rules').getFullList({
    filter: filter || undefined,
  });

  logger.info(`Automation rules retrieved: ${rules.length} of ${allRules.length}`);

  res.json({
    success: true,
    rules: rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      trigger_integration: rule.trigger_integration,
      trigger_event: rule.trigger_event,
      is_active: rule.is_active !== false,
      execution_count: rule.execution_count || 0,
      last_executed: rule.last_executed || null,
      created_at: rule.created_at,
    })),
    pagination: {
      limit: Math.min(parseInt(limit) || 20, 100),
      offset: parseInt(offset) || 0,
      total: allRules.length,
      count: rules.length,
    },
  });
});

// GET /automation-rules/:id - Fetch single automation rule
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: id',
    });
  }

  const rule = await pb.collection('automation_rules').getOne(id);

  if (!rule) {
    return res.status(404).json({
      success: false,
      error: 'Automation rule not found',
    });
  }

  logger.info(`Automation rule retrieved: ${id}`);

  res.json({
    success: true,
    rule: {
      id: rule.id,
      name: rule.name,
      description: rule.description || '',
      trigger_integration: rule.trigger_integration,
      trigger_event: rule.trigger_event,
      conditions: rule.conditions ? JSON.parse(rule.conditions) : [],
      actions: rule.actions ? JSON.parse(rule.actions) : [],
      is_active: rule.is_active !== false,
      execution_count: rule.execution_count || 0,
      last_executed: rule.last_executed || null,
      created_at: rule.created_at,
      updated_at: rule.updated_at,
    },
  });
});

// POST /automation-rules - Create new automation rule
router.post('/', async (req, res) => {
  const { name, description, trigger_integration, trigger_event, conditions, actions, is_active } = req.body;

  // Validate rule structure
  const validationErrors = validateRuleStructure({
    name,
    trigger_integration,
    trigger_event,
    conditions: conditions || [],
    actions: actions || [],
  });

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: validationErrors,
    });
  }

  // Create automation rule
  const rule = await pb.collection('automation_rules').create({
    name: name.trim(),
    description: description ? description.trim() : '',
    trigger_integration: trigger_integration.trim(),
    trigger_event: trigger_event.trim(),
    conditions: JSON.stringify(conditions || []),
    actions: JSON.stringify(actions || []),
    is_active: is_active !== false,
    execution_count: 0,
    created_at: new Date().toISOString(),
  });

  logger.info(`Automation rule created: ${rule.id} - ${name}`);

  res.status(201).json({
    success: true,
    rule: {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      trigger_integration: rule.trigger_integration,
      trigger_event: rule.trigger_event,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions),
      is_active: rule.is_active,
      execution_count: rule.execution_count,
      created_at: rule.created_at,
    },
  });
});

// PUT /automation-rules/:id - Update automation rule
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, trigger_integration, trigger_event, conditions, actions, is_active } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: id',
    });
  }

  // Get existing rule
  const existingRule = await pb.collection('automation_rules').getOne(id);

  if (!existingRule) {
    return res.status(404).json({
      success: false,
      error: 'Automation rule not found',
    });
  }

  // Validate rule structure if provided
  if (name || trigger_integration || trigger_event || conditions || actions) {
    const validationErrors = validateRuleStructure({
      name: name || existingRule.name,
      trigger_integration: trigger_integration || existingRule.trigger_integration,
      trigger_event: trigger_event || existingRule.trigger_event,
      conditions: conditions || JSON.parse(existingRule.conditions),
      actions: actions || JSON.parse(existingRule.actions),
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }
  }

  // Build update data
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description ? description.trim() : '';
  if (trigger_integration !== undefined) updateData.trigger_integration = trigger_integration.trim();
  if (trigger_event !== undefined) updateData.trigger_event = trigger_event.trim();
  if (conditions !== undefined) updateData.conditions = JSON.stringify(conditions);
  if (actions !== undefined) updateData.actions = JSON.stringify(actions);
  if (is_active !== undefined) updateData.is_active = is_active;
  updateData.updated_at = new Date().toISOString();

  // Update rule
  const updatedRule = await pb.collection('automation_rules').update(id, updateData);

  logger.info(`Automation rule updated: ${id}`);

  res.json({
    success: true,
    rule: {
      id: updatedRule.id,
      name: updatedRule.name,
      description: updatedRule.description,
      trigger_integration: updatedRule.trigger_integration,
      trigger_event: updatedRule.trigger_event,
      conditions: JSON.parse(updatedRule.conditions),
      actions: JSON.parse(updatedRule.actions),
      is_active: updatedRule.is_active,
      execution_count: updatedRule.execution_count,
      updated_at: updatedRule.updated_at,
    },
  });
});

// DELETE /automation-rules/:id - Delete automation rule
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: id',
    });
  }

  // Get rule before deletion
  const rule = await pb.collection('automation_rules').getOne(id);

  if (!rule) {
    return res.status(404).json({
      success: false,
      error: 'Automation rule not found',
    });
  }

  // Delete rule
  await pb.collection('automation_rules').delete(id);

  logger.info(`Automation rule deleted: ${id}`);

  res.json({
    success: true,
    message: 'Automation rule deleted successfully',
  });
});

// POST /automation-rules/:id/execute - Manually execute automation rule
router.post('/:id/execute', async (req, res) => {
  const { id } = req.params;
  const { trigger_data } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: id',
    });
  }

  // Get rule
  const rule = await pb.collection('automation_rules').getOne(id);

  if (!rule) {
    return res.status(404).json({
      success: false,
      error: 'Automation rule not found',
    });
  }

  if (!rule.is_active) {
    return res.status(400).json({
      success: false,
      error: 'Automation rule is not active',
    });
  }

  // Parse actions
  const actions = JSON.parse(rule.actions || '[]');

  // Execute actions
  const results = await executeActions(actions, trigger_data || {});

  // Increment execution count and update last_executed
  const executionCount = (rule.execution_count || 0) + 1;
  await pb.collection('automation_rules').update(id, {
    execution_count: executionCount,
    last_executed: new Date().toISOString(),
  });

  logger.info(`Automation rule executed: ${id} - ${results.length} actions`);

  res.json({
    success: true,
    message: 'Automation rule executed successfully',
    execution_count: executionCount,
    results,
  });
});

export default router;