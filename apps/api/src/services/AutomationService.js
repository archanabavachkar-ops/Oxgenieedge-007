
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

export class AutomationService {
  static async executeActions(actions, leadId, leadData) {
    const executedActions = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'assign_lead':
            await pb.collection('leads').update(leadId, { assignedTo: action.value });
            executedActions.push({ type: 'assign_lead', status: 'success', value: action.value });
            break;
          case 'send_email':
            await pb.collection('email_notifications').create({
              leadId,
              subject: action.subject || 'Automated Email',
              body: action.body || '',
              status: 'sent',
            });
            executedActions.push({ type: 'send_email', status: 'success' });
            break;
          case 'update_status':
            await pb.collection('leads').update(leadId, { status: action.value });
            executedActions.push({ type: 'update_status', status: 'success', value: action.value });
            break;
          default:
            executedActions.push({ type: action.type, status: 'skipped', reason: 'Unknown action type' });
        }
      } catch (error) {
        logger.error(`Error executing action ${action.type}: ${error.message}`);
        executedActions.push({ type: action.type, status: 'failed', error: error.message });
      }
    }
    return executedActions;
  }

  static async triggerAutomation(trigger, leadId, data = {}) {
    const lead = await pb.collection('leads').getOne(leadId);
    
    const automations = await pb.collection('automations').getFullList({
      filter: `trigger = "${trigger}" && status = "Active"`,
    });

    let executedActions = [];
    for (const automation of automations) {
      const actions = typeof automation.action === 'string' ? JSON.parse(automation.action) : automation.action;
      if (actions && actions.length > 0) {
        const actionResults = await this.executeActions(actions, leadId, lead);
        executedActions = executedActions.concat(actionResults);
      }
    }

    logger.info(`Automation triggered: ${trigger} for lead ${leadId}`);
    return executedActions;
  }
}
