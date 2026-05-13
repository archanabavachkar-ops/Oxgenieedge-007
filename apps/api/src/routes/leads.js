import express from 'express';

const router = express.Router();

// GET all leads
router.get('/', async (req, res) => {

  res.json({
    success: true,
    data: []
  });

});

export default router;