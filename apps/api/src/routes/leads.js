import express from 'express';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();

router.post('/', async (req, res) => {

  try {

    const lead = await pb.collection('leads').create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      source: req.body.source,
      priority: req.body.priority,
      status: req.body.status
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
      message: error.message
    });

  }

});

router.put('/:id', async (req, res) => {

  try {

    const updatedLead = await pb.collection('leads').update(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: updatedLead
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

export default router;