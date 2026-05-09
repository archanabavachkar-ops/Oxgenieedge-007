import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate username format (6-20 chars, alphanumeric and underscore)
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;
  return usernameRegex.test(username);
};

// Helper function to validate password (min 8 chars, uppercase, lowercase, numbers)
const isValidPassword = (password) => {
  if (password.length < 8) {
    return false;
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumbers;
};

// Helper function to generate userId
const generateUserId = () => {
  const randomBytes = crypto.randomBytes(4).toString('hex');
  return `USER-${randomBytes.toUpperCase()}`;
};

// Helper function to check email uniqueness (excluding current user)
const isEmailUnique = async (email, excludeUserId = null) => {
  try {
    const existing = await pb.collection('crm_users').getFirstListItem(`email = "${email}"`);
    if (excludeUserId && existing.userId === excludeUserId) {
      return true; // Same user, so it's unique
    }
    return false; // Email exists
  } catch (error) {
    if (error.status === 404) {
      return true; // Email doesn't exist
    }
    throw error;
  }
};

// Helper function to check username uniqueness (excluding current user)
const isUsernameUnique = async (username, excludeUserId = null) => {
  try {
    const existing = await pb.collection('crm_users').getFirstListItem(`loginUsername = "${username}"`);
    if (excludeUserId && existing.userId === excludeUserId) {
      return true; // Same user, so it's unique
    }
    return false; // Username exists
  } catch (error) {
    if (error.status === 404) {
      return true; // Username doesn't exist
    }
    throw error;
  }
};

// POST /crm-users/create - Create a new CRM user
router.post('/create', async (req, res) => {
  const { fullName, email, role, department, phone, loginUsername, password } = req.body;

  // Validate required fields
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'fullName',
      message: 'Full name is required and must not be empty',
    });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'email',
      message: 'Valid email address is required',
    });
  }

  if (!role || typeof role !== 'string' || role.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'role',
      message: 'Role is required',
    });
  }

  if (!department || typeof department !== 'string' || department.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'department',
      message: 'Department is required',
    });
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'phone',
      message: 'Phone number is required',
    });
  }

  if (!loginUsername || !isValidUsername(loginUsername)) {
    return res.status(400).json({
      success: false,
      error: 'loginUsername',
      message: 'Username must be 6-20 characters (alphanumeric and underscore only)',
    });
  }

  if (!password || !isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      error: 'password',
      message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
    });
  }

  // Check email uniqueness
  const emailUnique = await isEmailUnique(email);
  if (!emailUnique) {
    return res.status(409).json({
      success: false,
      error: 'email',
      message: 'Email already exists',
    });
  }

  // Check username uniqueness
  const usernameUnique = await isUsernameUnique(loginUsername);
  if (!usernameUnique) {
    return res.status(409).json({
      success: false,
      error: 'loginUsername',
      message: 'Username already exists',
    });
  }

  // Generate userId
  const userId = generateUserId();

  // Hash password with bcrypt (cost 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create record in crm_users collection
  const userRecord = await pb.collection('crm_users').create({
    userId,
    fullName: fullName.trim(),
    email: email.trim(),
    role: role.trim(),
    department: department.trim(),
    phone: phone.trim(),
    loginUsername: loginUsername.trim(),
    loginPassword: hashedPassword,
    status: 'Active',
    createdDate: new Date().toISOString(),
    createdBy: req.pocketbaseUserId || 'system',
  });

  logger.info(`CRM user created: ${userId} - ${fullName}`);

  res.status(201).json({
    success: true,
    userId,
    message: 'User created successfully',
  });
});

// GET /crm-users/list - Fetch all CRM users
router.get('/list', async (req, res) => {
  const users = await pb.collection('crm_users').getFullList();

  const userList = users.map((user) => ({
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department,
    status: user.status,
    lastLoginDate: user.lastLoginDate || null,
  }));

  logger.info(`CRM users list retrieved: ${userList.length} users`);

  res.json({
    success: true,
    users: userList,
    count: userList.length,
  });
});

// GET /crm-users/:userId - Fetch single CRM user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId',
      message: 'User ID is required',
    });
  }

  let user;
  try {
    user = await pb.collection('crm_users').getFirstListItem(`userId = "${userId}"`);
  } catch (error) {
    if (error.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }

  logger.info(`CRM user retrieved: ${userId}`);

  res.json({
    success: true,
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      loginUsername: user.loginUsername,
      status: user.status,
      createdDate: user.createdDate,
      createdBy: user.createdBy,
      updatedDate: user.updatedDate || null,
      updatedBy: user.updatedBy || null,
      lastLoginDate: user.lastLoginDate || null,
    },
  });
});

