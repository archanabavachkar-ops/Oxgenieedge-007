import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * GET /pocketbase/verify
 * Verify JWT token and return user data
 */
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);

  // Set token in PocketBase auth store
  pb.authStore.save(token);

  // Check if token is valid
  if (!pb.authStore.isValid) {
    pb.authStore.clear();
    throw new Error('Token invalid or expired');
  }

  const authRecord = pb.authStore.record;

  if (!authRecord) {
    throw new Error('Token invalid or expired');
  }

  logger.info('Token verification successful', {
    userId: authRecord.id,
    email: authRecord.email,
  });

  // Return user data
  return res.status(200).json({
    valid: true,
    user: {
      id: authRecord.id,
      email: authRecord.email,
      name: authRecord.name || '',
      role: authRecord.role || 'user',
    },
  });
});

/**
 * GET /pocketbase/refresh
 * Refresh JWT token using current token
 */
router.get('/refresh', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7);

  // Set token in PocketBase auth store
  pb.authStore.save(token);

  // Check if token is valid before attempting refresh
  if (!pb.authStore.isValid) {
    pb.authStore.clear();
    throw new Error('Token invalid or expired - cannot refresh');
  }

  // Refresh the token via PocketBase
  const refreshedAuth = await pb.collection('users').authRefresh();

  logger.info('Token refresh successful', {
    userId: refreshedAuth.record.id,
    email: refreshedAuth.record.email,
  });

  // Return new token and user data
  return res.status(200).json({
    success: true,
    token: refreshedAuth.token,
    user: {
      id: refreshedAuth.record.id,
      email: refreshedAuth.record.email,
      name: refreshedAuth.record.name || '',
      role: refreshedAuth.record.role || 'user',
    },
  });
});

export default router;