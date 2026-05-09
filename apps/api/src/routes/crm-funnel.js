import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /crm/leads/funnel - Get pipeline funnel data
router.get('/funnel', async (req, res) => {
  // Fetch all leads
  const leads = await pb.collection('leads').getFullList();

  // Define funnel stages
  const stages = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Won'];

  // Count leads at each stage
  const funnel = stages.map((stage) => {
    const count = leads.filter((lead) => lead.status === stage).length;
    return {
      stage,
      count,
    };
  });

  logger.info('Funnel data retrieved');

  res.json(funnel);
});

export default router;