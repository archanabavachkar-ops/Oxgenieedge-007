import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to send email reminder
const sendEmailReminder = async (email, taskTitle, dueDate) => {
  logger.info(`Email reminder prepared for ${email}: Task "${taskTitle}" due on ${dueDate}`);
  // In production, this would integrate with PocketBase mailer
  return { success: true };
};

// POST /tasks/:id/reminder - Send reminder notifications
router.post('/:id/reminder', async (req, res) => {
  const { id } = req.params;
  const { reminder_type } = req.body;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required field: id',
    });
  }

  // Get task record
  const task = await pb.collection('tasks').getOne(id);

  if (!task) {
    throw new Error('Task not found');
  }

  const reminderType = reminder_type || 'in_app';

  // Check if task is overdue or due soon
  const dueDate = new Date(task.due_date);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  let reminderSent = false;

  // Send reminder based on type
  if (reminderType === 'email' && task.assigned_to) {
    // Get assigned user email (simplified - assumes assigned_to is user ID)
    try {
      const user = await pb.collection('users').getOne(task.assigned_to);
      await sendEmailReminder(user.email, task.title, task.due_date);
      reminderSent = true;
    } catch (error) {
      logger.warn(`Could not send email reminder: ${error.message}`);
    }
  } else if (reminderType === 'in_app' && task.assigned_to) {
    // Create in-app notification
    let message = `Reminder: Task "${task.title}" is due on ${task.due_date}`;
    if (daysUntilDue < 0) {
      message = `Overdue: Task "${task.title}" was due on ${task.due_date}`;
    } else if (daysUntilDue === 0) {
      message = `Due today: Task "${task.title}" is due today`;
    } else if (daysUntilDue === 1) {
      message = `Due tomorrow: Task "${task.title}" is due tomorrow`;
    }

    await pb.collection('notifications').create({
      user_id: task.assigned_to,
      type: 'task_reminder',
      title: 'Task Reminder',
      message,
      related_entity_type: 'task',
      related_entity_id: id,
      read: false,
      created_at: new Date().toISOString(),
    });

    reminderSent = true;
  }

  // Create activity log entry
  if (reminderSent) {
    await pb.collection('activity_logs').create({
      entity_type: 'task',
      entity_id: id,
      action: 'reminder_sent',
      description: `${reminderType} reminder sent for task "${task.title}"`,
      metadata: JSON.stringify({
        reminder_type: reminderType,
        days_until_due: daysUntilDue,
      }),
      created_at: new Date().toISOString(),
    });
  }

  logger.info(`Reminder sent for task ${id}: ${reminderType}`);

  res.json({
    success: reminderSent,
    message: reminderSent ? `${reminderType} reminder sent successfully` : 'Failed to send reminder',
    taskId: id,
    reminderType,
  });
});

export default router;