import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('LEADS ROUTE HIT');

  res.json({
    success: true,
    message: 'Leads route working'
  });
});

export default router;