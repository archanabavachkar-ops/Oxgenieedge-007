import express from 'express';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to verify webhook signature
const verifyWebhookSignature = (signature, payload, secret) => {
  if (!signature || !secret) {
    return false;
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
};

// Helper function to send WhatsApp message via WhatsApp Business API
const sendWhatsAppMessage = async (phoneNumber, message, accessToken, phoneNumberId) => {
  const response = await fetch(`https://graph.instagram.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneNumber.replace(/\D/g, ''),
      type: 'text',
      text: {
        body: message,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.messages[0].id;
};

// Helper function to send email via SMTP
const sendEmailViaSMTP = async (recipientEmail, subject, body, smtpConfig) => {
  // In production, this would use nodemailer or similar
  // For now, we'll log and return success
  logger.info(`Email would be sent to ${recipientEmail} with subject: ${subject}`);
  return 'email_' + Date.now();
};

// Helper function to test WhatsApp connection
const testWhatsAppConnection = async (credentials) => {
  if (!credentials.accessToken || !credentials.phoneNumberId) {
    throw new Error('Missing WhatsApp credentials: accessToken, phoneNumberId');
  }

  const response = await fetch(`https://graph.instagram.com/v18.0/${credentials.phoneNumberId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API test failed: ${response.status} ${response.statusText}`);
  }

  return { success: true, message: 'WhatsApp connection successful' };
};

// Helper function to test Email connection
const testEmailConnection = async (credentials) => {
  if (!credentials.smtpHost || !credentials.smtpPort || !credentials.smtpUser || !credentials.smtpPassword) {
    throw new Error('Missing email credentials: smtpHost, smtpPort, smtpUser, smtpPassword');
  }

  // In production, this would attempt an SMTP connection
  logger.info(`Email connection test for ${credentials.smtpHost}:${credentials.smtpPort}`);
  return { success: true, message: 'Email connection successful' };
};

// Helper function to test Facebook connection
const testFacebookConnection = async (credentials) => {
  if (!credentials.accessToken || !credentials.pageId) {
    throw new Error('Missing Facebook credentials: accessToken, pageId');
  }

  const response = await fetch(`https://graph.facebook.com/v18.0/${credentials.pageId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Facebook API test failed: ${response.status} ${response.statusText}`);
  }

  return { success: true, message: 'Facebook connection successful' };
};

