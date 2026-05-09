import { Router } from 'express';
import PocketBase from 'pocketbase';

const router = Router();

// Initialize PocketBase client
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

// GET request for webhook verification
router.get('/webhook', async (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  try {
    // Get the stored verify token from database
    const settings = await pb.collection('whatsapp_settings').getFirstListItem('');
    const storedToken = settings.whatsappWebhookVerifyToken;

    // Verify the token
    if (mode === 'subscribe' && token === storedToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  } catch (error) {
    console.error('Webhook verification error:', error);
    res.status(500).send('Error');
  }
});

// POST request for incoming messages
router.post('/webhook', async (req, res) => {
  // Respond immediately with 200
  res.status(200).send('OK');

  // Process message asynchronously
  try {
    const body = req.body;
    console.log('Incoming webhook:', body);

    // Your message processing logic here
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
});

export default router;