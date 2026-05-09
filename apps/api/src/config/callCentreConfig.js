module.exports = {
  // Twilio/Exotel API credentials
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'placeholder_account_sid',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'placeholder_auth_token',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
  },

  exotel: {
    apiKey: process.env.EXOTEL_API_KEY || 'placeholder_api_key',
    apiToken: process.env.EXOTEL_API_TOKEN || 'placeholder_api_token',
    sid: process.env.EXOTEL_SID || 'placeholder_sid',
  },

  // Call recording settings
  recording: {
    enabled: true,
    encryptionEnabled: true,
    storagePath: '/recordings',
    maxDuration: 3600, // 1 hour in seconds
    format: 'wav',
  },

  // Transcription service settings
  transcription: {
    provider: 'google', // 'google', 'aws', 'azure'
    apiKey: process.env.TRANSCRIPTION_API_KEY || 'placeholder_api_key',
    language: 'en-US',
    enabled: true,
  },

  // AI service settings
  ai: {
    provider: 'openai', // 'openai', 'google', 'anthropic'
    apiKey: process.env.AI_API_KEY || 'placeholder_api_key',
    model: 'gpt-3.5-turbo',
    enabled: true,
  },

  // Credit limits per user type
  creditLimits: {
    free: {
      sms_monthly: 100,
      calls_monthly: 50,
      whatsapp_monthly: 50,
      email_monthly: 500,
    },
    starter: {
      sms_monthly: 1000,
      calls_monthly: 500,
      whatsapp_monthly: 500,
      email_monthly: 5000,
    },
    professional: {
      sms_monthly: 10000,
      calls_monthly: 5000,
      whatsapp_monthly: 5000,
      email_monthly: 50000,
    },
    enterprise: {
      sms_monthly: 100000,
      calls_monthly: 50000,
      whatsapp_monthly: 50000,
      email_monthly: 500000,
    },
  },

  // SLA timers (in seconds)
  sla: {
    first_response_time_seconds: 300, // 5 minutes
    resolution_time_seconds: 3600, // 1 hour
    escalation_time_seconds: 1800, // 30 minutes
  },

  // Queue settings
  queue: {
    max_queue_size: 100,
    timeout_seconds: 600, // 10 minutes
    priority_levels: ['high', 'normal', 'low'],
  },

  // Agent settings
  agent: {
    max_concurrent_calls: 5,
    max_concurrent_chats: 10,
    break_duration_minutes: 15,
    shift_duration_hours: 8,
  },

  // Notification settings
  notifications: {
    enabled: true,
    channels: ['email', 'sms', 'push'],
    escalation_enabled: true,
  },
};