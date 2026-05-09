import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Template Service
 * Manages message templates for different channels and categories
 */
export class TemplateService {
  /**
   * Get all templates for an organization with optional filters
   * @param {string} organizationId - Organization ID
   * @param {Object} filters - Optional filters {channel, category, is_active}
   * @returns {Promise<Array>} Array of templates
   */
  async getTemplates(organizationId, filters = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    let filter = `organization_id = "${organizationId}"`;

    if (filters.channel) {
      filter += ` && channel = "${filters.channel}"`;
    }

    if (filters.category) {
      filter += ` && category = "${filters.category}"`;
    }

    if (filters.is_active !== undefined) {
      filter += ` && is_active = ${filters.is_active}`;
    }

    const templates = await pb.collection('message_templates').getFullList({
      filter,
      sort: '-created',
    });

    logger.info(`Templates retrieved for organization ${organizationId}: ${templates.length}`);

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      channel: t.channel,
      category: t.category,
      content: t.content,
      variables: t.variables ? JSON.parse(t.variables) : [],
      is_active: t.is_active,
      created_by: t.created_by,
      created: t.created,
      updated: t.updated,
    }));
  }

  /**
   * Get a single template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template object
   */
  async getTemplate(templateId) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const template = await pb.collection('message_templates').getOne(templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    logger.info(`Template retrieved: ${templateId}`);

    return {
      id: template.id,
      name: template.name,
      channel: template.channel,
      category: template.category,
      content: template.content,
      variables: template.variables ? JSON.parse(template.variables) : [],
      is_active: template.is_active,
      created_by: template.created_by,
      created: template.created,
      updated: template.updated,
    };
  }

  /**
   * Create a new template
   * @param {string} organizationId - Organization ID
   * @param {Object} data - Template data {name, channel, content, category, variables, is_active, created_by}
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(organizationId, data) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      throw new Error('Template name is required and must be a non-empty string');
    }

    if (!data.channel || typeof data.channel !== 'string' || data.channel.trim() === '') {
      throw new Error('Channel is required and must be a non-empty string');
    }

    if (!data.content || typeof data.content !== 'string' || data.content.trim() === '') {
      throw new Error('Content is required and must be a non-empty string');
    }

    const template = await pb.collection('message_templates').create({
      organization_id: organizationId,
      name: data.name.trim(),
      channel: data.channel.trim(),
      category: data.category ? data.category.trim() : '',
      content: data.content.trim(),
      variables: data.variables ? JSON.stringify(data.variables) : '[]',
      is_active: data.is_active !== false,
      created_by: data.created_by || 'system',
    });

    logger.info(`Template created: ${template.id} - ${data.name}`);

    return {
      id: template.id,
      name: template.name,
      channel: template.channel,
      category: template.category,
      content: template.content,
      variables: template.variables ? JSON.parse(template.variables) : [],
      is_active: template.is_active,
      created_by: template.created_by,
      created: template.created,
    };
  }

  /**
   * Update an existing template
   * @param {string} templateId - Template ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(templateId, data) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const template = await pb.collection('message_templates').getOne(templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    const updateData = {};

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim() === '') {
        throw new Error('Template name must be a non-empty string');
      }
      updateData.name = data.name.trim();
    }

    if (data.channel !== undefined) {
      if (typeof data.channel !== 'string' || data.channel.trim() === '') {
        throw new Error('Channel must be a non-empty string');
      }
      updateData.channel = data.channel.trim();
    }

    if (data.content !== undefined) {
      if (typeof data.content !== 'string' || data.content.trim() === '') {
        throw new Error('Content must be a non-empty string');
      }
      updateData.content = data.content.trim();
    }

    if (data.category !== undefined) {
      updateData.category = data.category ? data.category.trim() : '';
    }

    if (data.variables !== undefined) {
      updateData.variables = data.variables ? JSON.stringify(data.variables) : '[]';
    }

    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }

    updateData.updated = new Date().toISOString();

    const updated = await pb.collection('message_templates').update(templateId, updateData);

    logger.info(`Template updated: ${templateId}`);

    return {
      id: updated.id,
      name: updated.name,
      channel: updated.channel,
      category: updated.category,
      content: updated.content,
      variables: updated.variables ? JSON.parse(updated.variables) : [],
      is_active: updated.is_active,
      created_by: updated.created_by,
      created: updated.created,
      updated: updated.updated,
    };
  }

  /**
   * Delete a template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTemplate(templateId) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const template = await pb.collection('message_templates').getOne(templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    await pb.collection('message_templates').delete(templateId);

    logger.info(`Template deleted: ${templateId}`);

    return { success: true, message: 'Template deleted successfully' };
  }

  /**
   * Render template with variables
   * @param {string} templateId - Template ID
   * @param {Object} variables - Variables to replace in template
   * @returns {Promise<string>} Rendered content
   */
  async renderTemplate(templateId, variables = {}) {
    if (!templateId) {
      throw new Error('Template ID is required');
    }

    const template = await this.getTemplate(templateId);

    let rendered = template.content;

    // Replace {{variableName}} with values from variables object
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, variables[key] || '');
    });

    logger.info(`Template rendered: ${templateId}`);

    return rendered;
  }

  /**
   * Get templates by channel
   * @param {string} organizationId - Organization ID
   * @param {string} channel - Channel name
   * @returns {Promise<Array>} Templates for the channel
   */
  async getTemplatesByChannel(organizationId, channel) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!channel) {
      throw new Error('Channel is required');
    }

    return this.getTemplates(organizationId, { channel });
  }

  /**
   * Get templates by category
   * @param {string} organizationId - Organization ID
   * @param {string} category - Category name
   * @returns {Promise<Array>} Templates in the category
   */
  async getTemplatesByCategory(organizationId, category) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!category) {
      throw new Error('Category is required');
    }

    return this.getTemplates(organizationId, { category });
  }

  /**
   * Search templates by name or description
   * @param {string} organizationId - Organization ID
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching templates
   */
  async searchTemplates(organizationId, query) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new Error('Search query is required');
    }

    const filter = `organization_id = "${organizationId}" && (name ~ "${query}" || description ~ "${query}")`;

    const templates = await pb.collection('message_templates').getFullList({
      filter,
      sort: '-created',
    });

    logger.info(`Templates searched for organization ${organizationId}: ${templates.length} results`);

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      channel: t.channel,
      category: t.category,
      content: t.content,
      variables: t.variables ? JSON.parse(t.variables) : [],
      is_active: t.is_active,
      created_by: t.created_by,
      created: t.created,
    }));
  }
}

export default new TemplateService();