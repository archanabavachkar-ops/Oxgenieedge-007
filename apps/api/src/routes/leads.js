import express from 'express';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

// GET all leads
router.get('/', async (req, res) => {

  try {

    const data = await pb.collection('leads').getFullList();

    res.json({
      success: true,
      data
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message,
      full: error
    });

  }

});

// CREATE new lead
router.post('/', async (req, res) => {

  try {

    const lead = await pb.collection('leads').create(req.body);

    res.status(201).json({
      success: true,
      data: lead
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
      full: error
    });

  }

});

export default router;