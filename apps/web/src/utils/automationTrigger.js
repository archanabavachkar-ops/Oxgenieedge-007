export const intentAutomations = {
  demo: {
    workflow_type: 'sales_bot',
    actions: ['create_lead', 'assign_sales_agent', 'send_email']
  },
  pricing: {
    workflow_type: 'sales_bot',
    actions: ['create_lead', 'create_task', 'send_sms']
  },
  support: {
    workflow_type: 'support_bot',
    actions: ['create_ticket', 'assign_support_agent', 'send_whatsapp']
  }
};

export function getAutomationForIntent(intent) {
  return intentAutomations[intent] || null;
}

export function shouldTriggerAutomation(intent, confidence) {
  const automation = getAutomationForIntent(intent);
  // Only trigger if we have an automation configured and confidence is decent
  return !!automation && confidence >= 0.5;
}

export function buildAutomationPayload(intent, text, userId, conversationId) {
  const automation = getAutomationForIntent(intent);
  if (!automation) return null;

  return {
    conversation_id: conversationId,
    user_id: userId,
    intent,
    workflow_type: automation.workflow_type,
    actions: automation.actions,
    status: 'pending',
    results: {}
  };
}