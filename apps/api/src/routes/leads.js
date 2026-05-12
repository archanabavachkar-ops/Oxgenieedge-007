import { Router } from 'express';
import pb from '../../config/pocketbase.js';

const router = Router();

// GET /leads - Fetch all leads with optional filters
router.get('/', async (req, res) => {
  const { status, source } = req.query;
  
  let filter = [];
  if (status) filter.push(`status="${status}"`);
  if (source) filter.push(`source="${source}"`);
  
  const records = await pb.collection('leads').getFullList({
    filter: filter.length > 0 ? filter.join(' && ') : '',
    sort: '-created',
    $autoCancel: false
  });
  
  res.status(200).json(records);
});

// POST /leads - Create a new lead
router.post('/', async (req, res) => {
  try {
    console.log("Incoming lead:", req.body);

    const {
      name,
      email,
      mobile,
      company,
      designation,
      budgetRange,
      preferredContact,
      serviceInterest,
      description,
      source,
      status
    } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required"
      });
    }

    // Create lead
    const record = await pb.collection('leads').create({
      name,
      email,
      mobile,
      company,
      designation,
      budgetRange,
      preferredContact,
      serviceInterest,
      description,
      source: source || "website_contact_form",
      status: status || "new"
    }, {
      $autoCancel: false
    });

    // IMPORTANT
    return res.status(201).json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error("Lead creation error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create lead"
    });
  }
});

// GET /leads/:id - Fetch a single lead
router.get('/:id', async (req, res) => {
  const record = await pb.collection('leads').getOne(req.params.id, { 
    $autoCancel: false 
  });
  
  res.status(200).json(record);
});

// PUT /leads/:id - Update a lead
router.put('/:id', async (req, res) => {
  const record = await pb.collection('leads').update(req.params.id, req.body, { 
    $autoCancel: false 
  });
  
  res.status(200).json(record);
});

// DELETE /leads/:id - Delete a lead
router.delete('/:id', async (req, res) => {
  await pb.collection('leads').delete(req.params.id, { 
    $autoCancel: false 
  });
  
  res.status(200).json({ success: true });
});

export default router;