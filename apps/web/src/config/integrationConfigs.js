export const integrationConfigs = {
  whatsapp: {
    name: 'WhatsApp Business',
    slug: 'whatsapp',
    icon: 'MessageCircle',
    category: 'Communication',
    description: 'Connect your WhatsApp Business account for customer messaging and support.',
    setupFields: [],
    configurationOptions: { autoReply: true, syncTemplates: true },
    helpContent: {
      steps: ['Connect your Meta account.', 'Select your WhatsApp Business Account (WABA).', 'Verify your phone number.', 'Sync your message templates.'],
      troubleshooting: ['If templates fail to sync, check your Meta App permissions.', 'Ensure your WABA is verified in Meta Business Manager.'],
      faq: ['Can I use a personal WhatsApp number? No, a Business API account is required.']
    }
  },
  'google-ads': {
    name: 'Google Ads',
    slug: 'google-ads',
    icon: 'Target',
    category: 'Marketing',
    description: 'Manage and track your Google Ads campaigns directly from your CRM.',
    setupFields: [],
    configurationOptions: { trackConversions: true, costPerLead: true },
    helpContent: {
      steps: ['Login with your Google account.', 'Select your Ads Manager account.', 'Map campaigns to CRM pipelines.'],
      troubleshooting: ['Check if your Google account has Admin access to the Ads account.'],
      faq: ['How often does data sync? Campaign data syncs hourly.']
    }
  },
  'facebook-leads': {
    name: 'Facebook Lead Ads',
    slug: 'facebook-leads',
    icon: 'Facebook',
    category: 'Marketing',
    description: 'Automatically capture leads from Facebook Lead Ads campaigns.',
    setupFields: [],
    configurationOptions: { autoAssign: true, duplicateDetection: true },
    helpContent: {
      steps: ['Connect your Meta account.', 'Select the Facebook Page.', 'Choose the Lead Generation form.', 'Map form fields to CRM properties.'],
      troubleshooting: ['If leads are missing, verify the CRM Webhook is active in Facebook Page settings.'],
      faq: ['Are custom fields supported? Yes, you can map them in the configuration panel.']
    }
  },
  email: {
    name: 'Email (SMTP/Gmail)',
    slug: 'email',
    icon: 'Mail',
    category: 'Communication',
    description: 'Send emails directly from your CRM using SMTP or Gmail integration.',
    setupFields: [{ name: 'host', type: 'text' }, { name: 'port', type: 'number' }, { name: 'user', type: 'text' }, { name: 'pass', type: 'password' }],
    configurationOptions: { tracking: true, bulkSending: false },
    helpContent: {
      steps: ['Choose SMTP or Gmail OAuth.', 'Enter credentials or authenticate.', 'Test connection.', 'Configure tracking options.'],
      troubleshooting: ['For SMTP, ensure port 465 or 587 is open.', 'For Gmail, ensure the app is verified or use an App Password.'],
      faq: ['Is bulk sending supported? Yes, up to your provider\'s limits.']
    }
  },
  webhook: {
    name: 'Website Webhooks',
    slug: 'webhook',
    icon: 'Webhook',
    category: 'Automation',
    description: 'Receive real-time notifications from your website events and triggers.',
    setupFields: [],
    configurationOptions: { retryFailed: true, maxRetries: 3 },
    helpContent: {
      steps: ['Generate a unique Webhook URL.', 'Configure events in your external application.', 'Map payload fields to CRM records.'],
      troubleshooting: ['Ensure your payload is valid JSON.', 'Check the logs for 400 Bad Request errors.'],
      faq: ['What is the expected format? We accept standard JSON key-value pairs.']
    }
  },
  stripe: {
    name: 'Stripe Payments',
    slug: 'stripe',
    icon: 'CreditCard',
    category: 'Payments',
    description: 'Secure credit card processing and subscription management via Stripe.',
    setupFields: [{ name: 'publishableKey', type: 'text' }, { name: 'secretKey', type: 'password' }],
    configurationOptions: { autoCreateRecords: true, updateDealStage: true },
    helpContent: {
      steps: ['Connect via Stripe OAuth or enter API keys manually.', 'Configure payment tracking.', 'Set up failed payment handling.'],
      troubleshooting: ['Ensure you are using live keys, not test keys, for production.'],
      faq: ['Does this support subscriptions? Yes, recurring billing is supported.']
    }
  },
  razorpay: {
    name: 'Razorpay Integration',
    slug: 'razorpay',
    icon: 'Wallet',
    category: 'Payments',
    description: 'Seamless payment gateway integration optimized for the Indian market.',
    setupFields: [{ name: 'keyId', type: 'text' }, { name: 'keySecret', type: 'password' }],
    configurationOptions: { upi: true, netbanking: true },
    helpContent: {
      steps: ['Enter your Razorpay Key ID and Secret.', 'Select supported payment methods.', 'Configure auto-invoicing.'],
      troubleshooting: ['Verify webhook signatures if payment statuses are not updating.'],
      faq: ['Can I generate payment links? Yes, directly from the configuration panel.']
    }
  },
  'analytics-dashboard': {
    name: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    icon: 'BarChart3',
    category: 'Analytics',
    description: 'Comprehensive data visualization and reporting for your business metrics.',
    setupFields: [],
    configurationOptions: { trackFunnels: true },
    helpContent: {
      steps: ['Enable the analytics module.', 'Configure funnel stages.', 'Set up conversion tracking.'],
      troubleshooting: ['If data is empty, ensure leads are moving through the pipeline.'],
      faq: ['Is real-time tracking available? Data is aggregated every 15 minutes.']
    }
  },
  'online-store': {
    name: 'Online Store',
    slug: 'online-store',
    icon: 'ShoppingCart',
    category: 'E-commerce',
    description: 'Complete e-commerce solution with product management and cart functionality.',
    setupFields: [],
    configurationOptions: { inventoryTracking: true, guestCheckout: false },
    helpContent: {
      steps: ['Enable the store module.', 'Add products to your catalog.', 'Configure checkout and shipping.'],
      troubleshooting: ['Check payment integration if checkout fails.'],
      faq: ['Can I use coupons? Yes, enable coupon codes in settings.']
    }
  },
  'oauth2-social': {
    name: 'OAuth2 Social Login',
    slug: 'oauth2-social',
    icon: 'Key',
    category: 'Security',
    description: 'Allow users to sign in using their existing social media accounts.',
    setupFields: [],
    configurationOptions: { autoRefresh: true, autoCreateContacts: true },
    helpContent: {
      steps: ['Select social providers.', 'Enter Client IDs and Secrets.', 'Add Redirect URIs to provider consoles.'],
      troubleshooting: ['Ensure redirect URIs exactly match your domain.'],
      faq: ['Which providers are supported? Google, GitHub, Apple, Facebook, Discord, and LinkedIn.']
    }
  }
};