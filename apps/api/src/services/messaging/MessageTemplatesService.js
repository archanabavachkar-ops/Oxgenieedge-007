import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Message Templates Service
 * Manages message templates for different channels
 */
export class MessageTemplatesService {
  /**
   * Create message template
   */
  async createTemplate(name, channel, content, variables = []) {
    if (!name || !channel || !content) {
      throw new Error('Name, channel, and content are required');
    }

    try {
      const template = await pb.collection('message_templates').create({
        name,
        channel,
        content,
        variables: JSON.stringify(variables),
        created_at: new Date().toISOString(),
      });

      logger.info(`Template created: ${template.id} - ${name}`);

      return {
        templateId: template.id,
        name: template.name,
        channel: template.channel,
        content: template.content,
        variables: JSON.parse(template.variables),
      };
    } catch (error) {
      logger.error(`Failed to create template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get templates for a channel
   */
  async getTemplates(channel) {
    if (!channel) {
      throw new Error('Channel is required');
    }

    try {
      const templates = await pb.collection('message_templates').getFullList({
        filter: `channel = "${channel}"`,
        sort: '-created_at',
      });

      logger.info(`Templates retrieved for channel ${channel}: ${templates.length}`);

      return templates.map((t) => ({
        templateId: t.id,
        name: t.name,
        channel: t.channel,
        content: t.content,
        variables: JSON.parse(t.variables || '[]'),
        createdAt: t.created_at,
      }));
    } catch (error) {
      logger.error(`Failed to get templates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get single template
   */
  async getTemplate(templateId) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    try {
      const template = await pb.collection('message_templates').getOne(templateId);

      if (!template) {
        throw new Error('Template not found');
      }

      logger.info(`Template retrieved: ${templateId}`);

      return {
        templateId: template.id,
        name: template.name,
        channel: template.channel,
        content: template.content,
        variables: JSON.parse(template.variables || '[]'),
        createdAt: template.created_at,
      };
    } catch (error) {
      logger.error(`Failed to get template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, name, content, variables = []) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    try {
      const template = await pb.collection('message_templates').getOne(templateId);

      if (!template) {
        throw new Error('Template not found');
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (content) updateData.content = content;
      if (variables) updateData.variables = JSON.stringify(variables);
      updateData.updated_at = new Date().toISOString();

      const updatedTemplate = await pb.collection('message_templates').update(templateId, updateData);

      logger.info(`Template updated: ${templateId}`);

      return {
        templateId: updatedTemplate.id,
        name: updatedTemplate.name,
        channel: updatedTemplate.channel,
        content: updatedTemplate.content,
        variables: JSON.parse(updatedTemplate.variables || '[]'),
      };
    } catch (error) {
      logger.error(`Failed to update template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    try {
      const template = await pb.collection('message_templates').getOne(templateId);

      if (!template) {
        throw new Error('Template not found');
      }

      await pb.collection('message_templates').delete(templateId);

      logger.info(`Template deleted: ${templateId}`);

      return {
        success: true,
        templateId,
      };
    } catch (error) {
      logger.error(`Failed to delete template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(content, variables = {}) {
    if (!content) {
      throw new Error('Content is required');
    }

    try {
      let rendered = content;

      // Replace {{variableName}} with values
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, variables[key]);
      });

      logger.info('Template rendered successfully');

      return rendered;
    } catch (error) {
      logger.error(`Failed to render template: ${error.message}`);
      throw error;
    }
  }
}

export default new MessageTemplatesService();