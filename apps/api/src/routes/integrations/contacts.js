import express from 'express';
import { LeadService } from '../../services/LeadService.js';
import { RetryQueue } from '../../services/RetryQueue.js';
import emailService from '../../services/emailService.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /contact-form
 * Receive and process contact form submissions
 */
router.post('/contact-form', async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      logger.warn('Contact form submission missing required fields', { name, email, message });
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, and message are required' 
      });
    }

    const timestamp = new Date().toISOString();

    logger.info(`Contact form submission received from ${email}`, { name, email });

    // Process contact form asynchronously
    (async () => {
      try {
        // Create lead from contact form submission
        const leadData = {
          name: name,
          email: email,
          mobile: phone || '',
          source: 'Contact Form',
          message: message,
          subject: 'Contact Form Submission',
          description: message,
          serviceInterest: 'Contact Form Inquiry'
        };

        // Execute with RetryQueue (3 retries, 1000ms base delay)
        await RetryQueue.execute(async () => {
          const createdLead = await LeadService.createLead(leadData);
          
          logger.info(`Lead created from contact form: ${createdLead.id}`);

          // Attempt to auto-assign the newly created lead
          if (createdLead && createdLead.id) {
            try {
              await LeadService.assignLead(createdLead.id);
              logger.info(`Lead ${createdLead.id} auto-assigned successfully`);
            } catch (assignError) {
              logger.warn(`Failed to auto-assign contact form lead ${createdLead.id}: ${assignError.message}`);
            }

            // Send email notification about new contact form submission
            try {
              await emailService.sendContactFormNotification(name, email, message, timestamp);
              logger.info(`Email notification sent for contact form submission from ${email}`);
            } catch (emailError) {
              logger.error('Failed to send email notification for contact form', { error: emailError.message });
            }
          }
        }, 3, 1000);

        logger.info('Successfully processed contact form submission');
      } catch (error) {
        logger.error('Error processing contact form submission', { 
          error: error.message,
          stack: error.stack
        });
      }
    })();

    // Return 200 immediately (async processing)
    return res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully. We will get back to you soon!'
    });
  } catch (error) {
    logger.error('Contact form endpoint error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
