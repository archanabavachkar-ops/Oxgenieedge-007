import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to generate unique Partner ID
const generatePartnerId = async () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const partnerId = `PARTNER-${dateStr}-${randomStr}`;

  // Check uniqueness
  const existing = await pb.collection('partners').getFullList({
    filter: `partnerId = "${partnerId}"`,
  }).catch(() => []);

  if (existing.length > 0) {
    // Recursively generate a new one if duplicate
    return generatePartnerId();
  }

  return partnerId;
};

// Helper function to generate credentials
const generateCredentials = (companyName) => {
  // Generate username: company name (lowercase, remove spaces) + 4 random digits
  const baseUsername = companyName.toLowerCase().replace(/\s+/g, '');
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const username = `${baseUsername}${randomDigits}`;

  // Generate password: 12 characters (mix of uppercase, lowercase, numbers, special chars)
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + specialChars;

  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill the rest randomly
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  return { username, password };
};

// Helper function to generate JWT-like token
const generateToken = (partnerId) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    partnerId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  })).toString('base64');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64');
  return `${header}.${payload}.${signature}`;
};

// Helper function to extract partner ID from JWT token
const extractPartnerIdFromToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.partnerId;
  } catch (error) {
    logger.warn(`Failed to extract partner ID from token: ${error.message}`);
    return null;
  }
};

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// POST /partners/generate-id - Generate unique Partner ID
router.post('/generate-id', async (req, res) => {
  const partnerId = await generatePartnerId();

  logger.info(`Partner ID generated: ${partnerId}`);

  res.json({
    partnerId,
  });
});

// POST /partners/generate-credentials - Generate username and password
router.post('/generate-credentials', async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
    return res.status(400).json({
      error: 'Missing or invalid required field: companyName',
    });
  }

  const { username, password } = generateCredentials(companyName);

  logger.info(`Credentials generated for company: ${companyName}`);

  res.json({
    username,
    password,
  });
});

