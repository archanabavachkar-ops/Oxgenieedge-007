import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to calculate string similarity (Levenshtein distance)
const stringSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 100;

  const editDistance = getEditDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
};

const getEditDistance = (s1, s2) => {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

// GET /crm/capture/sources - Get all configured lead sources
router.get('/sources', async (req, res) => {
  const sources = await pb.collection('lead_sources').getFullList();

  const sourceList = sources.map((source) => ({
    id: source.id,
    name: source.name,
    description: source.description || '',
    type: source.type || 'manual',
    isActive: source.isActive !== false,
  }));

  logger.info(`Lead sources retrieved: ${sourceList.length} sources`);

  res.json({
    sources: sourceList,
    count: sourceList.length,
  });
});

// POST /crm/capture/test - Test lead capture with sample data
router.post('/test', async (req, res) => {
  const { sourceId, testData } = req.body;

  if (!sourceId || !testData) {
    return res.status(400).json({
      error: 'Missing required fields: sourceId, testData',
    });
  }

  // Validate source exists
  const source = await pb.collection('lead_sources').getOne(sourceId);

  if (!source) {
    throw new Error('Lead source not found');
  }

  // Validate test data has required fields
  if (!testData.name || !testData.email || !testData.mobile) {
    return res.status(400).json({
      error: 'Test data must include: name, email, mobile',
    });
  }

  // Create test lead
  const testLead = await pb.collection('leads').create({
    name: testData.name,
    email: testData.email,
    mobile: testData.mobile,
    company: testData.company || '',
    serviceInterest: testData.serviceInterest || '',
    source: source.name,
    status: 'new',
    isTest: true,
  });

  logger.info(`Test lead created: ${testLead.id}`);

  res.json({
    success: true,
    testLeadId: testLead.id,
    message: 'Test lead created successfully',
  });
});

// POST /crm/capture/deduplicate - Check for duplicate leads
router.post('/deduplicate', async (req, res) => {
  const { leadId } = req.body;

  if (!leadId) {
    return res.status(400).json({
      error: 'Missing required field: leadId',
    });
  }

  // Get the lead
  const lead = await pb.collection('leads').getOne(leadId);

  if (!lead) {
    throw new Error('Lead not found');
  }

  // Get all other leads
  const allLeads = await pb.collection('leads').getFullList();
  const otherLeads = allLeads.filter((l) => l.id !== leadId);

  // Find potential duplicates
  const potentialDuplicates = [];

  otherLeads.forEach((otherLead) => {
    let similarityScore = 0;
    let matchReasons = [];

    // Check email match
    if (lead.email && otherLead.email && lead.email.toLowerCase() === otherLead.email.toLowerCase()) {
      similarityScore += 100;
      matchReasons.push('email_match');
    }

    // Check phone match
    if (lead.mobile && otherLead.mobile && lead.mobile.replace(/\D/g, '') === otherLead.mobile.replace(/\D/g, '')) {
      similarityScore += 100;
      matchReasons.push('phone_match');
    }

    // Check name similarity
    if (lead.name && otherLead.name) {
      const nameSimilarity = stringSimilarity(lead.name, otherLead.name);
      if (nameSimilarity > 80) {
        similarityScore += nameSimilarity;
        matchReasons.push('name_similar');
      }
    }

    // Average the score
    if (matchReasons.length > 0) {
      similarityScore = similarityScore / matchReasons.length;
    }

    if (similarityScore > 50) {
      potentialDuplicates.push({
        id: otherLead.id,
        name: otherLead.name,
        email: otherLead.email,
        mobile: otherLead.mobile,
        similarityScore: parseFloat(similarityScore.toFixed(2)),
        matchReasons,
      });
    }
  });

  logger.info(`Deduplication check completed for lead ${leadId}: ${potentialDuplicates.length} potential duplicates found`);

  res.json({
    leadId,
    potentialDuplicates: potentialDuplicates.sort((a, b) => b.similarityScore - a.similarityScore),
    count: potentialDuplicates.length,
  });
});

// POST /crm/capture/merge - Merge duplicate leads
router.post('/merge', async (req, res) => {
  const { lead1Id, lead2Id } = req.body;

  if (!lead1Id || !lead2Id) {
    return res.status(400).json({
      error: 'Missing required fields: lead1Id, lead2Id',
    });
  }

  // Get both leads
  const lead1 = await pb.collection('leads').getOne(lead1Id);
  const lead2 = await pb.collection('leads').getOne(lead2Id);

  if (!lead1 || !lead2) {
    throw new Error('One or both leads not found');
  }

  // Merge lead2 into lead1 (keep lead1, update with non-empty fields from lead2)
  const mergedData = {
    name: lead1.name || lead2.name,
    email: lead1.email || lead2.email,
    mobile: lead1.mobile || lead2.mobile,
    company: lead1.company || lead2.company,
    serviceInterest: lead1.serviceInterest || lead2.serviceInterest,
    score: Math.max(lead1.score || 0, lead2.score || 0),
  };

  await pb.collection('leads').update(lead1Id, mergedData);

  // Record the merge in duplicate_leads collection
  await pb.collection('duplicate_leads').create({
    primaryLeadId: lead1Id,
    duplicateLeadId: lead2Id,
    mergedAt: new Date().toISOString(),
  });

  // Optionally delete lead2 (commented out for safety)
  // await pb.collection('leads').delete(lead2Id);

  logger.info(`Leads merged: ${lead1Id} (primary) + ${lead2Id} (duplicate)`);

  res.json({
    success: true,
    primaryLeadId: lead1Id,
    mergedLeadId: lead2Id,
    message: 'Leads merged successfully',
  });
});

// POST /crm/capture/enrich - Enrich lead with external data
router.post('/enrich', async (req, res) => {
  const { leadId } = req.body;

  if (!leadId) {
    return res.status(400).json({
      error: 'Missing required field: leadId',
    });
  }

  // Get the lead
  const lead = await pb.collection('leads').getOne(leadId);

  if (!lead) {
    throw new Error('Lead not found');
  }

  // Simulate enrichment (in production, call Hunter.io, Clearbit, etc.)
  const enrichedData = {
    jobTitle: 'Business Development Manager',
    industry: 'Technology',
    companySize: '50-200',
    linkedinUrl: `https://linkedin.com/in/${lead.name.toLowerCase().replace(/\s+/g, '-')}`,
    enrichmentStatus: 'enriched',
    enrichedAt: new Date().toISOString(),
  };

  // Update lead with enriched data
  await pb.collection('leads').update(leadId, enrichedData);

  logger.info(`Lead enriched: ${leadId}`);

  res.json({
    success: true,
    leadId,
    enrichedData,
    message: 'Lead enriched successfully',
  });
});

// GET /crm/capture/analytics - Get lead capture analytics
router.get('/analytics', async (req, res) => {
  const leads = await pb.collection('leads').getFullList();

  // Leads per source
  const leadsPerSource = {};
  leads.forEach((lead) => {
    const source = lead.source || 'Direct';
    leadsPerSource[source] = (leadsPerSource[source] || 0) + 1;
  });

  // Capture rate (leads created in last 30 days / total leads)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLeads = leads.filter((lead) => new Date(lead.created) >= thirtyDaysAgo);
  const captureRate = leads.length > 0 ? ((recentLeads.length / leads.length) * 100).toFixed(2) : 0;

  // Quality metrics
  const avgScore = leads.length > 0
    ? (leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length).toFixed(2)
    : 0;

  // Source performance
  const sourcePerformance = Object.entries(leadsPerSource).map(([source, count]) => {
    const sourceLeads = leads.filter((l) => (l.source || 'Direct') === source);
    const convertedCount = sourceLeads.filter((l) => l.status === 'Won').length;
    const conversionRate = count > 0 ? ((convertedCount / count) * 100).toFixed(2) : 0;
    return {
      source,
      count,
      conversionRate: parseFloat(conversionRate),
      avgScore: parseFloat(
        (sourceLeads.reduce((sum, l) => sum + (l.score || 0), 0) / count).toFixed(2)
      ),
    };
  });

  logger.info('Lead capture analytics retrieved');

  res.json({
    totalLeads: leads.length,
    leadsPerSource,
    captureRate: parseFloat(captureRate),
    avgQualityScore: parseFloat(avgScore),
    sourcePerformance: sourcePerformance.sort((a, b) => b.count - a.count),
  });
});

export default router;