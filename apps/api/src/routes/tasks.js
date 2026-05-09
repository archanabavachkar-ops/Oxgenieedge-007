import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /tasks/create - Create a new task
router.post('/create', async (req, res) => {
  const { title, description, assigned_to, due_date, priority, lead_id, status } = req.body;

  if (!title) {
    return res.status(400).json({
      error: 'Missing required field: title',
    });
  }

  // Create task record
  const taskRecord = await pb.collection('tasks').create({
    title,
    description: description || '',
    assigned_to: assigned_to || '',
    due_date: due_date || '',
    priority: priority || 'medium',
    lead_id: lead_id || '',
    status: status || 'pending',
    created_at: new Date().toISOString(),
  });

  // Create activity log entry
  await pb.collection('activity_logs').create({
    entity_type: 'task',
    entity_id: taskRecord.id,
    action: 'created',
    description: `Task "${title}" created`,
    metadata: JSON.stringify({
      title,
      assigned_to,
      due_date,
      priority,
    }),
    created_at: new Date().toISOString(),
  });

  logger.info(`Task created: ${taskRecord.id}`);

  res.status(201).json({
    success: true,
    taskId: taskRecord.id,
    task: {
      id: taskRecord.id,
      title: taskRecord.title,
      description: taskRecord.description,
      assigned_to: taskRecord.assigned_to,
      due_date: taskRecord.due_date,
      priority: taskRecord.priority,
      lead_id: taskRecord.lead_id,
      status: taskRecord.status,
      created_at: taskRecord.created_at,
    },
  });
});

// POST /tasks/:id/complete - Mark task as completed
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;

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

  // Update task status to completed
  const updatedTask = await pb.collection('tasks').update(id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });

  // Create activity log entry
  await pb.collection('activity_logs').create({
    entity_type: 'task',
    entity_id: id,
    action: 'updated',
    description: `Task "${task.title}" marked as completed`,
    metadata: JSON.stringify({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }),
    created_at: new Date().toISOString(),
  });

  // Create notification for task creator
  if (task.created_by) {
    await pb.collection('notifications').create({
      user_id: task.created_by,
      type: 'task_completed',
      title: 'Task Completed',
      message: `Task "${task.title}" has been completed`,
      related_entity_type: 'task',
      related_entity_id: id,
      read: false,
      created_at: new Date().toISOString(),
    });
  }

  logger.info(`Task completed: ${id}`);

  res.json({
    success: true,
    task: {
      id: updatedTask.id,
      title: updatedTask.title,
      status: updatedTask.status,
      completed_at: updatedTask.completed_at,
    },
  });
});

// POST /tasks/:id/assign - Assign task to a team member
router.post('/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  if (!id || !assigned_to) {
    return res.status(400).json({
      error: 'Missing required fields: id, assigned_to',
    });
  }

  // Get task record
  const task = await pb.collection('tasks').getOne(id);

  if (!task) {
    throw new Error('Task not found');
  }

  // Update task assigned_to field
  const updatedTask = await pb.collection('tasks').update(id, {
    assigned_to,
  });

  // Create activity log entry
  await pb.collection('activity_logs').create({
    entity_type: 'task',
    entity_id: id,
    action: 'updated',
    description: `Task "${task.title}" assigned to ${assigned_to}`,
    metadata: JSON.stringify({
      assigned_to,
    }),
    created_at: new Date().toISOString(),
  });

  // Create notification for assigned user
  await pb.collection('notifications').create({
    user_id: assigned_to,
    type: 'task_assigned',
    title: 'Task Assigned',
    message: `You have been assigned task: "${task.title}"`,
    related_entity_type: 'task',
    related_entity_id: id,
    read: false,
    created_at: new Date().toISOString(),
  });

  logger.info(`Task assigned: ${id} to ${assigned_to}`);

  res.json({
    success: true,
    task: {
      id: updatedTask.id,
      title: updatedTask.title,
      assigned_to: updatedTask.assigned_to,
    },
  });
});

export default router;