// POST /partners/login - Partner login
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  if (!email && !username) {
    return res.status(400).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  let partner = null;

  try {
    if (email) {
      // Search by email
      logger.info(`Partner login attempt with email: ${email}`);
      const partners = await pb.collection('partners').getFullList({
        filter: `email = "${email}"`,
      });
      if (partners.length > 0) {
        partner = partners[0];
        logger.info(`Partner found by email: ${partner.id}`);
      } else {
        logger.warn(`No partner found with email: ${email}`);
      }
    } else if (username) {
      // Search by username
      logger.info(`Partner login attempt with username: ${username}`);
      const partners = await pb.collection('partners').getFullList({
        filter: `username = "${username}"`,
      });
      if (partners.length > 0) {
        partner = partners[0];
        logger.info(`Partner found by username: ${partner.id}`);
      } else {
        logger.warn(`No partner found with username: ${username}`);
      }
    }
  } catch (error) {
    logger.error(`Partner lookup error: ${error.message}`);
    // Return generic error for security
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  if (!partner) {
    logger.warn(`Login attempt with non-existent ${email ? 'email' : 'username'}: ${email || username}`);
    // Return generic error for security - don't reveal if email/username exists
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Verify password
  let passwordMatch = false;
  try {
    const storedPassword = partner.passwordHash || partner.loginPassword || '';
    logger.info(`Comparing password for partner: ${partner.id}`);
    passwordMatch = await bcrypt.compare(password, storedPassword);
    logger.info(`Password comparison result: ${passwordMatch}`);
  } catch (error) {
    logger.error(`Password comparison error: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  if (!passwordMatch) {
    logger.warn(`Failed login attempt for partner: ${partner.id}`);
    // Return generic error for security
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Generate token
  const token = generateToken(partner.id);
  logger.info(`JWT token generated for partner: ${partner.id}`);

  // Update last login
  await pb.collection('partners').update(partner.id, {
    lastLogin: new Date().toISOString(),
  });

  logger.info(`Partner logged in successfully: ${partner.id}`);

  res.json({
    success: true,
    token,
    partner: {
      id: partner.id,
      partnerId: partner.partnerId,
      name: partner.fullName || partner.companyName,
      email: partner.email,
      company: partner.companyName,
    },
  });
});

// GET /partners/me - Get current partner profile
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const partnerId = extractPartnerIdFromToken(authHeader);

  if (!partnerId) {
    logger.warn('Unauthorized access attempt to /partners/me');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  logger.info(`Fetching partner profile: ${partnerId}`);

  // Query partners collection for partner with matching ID
  const partner = await pb.collection('partners').getOne(partnerId);

  if (!partner) {
    logger.warn(`Partner not found: ${partnerId}`);
    throw new Error('Partner not found');
  }

  logger.info(`Partner profile retrieved: ${partnerId}`);

  res.json({
    success: true,
    partner: {
      id: partner.id,
      partnerId: partner.partnerId,
      name: partner.fullName || partner.companyName,
      email: partner.email,
      phone: partner.mobileNumber || '',
      company: partner.companyName,
      businessType: partner.businessType || '',
      accountManager: partner.accountManager || '',
      status: partner.status || 'active',
      createdDate: partner.createdAt || partner.created,
      lastLogin: partner.lastLogin || null,
    },
  });
});

// PUT /partners/me - Update current partner profile
router.put('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const partnerId = extractPartnerIdFromToken(authHeader);

  if (!partnerId) {
    logger.warn('Unauthorized access attempt to PUT /partners/me');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  const { name, phone, company, businessType, businessDescription, website, address, city, state, country, postalCode } = req.body;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Name is required',
    });
  }

  if (!company || typeof company !== 'string' || company.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Company is required',
    });
  }

  if (!businessType || typeof businessType !== 'string' || businessType.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Business type is required',
    });
  }

  logger.info(`Updating partner profile: ${partnerId}`);

  // Get existing partner
  const partner = await pb.collection('partners').getOne(partnerId);

  if (!partner) {
    logger.warn(`Partner not found: ${partnerId}`);
    throw new Error('Partner not found');
  }

  // Build update data
  const updateData = {
    fullName: name.trim(),
    companyName: company.trim(),
    businessType: businessType.trim(),
    mobileNumber: phone ? phone.trim() : partner.mobileNumber,
    businessDescription: businessDescription ? businessDescription.trim() : partner.businessDescription,
    website: website ? website.trim() : partner.website,
    address: address ? address.trim() : partner.address,
    city: city ? city.trim() : partner.city,
    state: state ? state.trim() : partner.state,
    country: country ? country.trim() : partner.country,
    postalCode: postalCode ? postalCode.trim() : partner.postalCode,
  };

  // Update partner record
  const updatedPartner = await pb.collection('partners').update(partnerId, updateData);

  logger.info(`Partner profile updated: ${partnerId}`);

  res.json({
    success: true,
    partner: {
      id: updatedPartner.id,
      partnerId: updatedPartner.partnerId,
      name: updatedPartner.fullName || updatedPartner.companyName,
      email: updatedPartner.email,
      phone: updatedPartner.mobileNumber || '',
      company: updatedPartner.companyName,
      businessType: updatedPartner.businessType || '',
      businessDescription: updatedPartner.businessDescription || '',
      website: updatedPartner.website || '',
      address: updatedPartner.address || '',
      city: updatedPartner.city || '',
      state: updatedPartner.state || '',
      country: updatedPartner.country || '',
      postalCode: updatedPartner.postalCode || '',
      accountManager: updatedPartner.accountManager || '',
      status: updatedPartner.status || 'active',
    },
  });
});

// POST /partners/change-password - Change partner password
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;
  const partnerId = extractPartnerIdFromToken(authHeader);

  if (!partnerId) {
    logger.warn('Unauthorized access attempt to POST /partners/change-password');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: currentPassword, newPassword',
    });
  }

  logger.info(`Password change requested for partner: ${partnerId}`);

  // Get partner record
  const partner = await pb.collection('partners').getOne(partnerId);

  if (!partner) {
    logger.warn(`Partner not found: ${partnerId}`);
    throw new Error('Partner not found');
  }

  // Verify current password
  let passwordMatch = false;
  try {
    const storedPassword = partner.passwordHash || partner.loginPassword || '';
    passwordMatch = await bcrypt.compare(currentPassword, storedPassword);
    logger.info(`Current password verification result: ${passwordMatch}`);
  } catch (error) {
    logger.error(`Password comparison error: ${error.message}`);
    throw error;
  }

  if (!passwordMatch) {
    logger.warn(`Incorrect current password for partner: ${partnerId}`);
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect',
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update partner record with new password
  await pb.collection('partners').update(partnerId, {
    passwordHash: hashedPassword,
    loginPassword: hashedPassword,
  });

  logger.info(`Password changed successfully for partner: ${partnerId}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// GET /partners/activity - Get partner activity log
router.get('/activity', async (req, res) => {
  const authHeader = req.headers.authorization;
  const partnerId = extractPartnerIdFromToken(authHeader);

  if (!partnerId) {
    logger.warn('Unauthorized access attempt to GET /partners/activity');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  logger.info(`Fetching activity log for partner: ${partnerId}, limit: ${limit}`);

  // Query activity_logs collection filtered by partnerId
  const activities = await pb.collection('activity_logs').getFullList({
    filter: `partnerId = "${partnerId}"`,
    sort: '-createdAt',
    limit,
  }).catch(() => []);

  logger.info(`Retrieved ${activities.length} activity records for partner: ${partnerId}`);

  const formattedActivities = activities.map((activity) => ({
    action: activity.action || '',
    timestamp: formatRelativeTime(activity.createdAt || activity.created),
    description: activity.actionDetails || activity.description || '',
    createdAt: activity.createdAt || activity.created,
  }));

  res.json({
    success: true,
    activities: formattedActivities,
    count: formattedActivities.length,
  });
});

// POST /partners/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: email',
    });
  }

  let partner = null;

  try {
    const partners = await pb.collection('partners').getFullList({
      filter: `email = "${email}"`,
    });
    if (partners.length > 0) {
      partner = partners[0];
    }
  } catch (error) {
    logger.error(`Partner lookup error: ${error.message}`);
  }

  // Always return generic message for security (don't reveal if email exists)
  if (partner) {
    try {
      // Generate reset token
      const resetToken = crypto.randomBytes(16).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Update partner record with reset token
      await pb.collection('partners').update(partner.id, {
        resetToken,
        resetTokenExpiry,
      });

      logger.info(`Password reset token generated for partner: ${partner.id}`);

      // In production, send email via PocketBase hooks
      // The email would contain a link like: https://yourapp.com/reset-password?token={resetToken}
      logger.info(`Password reset email would be sent to: ${email}`);
    } catch (error) {
      logger.error(`Failed to generate reset token: ${error.message}`);
    }
  }

  // Always return success message for security
  res.json({
    success: true,
    message: 'If an account exists with this email, you will receive a password reset link',
  });
});

// POST /partners/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: token, newPassword',
    });
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters long',
    });
  }

  let partner = null;

  try {
    const partners = await pb.collection('partners').getFullList({
      filter: `resetToken = "${token}"`,
    });
    if (partners.length > 0) {
      partner = partners[0];
    }
  } catch (error) {
    logger.error(`Partner lookup error: ${error.message}`);
  }

  if (!partner) {
    logger.warn(`Password reset attempt with invalid token`);
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token',
    });
  }

  // Check if token has expired
  const tokenExpiry = new Date(partner.resetTokenExpiry);
  const now = new Date();

  if (now > tokenExpiry) {
    logger.warn(`Password reset attempt with expired token for partner: ${partner.id}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token',
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update partner record
  await pb.collection('partners').update(partner.id, {
    passwordHash: hashedPassword,
    loginPassword: hashedPassword,
    resetToken: '',
    resetTokenExpiry: '',
  });

  logger.info(`Password reset successfully for partner: ${partner.id}`);

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

// GET /partners/validate-reset-token/:token - Validate reset token
router.get('/validate-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      valid: false,
    });
  }

  let partner = null;

  try {
    const partners = await pb.collection('partners').getFullList({
      filter: `resetToken = "${token}"`,
    });
    if (partners.length > 0) {
      partner = partners[0];
    }
  } catch (error) {
    logger.error(`Partner lookup error: ${error.message}`);
  }

  if (!partner) {
    logger.warn(`Token validation failed: token not found`);
    return res.json({
      valid: false,
    });
  }

  // Check if token has expired
  const tokenExpiry = new Date(partner.resetTokenExpiry);
  const now = new Date();

  if (now > tokenExpiry) {
    logger.warn(`Token validation failed: token expired for partner: ${partner.id}`);
    return res.json({
      valid: false,
    });
  }

  logger.info(`Token validation successful for partner: ${partner.id}`);

  res.json({
    valid: true,
  });
});

// POST /partners/create - Create a new partner
router.post('/create', async (req, res) => {
  const {
    applicationId,
    fullName,
    companyName,
    email,
    mobileNumber,
    website,
    businessType,
    servicesOffered,
    region,
    country,
    accountManager,
    accountManagerEmail,
    accountManagerName,
  } = req.body;

  // Validate required fields
  if (
    !applicationId ||
    !fullName ||
    !companyName ||
    !email ||
    !mobileNumber ||
    !businessType ||
    !region ||
    !country
  ) {
    return res.status(400).json({
      error: 'Missing required fields: applicationId, fullName, companyName, email, mobileNumber, businessType, region, country',
    });
  }

  // Generate Partner ID
  const partnerId = await generatePartnerId();

  // Generate credentials
  const { username, password } = generateCredentials(companyName);

  // Hash password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create partner record
  const partnerRecord = await pb.collection('partners').create({
    partnerId,
    applicationId,
    fullName: fullName.trim(),
    companyName: companyName.trim(),
    email: email.trim(),
    mobileNumber: mobileNumber.trim(),
    website: website ? website.trim() : '',
    businessType: businessType.trim(),
    servicesOffered: typeof servicesOffered === 'string' ? servicesOffered : JSON.stringify(servicesOffered || []),
    region: region.trim(),
    country: country.trim(),
    username,
    passwordHash: hashedPassword,
    loginPassword: hashedPassword,
    accountManager: accountManager || '',
    accountManagerEmail: accountManagerEmail || '',
    accountManagerName: accountManagerName || '',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Partner created: ${partnerId} - ${companyName}`);

  // Create activity log entry: Credentials Created
  await pb.collection('activity_logs').create({
    partnerId,
    applicationId,
    action: 'Credentials Created',
    actionDetails: `Credentials generated for partner ${partnerId}`,
    performedBy: 'system',
    performedByName: 'System',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Activity log created: Credentials Created for ${partnerId}`);

  // Create activity log entry: Account Manager Assigned
  if (accountManager) {
    await pb.collection('activity_logs').create({
      partnerId,
      applicationId,
      action: 'Account Manager Assigned',
      actionDetails: `Account manager ${accountManagerName} assigned to partner ${partnerId}`,
      performedBy: 'system',
      performedByName: 'System',
      createdAt: new Date().toISOString(),
    });

    logger.info(`Activity log created: Account Manager Assigned for ${partnerId}`);
  }

  res.status(201).json({
    success: true,
    partnerId,
    username,
    password,
    accountManager: accountManager || null,
  });
});

export default router;