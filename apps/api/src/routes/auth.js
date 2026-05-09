import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /auth/login
 * Authenticate user with email and password
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields: email, password',
    });
  }

  // Authenticate with PocketBase
  await pb.collection('users').authWithPassword(email, password);

  logger.info('User logged in', { email });

  res.json({
    user: pb.authStore.model,
    token: pb.authStore.token,
    refreshToken: pb.authStore.refreshToken,
  });
});

/**
 * GET /pocketbase/verify
 * Verify if user is authenticated
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
    throw new Error('Invalid or expired token');
  }

  logger.info('Token verified', { userId: pb.authStore.model?.id });

  res.json({
    authenticated: true,
    user: pb.authStore.model,
    token: pb.authStore.token,
  });
});

/**
 * GET /pocketbase/refresh
 * Refresh expired authentication token
 */
router.get('/refresh', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const refreshToken = authHeader.substring(7);

  // Set refresh token in PocketBase auth store
  pb.authStore.save(refreshToken);

  // Refresh the token via PocketBase
  const refreshedAuth = await pb.collection('users').authRefresh();

  logger.info('Token refreshed', { userId: refreshedAuth.record?.id });

  res.json({
    token: refreshedAuth.token,
    expiresIn: 3600,
  });
});

/**
 * POST /auth/logout
 * Logout user and clear auth store
 */
router.post('/logout', async (req, res) => {
  pb.authStore.clear();

  logger.info('User logged out');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * POST /auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new Error('Missing required fields: email, password, name');
  }

  // Create user in PocketBase
  await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name,
  });

  // Auto-login after registration
  await pb.collection('users').authWithPassword(email, password);

  logger.info('User registered and logged in', { email });

  res.status(201).json({
    user: pb.authStore.model,
    token: pb.authStore.token,
    refreshToken: pb.authStore.refreshToken,
  });
});

export default router;