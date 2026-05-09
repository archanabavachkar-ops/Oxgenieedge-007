import express from 'express';
import bcrypt from 'bcrypt';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to generate Partner ID
const generatePartnerId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PARTNER-${randomStr}`;
};

// Helper function to generate username
const generateUsername = (firstName, lastName) => {
  const first3 = firstName.substring(0, 3).toLowerCase();
  const last3 = lastName.substring(0, 3).toLowerCase();
  const random4 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${first3}${last3}${random4}`;
};

// Helper function to generate random password
const generatePassword = () => {
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
  return password;
};

// POST /applications/:applicationId/approve - Approve partner application
router.post('/:applicationId/approve', async (req, res) => {
  const { applicationId } = req.params;
  const { accountManager } = req.body;

  if (!applicationId) {
    return res.status(400).json({
      error: 'Missing required field: applicationId',
    });
  }

  // Fetch application record
  const application = await pb.collection('partner_applications').getFirstListItem(
    `applicationId = "${applicationId}"`
  );

  if (!application) {
    throw new Error('Application not found');
  }

  // Parse full name to extract first and last name
  const nameParts = application.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';

  // Generate Partner ID
  const partnerId = generatePartnerId();

  // Generate username
  const username = generateUsername(firstName, lastName);

  // Generate password
  const password = generatePassword();

  // Hash password using bcrypt (cost factor 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new partner record
  const partnerRecord = await pb.collection('partners').create({
    partnerId,
    name: application.fullName,
    email: application.email,
    mobileNumber: application.mobileNumber,
    companyName: application.companyName,
    businessType: application.businessType,
    businessDescription: application.whyPartner || '',
    loginUsername: username,
    loginPassword: hashedPassword,
    accountManager: accountManager || '',
    status: 'Active',
    welcomeEmailSent: false,
    dashboardActivated: false,
    createdDate: new Date().toISOString(),
  });

  logger.info(`Partner created: ${partnerId} from application ${applicationId}`);

  // Update application record
  await pb.collection('partner_applications').update(application.id, {
    status: 'Approved',
    approvedDate: new Date().toISOString(),
    approvedBy: req.pocketbaseUserId || 'system',
    partnerId,
  });

  logger.info(`Application approved: ${applicationId}`);

  // Create activity log entry
  await pb.collection('activity_logs').create({
    applicationId,
    partnerId,
    action: 'Partner Application Approved',
    actionDetails: `Partner application ${applicationId} approved and partner account created`,
    performedBy: req.pocketbaseUserId || 'system',
    performedByName: 'Admin',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Activity log created: Partner Application Approved for ${applicationId}`);

  res.json({
    success: true,
    partnerId,
    username,
    password,
  });
});

// POST /applications/:applicationId/reject - Reject partner application
router.post('/:applicationId/reject', async (req, res) => {
  const { applicationId } = req.params;
  const { rejectionReason } = req.body;

  if (!applicationId) {
    return res.status(400).json({
      error: 'Missing required field: applicationId',
    });
  }

  // Fetch application record
  const application = await pb.collection('partner_applications').getFirstListItem(
    `applicationId = "${applicationId}"`
  );

  if (!application) {
    throw new Error('Application not found');
  }

  // Update application record
  await pb.collection('partner_applications').update(application.id, {
    status: 'Rejected',
    rejectionReason: rejectionReason || '',
    rejectedDate: new Date().toISOString(),
    rejectedBy: req.pocketbaseUserId || 'system',
  });

  logger.info(`Application rejected: ${applicationId}`);

  // Create activity log entry
  await pb.collection('activity_logs').create({
    applicationId,
    action: 'Partner Application Rejected',
    actionDetails: `Partner application ${applicationId} rejected. Reason: ${rejectionReason || 'Not specified'}`,
    performedBy: req.pocketbaseUserId || 'system',
    performedByName: 'Admin',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Activity log created: Partner Application Rejected for ${applicationId}`);

  res.json({
    success: true,
  });
});

// PUT /applications/:applicationId/assign-manager - Assign account manager
router.put('/:applicationId/assign-manager', async (req, res) => {
  const { applicationId } = req.params;
  const { accountManager } = req.body;

  if (!applicationId) {
    return res.status(400).json({
      error: 'Missing required field: applicationId',
    });
  }

  if (!accountManager) {
    return res.status(400).json({
      error: 'Missing required field: accountManager',
    });
  }

  // Fetch application record
  const application = await pb.collection('partner_applications').getFirstListItem(
    `applicationId = "${applicationId}"`
  );

  if (!application) {
    throw new Error('Application not found');
  }

  // Find partner record by applicationId
  const partners = await pb.collection('partners').getFullList({
    filter: `applicationId = "${applicationId}"`,
  });

  if (partners.length === 0) {
    throw new Error('Partner record not found for this application');
  }

  const partner = partners[0];

  // Update partners collection record
  await pb.collection('partners').update(partner.id, {
    accountManager,
    updatedDate: new Date().toISOString(),
  });

  logger.info(`Account manager assigned to partner: ${partner.partnerId}`);

  // Create activity log entry
  await pb.collection('activity_logs').create({
    applicationId,
    partnerId: partner.partnerId,
    action: 'Account Manager Assigned',
    actionDetails: `Account manager ${accountManager} assigned to partner ${partner.partnerId}`,
    performedBy: req.pocketbaseUserId || 'system',
    performedByName: 'Admin',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Activity log created: Account Manager Assigned for ${applicationId}`);

  res.json({
    success: true,
  });
});

// DELETE /applications/:applicationId - Delete application
router.delete('/:applicationId', async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      error: 'Missing required field: applicationId',
    });
  }

  // Fetch application record
  const application = await pb.collection('partner_applications').getFirstListItem(
    `applicationId = "${applicationId}"`
  );

  if (!application) {
    throw new Error('Application not found');
  }

  // Delete application record
  await pb.collection('partner_applications').delete(application.id);

  logger.info(`Application deleted: ${applicationId}`);

  // Create activity log entry
  await pb.collection('activity_logs').create({
    applicationId,
    action: 'Partner Application Deleted',
    actionDetails: `Partner application ${applicationId} deleted`,
    performedBy: req.pocketbaseUserId || 'system',
    performedByName: 'Admin',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Activity log created: Partner Application Deleted for ${applicationId}`);

  res.json({
    success: true,
  });
});

// GET /applications/list - Fetch all applications
router.get('/list', async (req, res) => {
  // Fetch all applications sorted by createdDate (newest first)
  const applications = await pb.collection('partner_applications').getFullList({
    sort: '-created',
  });

  const applicationList = applications.map((app) => ({
    applicationId: app.applicationId,
    fullName: app.fullName,
    email: app.email,
    companyName: app.companyName,
    businessType: app.businessType,
    status: app.status,
    createdDate: app.created,
    accountManager: app.accountManager || '',
  }));

  logger.info(`Applications list retrieved: ${applicationList.length} applications`);

  res.json(applicationList);
});

// GET /applications/:applicationId - Fetch single application
router.get('/:applicationId', async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      error: 'Missing required field: applicationId',
    });
  }

  // Fetch application record
  const application = await pb.collection('partner_applications').getFirstListItem(
    `applicationId = "${applicationId}"`
  );

  if (!application) {
    throw new Error('Application not found');
  }

  logger.info(`Application retrieved: ${applicationId}`);

  res.json({
    applicationId: application.applicationId,
    fullName: application.fullName,
    email: application.email,
    phone: application.mobileNumber,
    companyName: application.companyName,
    businessType: application.businessType,
    businessDescription: application.whyPartner || '',
    website: application.website || '',
    status: application.status,
    createdDate: application.created,
    accountManager: application.accountManager || '',
    notes: application.notes || '',
  });
});

export default router;