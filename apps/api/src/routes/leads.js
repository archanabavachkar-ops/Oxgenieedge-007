import express from 'express';
import pb from '../utils/pocketbaseClient.js';

console.log("✅ LOADED: routes/leads.js");

const router = express.Router();

// ----------------------------
// CREATE LEAD
// ----------------------------
// ----------------------------
// CREATE LEAD
// ----------------------------
router.post('/', async (req, res) => {

  try {

    console.log("POST /api/leads");
    console.log(req.body);

    const lead = await pb.collection('leads').create({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      companyName: req.body.companyName || '',

      source: req.body.source || 'Website',
      priority: req.body.priority || 'Warm',
      status: req.body.status || 'New Lead',

      leadOwner: req.body.leadOwner || '',

      serviceInterest: req.body.serviceInterest || '',
      description: req.body.description || ''
    });

    res.json({
      success: true,
      data: lead
    });

  } catch (err) {

    console.log("========== CREATE LEAD FAILED ==========");
    console.log("Message:", err.message);
    console.dir(err, { depth: null });

    if (err.response) {
      console.log("PocketBase Response:");
      console.dir(err.response, { depth: null });
    }

    res.status(500).json({
      success: false,
      message: err.message,
      response: err.response || null
    });

  }

});

// ----------------------------
// GET ALL LEADS
// ----------------------------
router.get('/', async (req, res) => {

  console.log("✅ GET /api/leads called");

  try {

    const leads = await pb.collection('leads').getFullList({
      sort: '-created'
    });

    console.log("Leads:", leads.length);

    res.json({
      success: true,
      data: leads
    });

  } catch (err) {

    console.error("GET LEADS ERROR");
    console.error(err);

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
    console.log("Lead ID:", req.params.id);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const lead = await pb.collection("leads").update(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: lead
    });

  } catch (err) {
    console.error("PocketBase Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
      data: err.data,
      response: err.response
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