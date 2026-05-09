
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'Webhooks router is active' });
});

export default router;
