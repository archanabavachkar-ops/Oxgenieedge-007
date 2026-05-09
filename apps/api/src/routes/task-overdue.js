import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /tasks/overdue - Fetch all overdue tasks
router.get('/', async (req, res) => {
  // Fetch all tasks
  const allTasks = await pb.collection('tasks').getFullList();

  // Filter overdue tasks (due_date < today and status != completed)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = allTasks.filter((task) => {
    if (task.status === 'completed') {
      return false;
    }

    if (!task.due_date) {
      return false;
    }

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  });

  // Create notifications for task assignees
  for (const task of overdueTasks) {
    if (task.assigned_to) {
      // Check if notification already exists for today
      const existingNotifications = await pb.collection('notifications').getFullList({
        filter: `user_id = "${task.assigned_to}" && type = "task_overdue" && entity_id = "${task.id}"`,
      }).catch(() => []);

      // Only create notification if one doesn't already exist
      if (existingNotifications.length === 0) {
        await pb.collection('notifications').create({
          user_id: task.assigned_to,
          type: 'task_overdue',
          title: 'Overdue Task',
          message: `Task "${task.title}" is overdue (due: ${task.due_date})`,
          related_entity_type: 'task',
          related_entity_id: task.id,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  logger.info(`Overdue tasks retrieved: ${overdueTasks.length} tasks`);

  res.json({
    success: true,
    overdueTasks: overdueTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      due_date: task.due_date,
      priority: task.priority,
      lead_id: task.lead_id,
      status: task.status,
      created_at: task.created_at,
    })),
    count: overdueTasks.length,
  });
});

export default router;