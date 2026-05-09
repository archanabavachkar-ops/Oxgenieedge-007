
import express from 'express';
import { LeadService } from '../../services/LeadService.js';
import { RetryQueue } from '../../services/RetryQueue.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * Helper to recursively search an object for specific field names
 */
const findValue = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return null;
  
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findValue(item, keys);
      if (result) return result;
    }
  } else {
    for (const k in obj) {
      const result = findValue(obj[k], keys);
      if (result) return result;
    }
  }
  return null;
};

/**
 * Extract field values from Facebook webhook payload
 */
const extractFBField = (body, fieldNames) => {
  try {
    // 1. Try standard Facebook Lead Ads field_data array format
    const changes = body?.entry?.[0]?.changes?.[0]?.value;
    if (changes?.field_data) {
      for (const field of changes.field_data) {
        if (fieldNames.includes(field.name)) {
          return field.values?.[0] || '';
        }
      }
    }
    
    // 2. Try lead_ads_qualification format
    if (changes?.lead_ads_qualification?.data) {
      for (const field of changes.lead_ads_qualification.data) {
        if (fieldNames.includes(field.name)) {
          return field.value || '';
        }
      }
    }
  } catch (e) {
    // Ignore extraction errors and fallback
  }

  // 3. Fallback to deep recursive search
  return findValue(body, fieldNames) || '';
};

/**
 * POST /webhook
 * Receive and process Facebook Lead Ads webhook
 */
router.post('/webhook', (req, res) => {
  // 1. Immediately return 200 OK to prevent Facebook from retrying
  res.status(200).send('OK');

  // 2. Process the lead asynchronously
  (async () => {
    try {
      logger.info('Received Facebook webhook event', { event: req.body?.object || 'unknown' });

      const name = extractFBField(req.body, ['full_name', 'name', 'first_name']);
      const email = extractFBField(req.body, ['email', 'email_address']);
      const phone = extractFBField(req.body, ['phone_number', 'phone', 'mobile']);
      const campaign_name = extractFBField(req.body, ['campaign_name', 'campaign']);
      const payloadString = JSON.stringify(req.body);

      // Map to the requested schema and include LeadService specific fields
      const leadData = {
        name: name || 'Facebook Lead',
        email: email,
        mobile: phone,
        subject: campaign_name,
        message: payloadString,
        source: 'Facebook Lead Ads',
        // Mapping for compatibility with LeadService internal schema
        description: payloadString,
        serviceInterest: campaign_name
      };

      // 3. Execute with RetryQueue (3 retries, 1000ms base delay)
      await RetryQueue.execute(async () => {
        const createdLead = await LeadService.createLead(leadData);
        
        // Attempt to auto-assign the newly created lead
        if (createdLead && createdLead.id) {
          try {
            await LeadService.assignLead(createdLead.id);
          } catch (assignError) {
            logger.warn(`Failed to auto-assign Facebook lead ${createdLead.id}: ${assignError.message}`);
          }
        }
      }, 3, 1000);

      logger.info('Successfully processed Facebook webhook lead');
    } catch (error) {
      // Catch errors here so they don't crash the node process (response is already sent)
      logger.error('Failed to process Facebook webhook lead', { 
        error: error.message,
        stack: error.stack
      });
    }
  })();
});

/**
 * GET /webhook
 * Verification endpoint for Facebook webhook setup
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe') {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

export default router;
