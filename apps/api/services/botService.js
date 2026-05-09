import pb from '../config/pocketbase.js';
import logger from '../utils/logger.js';
import eventBus from './eventBus.js';

class BotService {
  async detectIntent(message) {
    const keywords = {
      pricing: ['price', 'cost', 'pricing', 'how much', 'fee', 'plan'],
      demo: ['demo', 'trial', 'test', 'show me', 'see it', 'try'],
      support: ['help', 'issue', 'problem', 'error', 'bug', 'support'],
      general: ['hello', 'hi', 'hey', 'what', 'how', 'tell me'],
    };

    let detectedIntent = 'general';
    let confidence = 0;

    for (const [intent, words] of Object.entries(keywords)) {
      const score = words.reduce((acc, word) => {
        return acc + (message.toLowerCase().includes(word) ? 1 : 0);
      }, 0);

      const intentConfidence = score / words.length;

      if (intentConfidence > confidence) {
        detectedIntent = intent;
        confidence = intentConfidence;
      }
    }

    let confidenceLevel = 'low';
    if (confidence >= 0.7) confidenceLevel = 'high';
    else if (confidence >= 0.4) confidenceLevel = 'medium';

    logger.info('Intent detected', {
      intent: detectedIntent,
      confidence: parseFloat(confidence.toFixed(2)),
      level: confidenceLevel,
    });

    return {
      intent: detectedIntent,
      confidence: parseFloat(confidence.toFixed(2)),
      confidenceLevel,
      timestamp: new Date().toISOString(),
    };
  }

  async generateResponse(message, intent, conversationId, confidence) {
    try {
      // Emit event for automation
      eventBus.emit('message.received', {
        message,
        conversationId,
        intent,
        confidence,
      });

      // Escalation logic
      if (confidence < 0.4) {
        logger.warn('Low confidence - escalating', { conversationId, confidence });

        eventBus.emit('escalation.triggered', {
          conversationId,
          reason: 'Low bot confidence',
          priority: 'medium',
        });

        return {
          response: "I'm not sure about that. Let me connect you with a specialist.",
          intent,
          confidence,
          shouldEscalate: true,
        };
      }

      // Fetch template
      const template = await pb
        .collection('bot_templates')
        .getFirstListItem(`intent="${intent}"`)
        .catch(() => null);

      if (!template) {
        return {
          response: 'I understand. Let me connect you with an agent.',
          intent,
          confidence,
          shouldEscalate: true,
        };
      }

      const response = template.response_template
        .replace('{user_name}', 'there')
        .replace('{time}', new Date().toLocaleTimeString());

      // Save message
      if (conversationId) {
        await pb.collection('messages').create({
          conversation_id: conversationId,
          sender_type: 'bot',
          content: response,
          intent_detected: intent,
          confidence_score: confidence,
        });
      }

      logger.info('Bot response generated', { conversationId, intent, confidence });

      return {
        response,
        intent,
        confidence,
        shouldEscalate: false,
      };
    } catch (error) {
      logger.error('Response generation error', error);
      throw error;
    }
  }

  async getTemplates() {
    try {
      return await pb.collection('bot_templates').getFullList();
    } catch (error) {
      logger.error('Get templates error', error);
      return [];
    }
  }

  async createTemplate(data) {
    try {
      const template = await pb.collection('bot_templates').create({
        intent: data.intent,
        response_template: data.response_template,
        keywords: data.keywords || [],
        enabled: true,
      });

      logger.info('Bot template created', { templateId: template.id });
      return template;
    } catch (error) {
      logger.error('Create template error', error);
      throw error;
    }
  }

  async updateTemplate(templateId, data) {
    try {
      const template = await pb.collection('bot_templates').update(templateId, data);
      logger.info('Bot template updated', { templateId });
      return template;
    } catch (error) {
      logger.error('Update template error', error);
      throw error;
    }
  }

  async deleteTemplate(templateId) {
    try {
      await pb.collection('bot_templates').delete(templateId);
      logger.info('Bot template deleted', { templateId });
      return { success: true };
    } catch (error) {
      logger.error('Delete template error', error);
      throw error;
    }
  }
}

export default new BotService();