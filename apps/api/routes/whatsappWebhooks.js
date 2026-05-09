
import express from 'express';
import pb from '../config/pocketbase.js';

const router = express.Router();

// GET /webhook - Webhook verification
router.get('/webhook', (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('WhatsApp webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        console.warn('WhatsApp webhook verification failed: Invalid token');
        return res.sendStatus(403);
      }
    }
    
    return res.sendStatus(400);
  } catch (error) {
    console.error('Error during webhook verification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /webhook - Receive incoming messages
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Check if this is an event from a WhatsApp API
    if (body.object === 'whatsapp_business_account') {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const value = body.entry[0].changes[0].value;
        const message = value.messages[0];
        const from = message.from;
        
        // Extract message content based on type
        let messageContent = '';
        if (message.type === 'text') {
          messageContent = message.text.body;
        } else {
          messageContent = `[${message.type} message received]`;
        }

        console.log(`Received WhatsApp message from ${from}: ${messageContent}`);

        // Store the message in PocketBase
        try {
          // Note: In a real scenario, you'd look up the lead_id based on the phone number.
          // Here we use the phone number as a fallback or placeholder.
          await pb.collection('whatsapp_messages').create({
            lead_id: from, 
            message: messageContent,
            direction: 'incoming',
            status: 'received',
            sender_id: from
          });
          console.log('Message successfully stored in PocketBase');
        } catch (pbError) {
          console.error('Error storing message in PocketBase:', pbError.message);
          // We still want to return 200 to WhatsApp so they don't retry
        }
      }
      
      // Return a '200 OK' response to all requests
      return res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      return res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing incoming webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
