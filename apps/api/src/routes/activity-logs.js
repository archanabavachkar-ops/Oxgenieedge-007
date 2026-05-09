import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /activity-logs/create - Create an activity log entry
router.post('/create', async (req, res) => {
  const { partnerId, applicationId, action, actionDetails, performedBy, performedByName } = req.body;

  if (!action || !performedBy || !performedByName) {
    return res.status(400).json({
      error: 'Missing required fields: action, performedBy, performedByName',
    });
  }

  // Create activity log record
  const activityLogRecord = await pb.collection('activity_logs').create({
    partnerId: partnerId || '',
    applicationId: applicationId || '',
    action,
    actionDetails: actionDetails || '',
    performedBy,
    performedByName,
    createdAt: new Date().toISOString(),
  });

  logger.info(`Activity log created: ${action} by ${performedByName}`);

  res.status(201).json({
    success: true,
    activityLogId: activityLogRecord.id,
  });
});

export default router;