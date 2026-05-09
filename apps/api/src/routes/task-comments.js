import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to parse mentions from content
const parseMentions = (content) => {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

// POST /task-comments/:task_id/comment - Add a comment to a task
router.post('/:task_id/comment', async (req, res) => {
  const { task_id } = req.params;
  const { content, mentions } = req.body;

  if (!task_id || !content) {
    return res.status(400).json({
      error: 'Missing required fields: task_id, content',
    });
  }

  // Get task record to verify it exists
  const task = await pb.collection('tasks').getOne(task_id);

  if (!task) {
    throw new Error('Task not found');
  }

  // Create task_comments record
  const commentRecord = await pb.collection('task_comments').create({
    task_id,
    content,
    mentions: mentions && Array.isArray(mentions) ? JSON.stringify(mentions) : '[]',
    created_at: new Date().toISOString(),
  });

  // Parse mentions from content if not explicitly provided
  let mentionedUsers = mentions || [];
  if (!mentions || mentions.length === 0) {
    mentionedUsers = parseMentions(content);
  }

  // Create notifications for mentioned users
  for (const mentionedUser of mentionedUsers) {
    await pb.collection('notifications').create({
      user_id: mentionedUser,
      type: 'mention',
      title: 'You were mentioned',
      message: `You were mentioned in a comment on task "${task.title}"`,
      related_entity_type: 'task_comment',
      related_entity_id: commentRecord.id,
      read: false,
      created_at: new Date().toISOString(),
    });
  }

  // Create activity log entry
  await pb.collection('activity_logs').create({
    entity_type: 'task_comment',
    entity_id: commentRecord.id,
    action: 'created',
    description: `Comment added to task "${task.title}"`,
    metadata: JSON.stringify({
      task_id,
      mentions: mentionedUsers,
    }),
    created_at: new Date().toISOString(),
  });

  logger.info(`Comment added to task ${task_id}: ${commentRecord.id}`);

  res.status(201).json({
    success: true,
    commentId: commentRecord.id,
    comment: {
      id: commentRecord.id,
      task_id: commentRecord.task_id,
      content: commentRecord.content,
      mentions: mentionedUsers,
      created_at: commentRecord.created_at,
    },
  });
});

export default router;