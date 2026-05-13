import express from 'express';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

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

export default router;