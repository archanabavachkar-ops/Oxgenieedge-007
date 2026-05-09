import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /crm/leads/by-source - Get leads grouped by source
router.get('/by-source', async (req, res) => {
  // Fetch all leads
  const leads = await pb.collection('leads').getFullList();

  // Define source categories
  const sources = {
    'Website': 0,
    'Social Media': 0,
    'Ads': 0,
    'Direct': 0,
    'Other': 0,
  };

  // Count leads by source
  leads.forEach((lead) => {
    const source = lead.source || 'Direct';
    if (Object.prototype.hasOwnProperty.call(sources, source)) {
      sources[source]++;
    } else {
      sources['Other']++;
    }
  });

  logger.info('Leads by source retrieved');

  res.json(sources);
});

export default router;