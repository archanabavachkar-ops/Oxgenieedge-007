import express from 'express';
import pb from '../utils/pocketbaseClient.js';

const router = express.Router();


// ----------------------------
// CREATE LEAD
// ----------------------------
router.post('/', async (req, res) => {
  try {

    const lead = await pb.collection('leads').create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      serviceInterest: req.body.serviceInterest || '',
      description: req.body.description || '',
      source: req.body.source || 'Website',
      priority: req.body.priority || 'Warm',
      status: req.body.status || 'New Lead',
      assignedTo: req.body.assignedTo || ''
    });

    res.json({
      success: true,
      data: lead
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }
});


// ----------------------------
// GET ALL LEADS
// ----------------------------
router.get('/', async (req, res) => {

  try {

    const leads = await pb.collection('leads').getFullList({
      sort: '-created'
    });

    res.json({
      success: true,
      data: leads
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});


// ----------------------------
// UPDATE LEAD
// ----------------------------
router.put('/:id', async (req, res) => {

  try {

    const lead = await pb.collection('leads').update(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: lead
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});


// ----------------------------
// DELETE LEAD
// ----------------------------
router.delete('/:id', async (req, res) => {

  try {

    await pb.collection('leads').delete(req.params.id);

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

export default router;