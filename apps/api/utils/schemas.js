import Joi from 'joi';

export const schemas = {};

export const botSchema = Joi.object({
  message: Joi.string().required(),
  conversationId: Joi.string().optional()
});

export const detectIntentSchema = Joi.object({
  message: Joi.string().required()
});

export const createTemplateSchema = Joi.object({
  intent: Joi.string().required(),
  response_template: Joi.string().required(),
  keywords: Joi.array().items(Joi.string()).optional()
});

export const escalateSchema = Joi.object({
  conversationId: Joi.string().required(),
  reason: Joi.string().required(),
  priority: Joi.string().optional()
});

export const createAutomationSchema = Joi.object({
  intent: Joi.string().required(),
  workflow_type: Joi.string().required(),
  action: Joi.string().required()
});