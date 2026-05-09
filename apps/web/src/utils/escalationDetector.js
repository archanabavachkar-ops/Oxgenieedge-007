const FRUSTRATION_KEYWORDS = [
  'not helpful', 'talk to human', 'agent', 'support', 'frustrated', 
  'angry', 'useless', 'waste', 'stupid', 'bad', 'terrible', 'awful', 
  'help me', 'please help', 'urgent', 'asap'
];

export function detectEscalationTrigger(text, intent, confidence, messageHistory = []) {
  const normalizedText = text.toLowerCase();
  const triggers = [];
  let severity = 0;

  // 1. Check for unknown intent
  if (intent === 'unknown' && confidence < 0.3) {
    triggers.push('unknown_intent');
    severity += 1;
  }

  // 2. Check for low confidence on known intents
  if (intent !== 'unknown' && confidence < 0.5) {
    triggers.push('low_confidence');
    severity += 1;
  }

  // 3. Check for frustration keywords
  const matchedKeywords = FRUSTRATION_KEYWORDS.filter(kw => normalizedText.includes(kw));
  if (matchedKeywords.length > 0) {
    triggers.push('frustration_keywords');
    severity += 2;
  }

  // 4. Check for unresolved message patterns (e.g., 3+ messages in the last 5 minutes without resolution)
  if (messageHistory.length >= 3) {
    const recentUserMessages = messageHistory.filter(m => m.direction === 'inbound' || m.sender === 'user');
    if (recentUserMessages.length >= 3) {
      triggers.push('repeated_failures');
      severity += 1;
    }
  }

  return {
    shouldEscalate: triggers.length > 0,
    triggers,
    severity,
    reason: getEscalationReason(triggers)
  };
}

export function getEscalationReason(triggers) {
  if (triggers.includes('frustration_keywords')) {
    return 'Customer expressed frustration or requested human agent.';
  }
  if (triggers.includes('repeated_failures')) {
    return 'Customer sent multiple messages without apparent resolution.';
  }
  if (triggers.includes('unknown_intent')) {
    return 'Bot could not understand the customer request repeatedly.';
  }
  if (triggers.includes('low_confidence')) {
    return 'Bot had low confidence in its responses.';
  }
  return 'System triggered escalation rules.';
}