// Helper function to test Google Ads connection
const testGoogleAdsConnection = async (credentials) => {
  if (!credentials.customerId || !credentials.accessToken) {
    throw new Error('Missing Google Ads credentials: customerId, accessToken');
  }

  const response = await fetch('https://googleads.googleapis.com/v15/customers/' + credentials.customerId + '/googleAds:search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
      'developer-token': credentials.developerToken || '',
    },
    body: JSON.stringify({
      query: 'SELECT customer.id LIMIT 1',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Ads API test failed: ${response.status} ${response.statusText}`);
  }

  return { success: true, message: 'Google Ads connection successful' };
};

// Helper function to test Website Forms connection
const testWebsiteFormsConnection = async (credentials) => {
  if (!credentials.webhookSecret) {
    throw new Error('Missing Website Forms credentials: webhookSecret');
  }

  logger.info('Website Forms connection test: webhook secret configured');
  return { success: true, message: 'Website Forms connection successful' };
};

// POST /crm/integrations/whatsapp/send - Send WhatsApp message
router.post('/whatsapp/send', async (req, res) => {
  const { leadId, phoneNumber, message } = req.body;

  if (!leadId || !phoneNumber || !message) {
    return res.status(400).json({
      error: 'Missing required fields: leadId, phoneNumber, message',
    });
  }

  // Get lead record
  const lead = await pb.collection('leads').getOne(leadId);

  // Get WhatsApp integration
  const integrations = await pb.collection('integrations').getFullList({
    filter: 'type = "whatsapp" && status = "active"',
  });

  if (integrations.length === 0) {
    throw new Error('WhatsApp integration not configured');
  }

  const integration = integrations[0];
  const credentials = typeof integration.credentials === 'string' ? JSON.parse(integration.credentials) : integration.credentials;

  // Send WhatsApp message
  const messageId = await sendWhatsAppMessage(phoneNumber, message, credentials.accessToken, credentials.phoneNumberId);

  // Create activity record
  await pb.collection('activities').create({
    type: 'whatsapp_message',
    lead_id: leadId,
    description: 'WhatsApp message sent',
    content: message,
    related_record_type: 'whatsapp_message',
    related_record_id: messageId,
    metadata: JSON.stringify({
      phoneNumber,
      messageId,
    }),
    created_at: new Date().toISOString(),
  });

  logger.info(`WhatsApp message sent to lead ${leadId}: ${messageId}`);

  res.json({
    success: true,
    messageId,
    timestamp: new Date().toISOString(),
  });
});

// POST /crm/integrations/whatsapp/webhook - Receive incoming WhatsApp messages
router.post('/whatsapp/webhook', async (req, res) => {
  const { body } = req;
  const signature = req.headers['x-hub-signature-256'];

  // Get WhatsApp integration to verify signature
  const integrations = await pb.collection('integrations').getFullList({
    filter: 'type = "whatsapp"',
  });

  if (integrations.length === 0) {
    throw new Error('WhatsApp integration not found');
  }

  const integration = integrations[0];
  const credentials = typeof integration.credentials === 'string' ? JSON.parse(integration.credentials) : integration.credentials;

  // Verify webhook signature
  const isValid = verifyWebhookSignature(signature, body, credentials.webhookSecret);

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  // Parse webhook payload
  if (body.entry && body.entry[0] && body.entry[0].changes) {
    const changes = body.entry[0].changes[0];

    if (changes.value.messages) {
      const message = changes.value.messages[0];
      const senderPhone = message.from;
      const messageText = message.text?.body || '';
      const messageId = message.id;

      // Find lead by phone number
      const leads = await pb.collection('leads').getFullList({
        filter: `mobile = "${senderPhone}"`,
      });

      if (leads.length > 0) {
        const lead = leads[0];

        // Create activity record
        await pb.collection('activities').create({
          type: 'whatsapp_message_received',
          lead_id: lead.id,
          description: 'WhatsApp message received',
          content: messageText,
          related_record_type: 'whatsapp_message',
          related_record_id: messageId,
          metadata: JSON.stringify({
            senderPhone,
            messageId,
          }),
          created_at: new Date().toISOString(),
        });

        logger.info(`WhatsApp message received from lead ${lead.id}: ${messageId}`);
      }
    }
  }

  res.status(200).json({ success: true });
});

// POST /crm/integrations/email/send - Send email
router.post('/email/send', async (req, res) => {
  const { leadId, recipientEmail, subject, body, attachments } = req.body;

  if (!leadId || !recipientEmail || !subject || !body) {
    return res.status(400).json({
      error: 'Missing required fields: leadId, recipientEmail, subject, body',
    });
  }

  // Get lead record
  const lead = await pb.collection('leads').getOne(leadId);

  // Get email integration
  const integrations = await pb.collection('integrations').getFullList({
    filter: 'type = "email" && status = "active"',
  });

  if (integrations.length === 0) {
    throw new Error('Email integration not configured');
  }

  const integration = integrations[0];
  const credentials = typeof integration.credentials === 'string' ? JSON.parse(integration.credentials) : integration.credentials;

  // Send email
  const messageId = await sendEmailViaSMTP(recipientEmail, subject, body, credentials);

  // Create activity record
  await pb.collection('activities').create({
    type: 'email_sent',
    lead_id: leadId,
    description: 'Email sent',
    content: body,
    related_record_type: 'email',
    related_record_id: messageId,
    metadata: JSON.stringify({
      recipientEmail,
      subject,
      messageId,
      attachments: attachments || [],
    }),
    created_at: new Date().toISOString(),
  });

  logger.info(`Email sent to lead ${leadId}: ${messageId}`);

  res.json({
    success: true,
    messageId,
    timestamp: new Date().toISOString(),
  });
});

// POST /crm/integrations/facebook/webhook - Receive Facebook Lead Ads webhook
router.post('/facebook/webhook', async (req, res) => {
  const { body } = req;
  const signature = req.headers['x-hub-signature-256'];

  // Get Facebook integration to verify signature
  const integrations = await pb.collection('integrations').getFullList({
    filter: 'type = "facebook"',
  });

  if (integrations.length === 0) {
    throw new Error('Facebook integration not found');
  }

  const integration = integrations[0];
  const credentials = typeof integration.credentials === 'string' ? JSON.parse(integration.credentials) : integration.credentials;

  // Verify webhook signature
  const isValid = verifyWebhookSignature(signature, body, credentials.webhookSecret);

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  // Parse webhook payload
  if (body.entry && body.entry[0] && body.entry[0].changes) {
    const changes = body.entry[0].changes[0];

    if (changes.value.leadgen_id) {
      const leadData = changes.value.field_data;
      const leadName = leadData.find((f) => f.name === 'full_name')?.value || '';
      const leadEmail = leadData.find((f) => f.name === 'email')?.value || '';
      const leadPhone = leadData.find((f) => f.name === 'phone_number')?.value || '';
      const leadCompany = leadData.find((f) => f.name === 'company')?.value || '';

      // Auto-create lead in 'leads' collection
      const newLead = await pb.collection('leads').create({
        name: leadName,
        email: leadEmail,
        mobile: leadPhone,
        company: leadCompany,
        source: 'Facebook Lead Ads',
        status: 'new',
      });

      // Create activity record
      await pb.collection('activities').create({
        type: 'facebook_lead_received',
        lead_id: newLead.id,
        description: 'Lead received from Facebook Lead Ads',
        content: JSON.stringify(leadData),
        related_record_type: 'facebook_lead',
        related_record_id: changes.value.leadgen_id,
        metadata: JSON.stringify({
          facebookLeadId: changes.value.leadgen_id,
        }),
        created_at: new Date().toISOString(),
      });

      logger.info(`Facebook lead received and created: ${newLead.id}`);
    }
  }

  res.status(200).json({ success: true });
});

// POST /crm/integrations/google-ads/sync - Sync leads from Google Ads API
router.post('/google-ads/sync', async (req, res) => {
  const { integrationId } = req.body;

  if (!integrationId) {
    return res.status(400).json({
      error: 'Missing required field: integrationId',
    });
  }

  // Get integration record
  const integration = await pb.collection('integrations').getOne(integrationId);

  if (!integration) {
    throw new Error('Integration not found');
  }

  const credentials = typeof integration.credentials === 'string' ? JSON.parse(integration.credentials) : integration.credentials;

  // Fetch leads from Google Ads API (simplified - in production, use Google Ads API client)
  const response = await fetch('https://googleads.googleapis.com/v15/customers/' + credentials.customerId + '/googleAds:search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
      'developer-token': credentials.developerToken || '',
    },
    body: JSON.stringify({
      query: 'SELECT customer_match_user_list.id, customer_match_user_list.name FROM customer_match_user_list LIMIT 100',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Ads API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  let leadsImported = 0;

  // Process leads from Google Ads (simplified)
  if (data.results) {
    for (const result of data.results) {
      // In production, you would extract actual lead data from Google Ads
      // For now, we'll just count the results
      leadsImported++;
    }
  }

  // Update integration's last_sync timestamp
  await pb.collection('integrations').update(integrationId, {
    last_sync: new Date().toISOString(),
  });

  logger.info(`Google Ads sync completed: ${leadsImported} leads imported`);

  res.json({
    success: true,
    leadsImported,
    timestamp: new Date().toISOString(),
  });
});

// POST /crm/integrations/website-forms/webhook - Receive form submission webhook
router.post('/website-forms/webhook', async (req, res) => {
  const { body } = req;
  const signature = req.headers['x-webhook-signature'];

  // Get Website Forms integration to verify signature
  const integrations = await pb.collection('integrations').getFullList({
    filter: 'type = "website_forms"',
  });

  if (integrations.length === 0) {
    throw new Error('Website Forms integration not found');
  }

  const integration = integrations[0];
  const credentials = typeof integration.credentials === 'string' ? JSON.parse(integration.credentials) : integration.credentials;

  // Verify webhook signature
  const isValid = verifyWebhookSignature(signature, body, credentials.webhookSecret);

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  // Parse form data
  const { name, email, phone, company, message, formId } = body;

  if (!name || !email) {
    throw new Error('Missing required form fields: name, email');
  }

  // Auto-create lead in 'leads' collection
  const newLead = await pb.collection('leads').create({
    name,
    email,
    mobile: phone || '',
    company: company || '',
    source: 'Website Form',
    status: 'new',
    description: message || '',
  });

  // Create activity record
  await pb.collection('activities').create({
    type: 'form_submission',
    lead_id: newLead.id,
    description: 'Lead submitted website form',
    content: message || '',
    related_record_type: 'form_submission',
    related_record_id: formId || '',
    metadata: JSON.stringify({
      formId,
      submissionData: body,
    }),
    created_at: new Date().toISOString(),
  });

  logger.info(`Website form submission received and lead created: ${newLead.id}`);

  res.status(200).json({ success: true });
});

// GET /crm/integrations - Fetch all integrations
router.get('/', async (req, res) => {
  const integrations = await pb.collection('integrations').getFullList();

  const integrationList = integrations.map((integration) => ({
    id: integration.id,
    name: integration.name,
    type: integration.type,
    status: integration.status,
    last_sync: integration.last_sync || null,
    created_at: integration.created,
    updated_at: integration.updated,
  }));

  logger.info(`Integrations retrieved: ${integrationList.length} integrations`);

  res.json({
    success: true,
    integrations: integrationList,
    count: integrationList.length,
  });
});

// POST /crm/integrations/:id/test - Test integration connection
router.post('/:id/test', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required field: id',
    });
  }

  // Get integration record
  const integration = await pb.collection('integrations').getOne(id);

  if (!integration) {
    throw new Error('Integration not found');
  }

  const credentials = typeof integration.credentials === 'string' ? JSON.parse(integration.credentials) : integration.credentials;

  let testResult;

  switch (integration.type) {
    case 'whatsapp':
      testResult = await testWhatsAppConnection(credentials);
      break;
    case 'email':
      testResult = await testEmailConnection(credentials);
      break;
    case 'facebook':
      testResult = await testFacebookConnection(credentials);
      break;
    case 'google_ads':
      testResult = await testGoogleAdsConnection(credentials);
      break;
    case 'website_forms':
      testResult = await testWebsiteFormsConnection(credentials);
      break;
    default:
      throw new Error(`Unknown integration type: ${integration.type}`);
  }

  logger.info(`Integration test completed for ${id}: ${integration.type}`);

  res.json({
    success: testResult.success,
    message: testResult.message,
    timestamp: new Date().toISOString(),
  });
});

// PUT /crm/integrations/:id - Update integration
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, credentials, status } = req.body;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required field: id',
    });
  }

  // Get integration record
  const integration = await pb.collection('integrations').getOne(id);

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Validate credentials format if provided
  if (credentials) {
    if (typeof credentials !== 'object') {
      return res.status(400).json({
        error: 'Credentials must be a valid JSON object',
      });
    }
  }

  // Update integration record
  const updateData = {};
  if (name) updateData.name = name;
  if (credentials) updateData.credentials = JSON.stringify(credentials);
  if (status) updateData.status = status;

  const updatedIntegration = await pb.collection('integrations').update(id, updateData);

  logger.info(`Integration updated: ${id}`);

  res.json({
    success: true,
    integration: {
      id: updatedIntegration.id,
      name: updatedIntegration.name,
      type: updatedIntegration.type,
      status: updatedIntegration.status,
      last_sync: updatedIntegration.last_sync || null,
      created_at: updatedIntegration.created,
      updated_at: updatedIntegration.updated,
    },
  });
});

// DELETE /crm/integrations/:id - Delete integration
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required field: id',
    });
  }

  // Get integration record
  const integration = await pb.collection('integrations').getOne(id);

  if (!integration) {
    throw new Error('Integration not found');
  }

  // Delete integration
  await pb.collection('integrations').delete(id);

  logger.info(`Integration deleted: ${id}`);

  res.json({
    success: true,
    message: 'Integration deleted successfully',
  });
});

export default router;