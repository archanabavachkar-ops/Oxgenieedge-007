const DEFAULT_INTENTS = {
  pricing: {
    keywords: ['price', 'cost', 'how much', 'pricing', 'fee', 'subscription', 'plan', 'expensive', 'cheap'],
    response: "Our pricing plans start at $29/month for the basic tier. Would you like me to send you a link to our full pricing page?"
  },
  demo: {
    keywords: ['demo', 'show me', 'see it in action', 'tour', 'walkthrough', 'book a call', 'schedule'],
    response: "I'd be happy to help you schedule a demo! You can book a time with our product team directly on our calendar page."
  },
  support: {
    keywords: ['help', 'broken', 'issue', 'bug', 'not working', 'support', 'error', 'fail', 'stuck'],
    response: "I'm sorry you're experiencing issues. I can connect you with our support team, or you can check our help center for quick solutions."
  }
};

export function detectIntent(text, customTemplates = []) {
  if (!text || typeof text !== 'string') {
    return { intent: 'unknown', confidence: 0 };
  }

  const normalizedText = text.toLowerCase();
  let bestMatch = { intent: 'unknown', confidence: 0 };

  // Combine default intents with custom templates
  const allIntents = { ...DEFAULT_INTENTS };
  
  customTemplates.forEach(template => {
    if (template.intent && template.keywords) {
      allIntents[template.intent] = {
        keywords: Array.isArray(template.keywords) ? template.keywords : [],
        response: template.response
      };
    }
  });

  for (const [intentName, data] of Object.entries(allIntents)) {
    const keywords = data.keywords || [];
    if (keywords.length === 0) continue;

    let matchCount = 0;
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // Simple confidence calculation based on matched keywords vs total words in input
    const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
    const wordCount = Math.max(words.length, 1);
    
    // Boost confidence if multiple keywords match, but cap at 0.95
    let confidence = Math.min((matchCount / Math.min(keywords.length, 3)) * 0.6 + (matchCount > 0 ? 0.3 : 0), 0.95);

    if (confidence > bestMatch.confidence) {
      bestMatch = { intent: intentName, confidence };
    }
  }

  // Threshold for unknown
  if (bestMatch.confidence < 0.3) {
    return { intent: 'unknown', confidence: bestMatch.confidence };
  }

  return bestMatch;
}

export function getDefaultResponse(intent, customTemplates = []) {
  // Check custom templates first
  const customMatch = customTemplates.find(t => t.intent === intent);
  if (customMatch && customMatch.response) {
    return customMatch.response;
  }

  // Fallback to defaults
  if (DEFAULT_INTENTS[intent]) {
    return DEFAULT_INTENTS[intent].response;
  }

  return "I'm not quite sure I understand. Could you rephrase that, or would you like me to connect you with a human agent?";
}