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
    console.log("Incoming lead payload:", req.body);

    const {
      name,
      mobile,
      email,
      source,
      status,
      value,
      company,
      designation,
      budgetRange,
      preferredContact,
      serviceInterest,
      description,
      stage
    } = req.body;

    const record = await pb.collection('leads').create({
      name,
      mobile,
      email,
      source,
      status,
      value,
      company,
      designation,
      budgetRange,
      preferredContact,
      serviceInterest,
      description,
      stage
    });

    console.log("Lead created:", record);

    return res.status(201).json({
      success: true,
      lead: record
    });

  } catch (error) {
    console.error("Lead API Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
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