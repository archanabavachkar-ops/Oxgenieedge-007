/**
 * Telephony configuration.
 * Defines providers, recording settings, transcription, IVR, and routing configuration.
 */

export const telephonyConfig = {
  // Provider configuration
  providers: {
    exotel: {
      enabled: process.env.EXOTEL_ENABLED === 'true',
      apiKey: process.env.EXOTEL_API_KEY || '',
      apiToken: process.env.EXOTEL_API_TOKEN || '',
      sid: process.env.EXOTEL_SID || '',
      phoneNumber: process.env.VIRTUAL_NUMBER || '',
    },
    twilio: {
      enabled: process.env.TWILIO_ENABLED === 'true',
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
  },

  // Active provider
  activeProvider: process.env.TELEPHONY_PROVIDER || 'exotel',

  // Recording configuration
  recording: {
    enabled: true,
    encryption: {
      algorithm: 'aes-256-cbc',
      keyLength: 32, // bytes
      key: process.env.RECORDING_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
    },
    storage: {
      type: 'local', // 'local', 's3', 'gcs'
      path: './recordings',
    },
    retention: {
      days: 90,
      deleteAfterDays: true,
    },
  },

  // Transcription configuration
  transcription: {
    enabled: true,
    service: 'google', // 'google', 'aws', 'azure'
    language: 'en-IN',
    apiKey: process.env.GOOGLE_SPEECH_API_KEY || '',
  },

  // IVR configuration
  ivr: {
    timeout: 5000, // milliseconds
    maxRetries: 3,
    defaultLanguage: 'en-IN',
  },

  // Call routing configuration
  routing: {
    strategy: 'skill-based', // 'skill-based', 'round-robin', 'least-busy'
    maxCallsPerAgent: 5,
    queueTimeout: 600, // seconds
    priorityLevels: ['high', 'normal', 'low'],
  },

  // Webhook configuration
  webhooks: {
    secret: process.env.WEBHOOK_SECRET || '',
    callStatus: `${process.env.API_BASE_URL}/hcgi/api/telephony/call-status`,
    recording: `${process.env.API_BASE_URL}/hcgi/api/telephony/recording`,
    dtmf: `${process.env.API_BASE_URL}/hcgi/api/telephony/dtmf`,
  },
};

export default telephonyConfig;