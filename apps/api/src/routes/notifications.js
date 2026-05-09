import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /notifications/:user_id - Fetch unread notifications for a user
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({
      error: 'Missing required field: user_id',
    });
  }

  // Fetch notifications for user, sorted by created_at descending
  const notifications = await pb.collection('notifications').getFullList({
    filter: `user_id = "${user_id}"`,
    sort: '-created_at',
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  logger.info(`Notifications retrieved for user ${user_id}: ${notifications.length} total, ${unreadCount} unread`);

  res.json({
    success: true,
    notifications: notifications.map((n) => ({
      id: n.id,
      user_id: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      related_entity_type: n.related_entity_type,
      related_entity_id: n.related_entity_id,
      read: n.read,
      created_at: n.created_at,
      read_at: n.read_at || null,
    })),
    unreadCount,
    totalCount: notifications.length,
  });
});

// POST /notifications/:id/read - Mark a notification as read
router.post('/:id/read', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required field: id',
    });
  }

  // Get notification record
  const notification = await pb.collection('notifications').getOne(id);

  if (!notification) {
    throw new Error('Notification not found');
  }

  // Update notification to mark as read
  const updatedNotification = await pb.collection('notifications').update(id, {
    read: true,
    read_at: new Date().toISOString(),
  });

  logger.info(`Notification marked as read: ${id}`);

  res.json({
    success: true,
    notification: {
      id: updatedNotification.id,
      read: updatedNotification.read,
      read_at: updatedNotification.read_at,
    },
  });
});

export default router;