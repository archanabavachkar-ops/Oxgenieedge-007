import express from 'express';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

router.post('/', async (req, res) => {

  try {

    const lead = await pb.collection('leads').create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,

      serviceInterest: req.body.serviceInterest || '',
      description: req.body.description || '',

      source: 'Website',
      priority: 'Warm',
      status: 'New Lead'
    });

    res.json({
      success: true,
      data: lead
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      full: error
    });

  }

});

router.post('/', async (req, res) => {

  try {

    const lead = await pb.collection('leads').create({

      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,

      serviceInterest: req.body.serviceInterest || '',
      description: req.body.description || '',

      source: 'Website',
      priority: 'Warm',
      status: 'New Lead'

    });

    res.json({
      success: true,
      data: lead
    });

  } catch (error) {

    console.error(
      JSON.stringify(error.response, null, 2)
    );

    res.status(500).json({
      success: false,
      error: error.response || error.message
    });

  }

});

export default router;