// PUT /crm-users/:userId - Update CRM user
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { fullName, email, role, department, phone, loginUsername, password, status } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId',
      message: 'User ID is required',
    });
  }

  // Get existing user
  let existingUser;
  try {
    existingUser = await pb.collection('crm_users').getFirstListItem(`userId = "${userId}"`);
  } catch (error) {
    if (error.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }

  // Validate and prepare update data
  const updateData = {};

  if (fullName !== undefined) {
    if (typeof fullName !== 'string' || fullName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'fullName',
        message: 'Full name must not be empty',
      });
    }
    updateData.fullName = fullName.trim();
  }

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'email',
        message: 'Valid email address is required',
      });
    }
    // Check email uniqueness (exclude current user)
    const emailUnique = await isEmailUnique(email, userId);
    if (!emailUnique) {
      return res.status(409).json({
        success: false,
        error: 'email',
        message: 'Email already exists',
      });
    }
    updateData.email = email.trim();
  }

  if (role !== undefined) {
    if (typeof role !== 'string' || role.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'role',
        message: 'Role must not be empty',
      });
    }
    updateData.role = role.trim();
  }

  if (department !== undefined) {
    if (typeof department !== 'string' || department.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'department',
        message: 'Department must not be empty',
      });
    }
    updateData.department = department.trim();
  }

  if (phone !== undefined) {
    if (typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'phone',
        message: 'Phone must not be empty',
      });
    }
    updateData.phone = phone.trim();
  }

  if (loginUsername !== undefined) {
    if (!isValidUsername(loginUsername)) {
      return res.status(400).json({
        success: false,
        error: 'loginUsername',
        message: 'Username must be 6-20 characters (alphanumeric and underscore only)',
      });
    }
    // Check username uniqueness (exclude current user)
    const usernameUnique = await isUsernameUnique(loginUsername, userId);
    if (!usernameUnique) {
      return res.status(409).json({
        success: false,
        error: 'loginUsername',
        message: 'Username already exists',
      });
    }
    updateData.loginUsername = loginUsername.trim();
  }

  if (password !== undefined) {
    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'password',
        message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.loginPassword = hashedPassword;
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || status.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'status',
        message: 'Status must not be empty',
      });
    }
    updateData.status = status.trim();
  }

  // Add update metadata
  updateData.updatedDate = new Date().toISOString();
  updateData.updatedBy = req.pocketbaseUserId || 'system';

  // Update record in crm_users collection
  await pb.collection('crm_users').update(existingUser.id, updateData);

  logger.info(`CRM user updated: ${userId}`);

  res.json({
    success: true,
    message: 'User updated successfully',
  });
});

// DELETE /crm-users/:userId - Delete CRM user
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId',
      message: 'User ID is required',
    });
  }

  // Get existing user
  let existingUser;
  try {
    existingUser = await pb.collection('crm_users').getFirstListItem(`userId = "${userId}"`);
  } catch (error) {
    if (error.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }

  // Delete record from crm_users collection
  await pb.collection('crm_users').delete(existingUser.id);

  logger.info(`CRM user deleted: ${userId}`);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// GET /crm-users/check-email/:email - Check if email exists
router.get('/check-email/:email', async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'email',
      message: 'Email is required',
    });
  }

  try {
    await pb.collection('crm_users').getFirstListItem(`email = "${email}"`);
    logger.info(`Email check: ${email} exists`);
    res.json({
      exists: true,
    });
  } catch (error) {
    if (error.status === 404) {
      logger.info(`Email check: ${email} does not exist`);
      res.json({
        exists: false,
      });
    } else {
      throw error;
    }
  }
});

// GET /crm-users/check-username/:username - Check if username exists
router.get('/check-username/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({
      success: false,
      error: 'username',
      message: 'Username is required',
    });
  }

  try {
    await pb.collection('crm_users').getFirstListItem(`loginUsername = "${username}"`);
    logger.info(`Username check: ${username} exists`);
    res.json({
      exists: true,
    });
  } catch (error) {
    if (error.status === 404) {
      logger.info(`Username check: ${username} does not exist`);
      res.json({
        exists: false,
      });
    } else {
      throw error;
    }
  }
});

export default router;