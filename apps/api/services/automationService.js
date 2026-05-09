import pb from '../config/pocketbase.js';
import logger from '../utils/logger.js';
import eventBus from './eventBus.js';

class AutomationService {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    eventBus.on('message.received', async (data) => {
      await this.runAutomation('message_received', data);
    });

    eventBus.on('escalation.triggered', async (data) => {
      await this.runAutomation('escalation_triggered', data);
    });

    eventBus.on('escalation.created', async (data) => {
      await this.runAutomation('escalation_created', data);
    });
  }

  async runAutomation(trigger, payload) {
    try {
      logger.info('Running automation', { trigger });

      switch (trigger) {
        case 'message_received':
          await this.handleMessageReceived(payload);
          break;
        case 'escalation_triggered':
          await this.handleEscalationTriggered(payload);
          break;
        case 'escalation_created':
          await this.handleEscalationCreated(payload);
          break;
        default:
          logger.warn('No automation handler found', { trigger });
      }
    } catch (error) {
      logger.error('Automation error', error);
    }
  }

  async handleMessageReceived(data) {
    try {
      await pb.collection('automation_triggers').create({
        trigger_type: 'message_received',
        conversation_id: data.conversationId,
        intent: data.intent,
        confidence: data.confidence,
        status: 'completed',
      });

      logger.info('Message automation completed', {
        conversationId: data.conversationId,
      });
    } catch (error) {
      logger.error('Message automation failed', error);
    }
  }

  async handleEscalationTriggered(data) {
    logger.info('Escalation automation triggered', data);

    // 🔥 Example future logic:
    // assign agent / send notification / create task
  }

  async handleEscalationCreated(data) {
    logger.info('Escalation created automation', {
      escalationId: data.id,
    });

    // 🔥 Example future logic:
    // notify agent / update CRM stage
  }

  async getAutomations() {
    try {
      return await pb.collection('automation_rules').getFullList();
    } catch (error) {
      logger.error('Get automations error', error);
      return [];
    }
  }

  async createAutomation(data) {
    try {
      const automation = await pb.collection('automation_rules').create({
        intent: data.intent,
        workflow_type: data.workflow_type,
        action: data.action,
        enabled: true,
      });

      logger.info('Automation created', {
        automationId: automation.id,
      });

      return automation;
    } catch (error) {
      logger.error('Create automation error', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const triggers = await pb.collection('automation_triggers').getFullList();

      return {
        total: triggers.length,
        completed: triggers.filter(t => t.status === 'completed').length,
        failed: triggers.filter(t => t.status === 'failed').length,
      };
    } catch (error) {
      logger.error('Get automation stats error', error);
      return {};
    }
  }
}

const automationService = new AutomationService();

export default automationService;