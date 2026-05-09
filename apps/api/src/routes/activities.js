import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to generate CSV
const generateCSV = (data, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value || '';
    }).join(',');
  });
  return [csvHeaders, ...csvRows].join('\n');
};

// POST /activities/create - Create an activity record
router.post('/create', async (req, res) => {
  const { type, lead_id, description, content, related_record_id, related_record_type, metadata } = req.body;

  if (!type) {
    return res.status(400).json({
      error: 'Missing required field: type',
    });
  }

  // Create activity record
  const activityRecord = await pb.collection('activities').create({
    type,
    lead_id: lead_id || '',
    description: description || '',
    content: content || '',
    related_record_id: related_record_id || '',
    related_record_type: related_record_type || '',
    metadata: metadata ? JSON.stringify(metadata) : '',
    created_at: new Date().toISOString(),
  });

  // Create activity_logs entry for audit trail
  await pb.collection('activity_logs').create({
    entity_type: 'activity',
    entity_id: activityRecord.id,
    action: 'created',
    description: `Activity "${type}" created`,
    metadata: JSON.stringify({
      type,
      lead_id,
      related_record_type,
    }),
    created_at: new Date().toISOString(),
  });

  logger.info(`Activity created: ${activityRecord.id}`);

  res.status(201).json({
    success: true,
    activityId: activityRecord.id,
    activity: {
      id: activityRecord.id,
      type: activityRecord.type,
      lead_id: activityRecord.lead_id,
      description: activityRecord.description,
      content: activityRecord.content,
      related_record_id: activityRecord.related_record_id,
      related_record_type: activityRecord.related_record_type,
      created_at: activityRecord.created_at,
    },
  });
});

// POST /activities/export - Export activities to CSV or PDF
router.post('/export', async (req, res) => {
  const { format, date_range, filters, email_delivery } = req.body;

  if (!format || !['csv', 'pdf'].includes(format)) {
    return res.status(400).json({
      error: 'Invalid format. Must be csv or pdf',
    });
  }

  // Fetch all activities
  let activities = await pb.collection('activities').getFullList();

  // Apply date range filter if provided
  if (date_range && date_range.start && date_range.end) {
    const startDate = new Date(date_range.start);
    const endDate = new Date(date_range.end);

    activities = activities.filter((activity) => {
      const createdDate = new Date(activity.created_at);
      return createdDate >= startDate && createdDate <= endDate;
    });
  }

  // Apply additional filters if provided
  if (filters) {
    if (filters.type) {
      activities = activities.filter((a) => a.type === filters.type);
    }
    if (filters.lead_id) {
      activities = activities.filter((a) => a.lead_id === filters.lead_id);
    }
  }

  // Build export data
  const exportData = activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    lead_id: activity.lead_id,
    description: activity.description,
    content: activity.content,
    related_record_type: activity.related_record_type,
    created_at: activity.created_at,
  }));

  if (format === 'csv') {
    const headers = ['id', 'type', 'lead_id', 'description', 'content', 'related_record_type', 'created_at'];
    const csv = generateCSV(exportData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="activities_${Date.now()}.csv"`);
    res.send(csv);
  } else if (format === 'pdf') {
    // For PDF, return JSON with data (actual PDF generation would require a library)
    res.json({
      success: true,
      message: 'PDF generation requires additional setup. Returning data as JSON.',
      data: exportData,
      count: exportData.length,
    });
  }

  logger.info(`Activities exported: ${exportData.length} records in ${format} format`);
});

export default router;