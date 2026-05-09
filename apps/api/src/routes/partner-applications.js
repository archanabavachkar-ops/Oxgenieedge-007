import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { uploadFiles } from '../middleware/file-upload.js';

const router = express.Router();

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate mobile format
const isValidMobile = (mobile) => {
  const mobileRegex = /^[+]?[0-9\s\-()]{10,}$/;
  return mobileRegex.test(mobile);
};

// Helper function to validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper function to generate application ID
const generateApplicationId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `PA-${timestamp}${random}`;
};

// Helper function to check for duplicate applications
const checkDuplicateEmail = async (email) => {
  const existing = await pb.collection('partner_applications').getFullList({
    filter: `email = "${email}"`,
  }).catch(() => []);
  return existing.length > 0;
};

const checkDuplicateMobile = async (mobileNumber) => {
  const existing = await pb.collection('partner_applications').getFullList({
    filter: `mobileNumber = "${mobileNumber}"`,
  }).catch(() => []);
  return existing.length > 0;
};

const checkDuplicateCompany = async (companyName) => {
  const existing = await pb.collection('partner_applications').getFullList({
    filter: `companyName = "${companyName}"`,
  }).catch(() => []);
  return existing.length > 0;
};

// Helper function to upload files to PocketBase
const uploadFilesToPocketBase = async (files) => {
  const uploadedFiles = [];

  if (!files || files.length === 0) {
    return uploadedFiles;
  }

  for (const file of files) {
    try {
      const blob = new Blob([file.buffer], { type: file.mimetype });
      const formData = new FormData();
      formData.append('file', blob, file.originalname);

      // Create a record with file attachment
      const uploadRecord = await pb.collection('partner_application_files').create({
        file: blob,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
      });

      uploadedFiles.push({
        file_id: uploadRecord.id,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
      });

      logger.info(`File uploaded: ${file.originalname}`);
    } catch (error) {
      logger.error(`Failed to upload file ${file.originalname}: ${error.message}`);
      throw new Error(`Failed to upload file ${file.originalname}`);
    }
  }

  return uploadedFiles;
};

// POST /partner-applications/submit - Submit partner application
router.post('/submit', uploadFiles({
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  fieldName: 'documents',
  maxCount: 10,
  maxSizeMB: 5,
}), async (req, res) => {
  const {
    fullName,
    companyName,
    email,
    mobileNumber,
    website,
    businessType,
    servicesOffered,
    region,
    country,
    whyPartner,
    termsAccepted,
  } = req.body;

  // Validate fullName
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'fullName',
      message: 'Full name is required and must be at least 2 characters',
    });
  }

  // Validate companyName
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'companyName',
      message: 'Company name is required and must be at least 2 characters',
    });
  }

  // Validate email
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'email',
      message: 'Valid email address is required',
    });
  }

  // Validate mobileNumber
  if (!mobileNumber || !isValidMobile(mobileNumber)) {
    return res.status(400).json({
      success: false,
      error: 'mobileNumber',
      message: 'Valid mobile number is required',
    });
  }

  // Validate website if provided
  if (website && website.trim() && !isValidUrl(website)) {
    return res.status(400).json({
      success: false,
      error: 'website',
      message: 'Invalid website URL format',
    });
  }

  // Validate businessType
  if (!businessType || typeof businessType !== 'string' || businessType.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'businessType',
      message: 'Business type is required',
    });
  }

  // Validate servicesOffered
  let parsedServices = [];
  if (typeof servicesOffered === 'string') {
    try {
      parsedServices = JSON.parse(servicesOffered);
    } catch {
      parsedServices = [servicesOffered];
    }
  } else if (Array.isArray(servicesOffered)) {
    parsedServices = servicesOffered;
  }

  if (!Array.isArray(parsedServices) || parsedServices.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'servicesOffered',
      message: 'At least one service must be selected',
    });
  }

  // Validate region
  if (!region || typeof region !== 'string' || region.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'region',
      message: 'Region is required',
    });
  }

  // Validate country
  if (!country || typeof country !== 'string' || country.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'country',
      message: 'Country is required',
    });
  }

  // Validate whyPartner
  if (!whyPartner || typeof whyPartner !== 'string' || whyPartner.trim().length < 20 || whyPartner.trim().length > 500) {
    return res.status(400).json({
      success: false,
      error: 'whyPartner',
      message: 'Partnership motivation must be between 20 and 500 characters',
    });
  }

  // Validate termsAccepted
  if (termsAccepted !== 'true' && termsAccepted !== true) {
    return res.status(400).json({
      success: false,
      error: 'termsAccepted',
      message: 'You must accept the terms and conditions',
    });
  }

  // Check for duplicate email
  const emailExists = await checkDuplicateEmail(email);
  if (emailExists) {
    return res.status(409).json({
      success: false,
      error: 'email',
      message: 'Email already registered',
    });
  }

  // Check for duplicate mobile
  const mobileExists = await checkDuplicateMobile(mobileNumber);
  if (mobileExists) {
    return res.status(409).json({
      success: false,
      error: 'mobileNumber',
      message: 'Mobile number already registered',
    });
  }

  // Check for duplicate company
  const companyExists = await checkDuplicateCompany(companyName);
  if (companyExists) {
    return res.status(409).json({
      success: false,
      error: 'companyName',
      message: 'Company already registered',
    });
  }

  // Generate application ID
  const applicationId = generateApplicationId();

  // Upload files if provided
  let uploadedFiles = [];
  if (req.files && req.files.length > 0) {
    uploadedFiles = await uploadFilesToPocketBase(req.files);
  }

  // Create partner_applications record
  const applicationRecord = await pb.collection('partner_applications').create({
    fullName: fullName.trim(),
    companyName: companyName.trim(),
    email: email.trim(),
    mobileNumber: mobileNumber.trim(),
    website: website ? website.trim() : '',
    businessType: businessType.trim(),
    servicesOffered: JSON.stringify(parsedServices),
    region: region.trim(),
    country: country.trim(),
    whyPartner: whyPartner.trim(),
    termsAccepted: true,
    applicationId,
    status: 'New',
    source: 'website',
    submittedDate: new Date().toISOString(),
    aiScore: 0,
    aiRecommendation: null,
    riskLevel: null,
    autoTags: JSON.stringify([]),
    uploadedFiles: JSON.stringify(uploadedFiles),
  });

  logger.info(`Partner application submitted: ${applicationId} - ${companyName}`);

  // Trigger AI scoring
  try {
    await fetch('http://localhost:3001/hcgi/api/partner-applications/ai-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationId }),
    });
  } catch (error) {
    logger.warn(`Failed to trigger AI scoring for ${applicationId}: ${error.message}`);
  }

  res.status(200).json({
    success: true,
    message: 'Partner application submitted successfully',
    applicationId,
    confirmation: {
      fullName: applicationRecord.fullName,
      companyName: applicationRecord.companyName,
      email: applicationRecord.email,
      submittedDate: applicationRecord.submittedDate,
      status: applicationRecord.status,
    },
  });
});

// POST /partner-applications/approve - Approve a partner application
router.post('/approve', async (req, res) => {
  const { applicationId, accountManager, accountManagerEmail, accountManagerName } = req.body;

  if (!applicationId) {
    return res.status(400).json({
      error: 'Missing required field: applicationId',
    });
  }

  // Fetch the application record
  const application = await pb.collection('partner_applications').getFirstListItem(
    `applicationId = "${applicationId}"`
  );

  if (!application) {
    throw new Error('Application not found');
  }

  // Extract data from application
  const {
    fullName,
    companyName,
    email,
    mobileNumber,
    website,
    businessType,
    servicesOffered,
    region,
    country,
  } = application;

  // Call POST /partners/create with extracted data
  const createPartnerResponse = await fetch('http://localhost:3001/hcgi/api/partners/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
      accountManager: accountManager || '',
      accountManagerEmail: accountManagerEmail || '',
      accountManagerName: accountManagerName || '',
    }),
  });

  if (!createPartnerResponse.ok) {
    throw new Error('Failed to create partner account');
  }

  const partnerData = await createPartnerResponse.json();

  // Update the application record: set status='Approved'
  await pb.collection('partner_applications').update(application.id, {
    status: 'Approved',
  });

  logger.info(`Partner application approved: ${applicationId}`);

  // Create activity log entry: Application Approved
  await pb.collection('activity_logs').create({
    applicationId,
    partnerId: partnerData.partnerId,
    action: 'Application Approved',
    actionDetails: `Partner application ${applicationId} approved and partner account created`,
    performedBy: 'system',
    performedByName: 'System',
    createdAt: new Date().toISOString(),
  });

  logger.info(`Activity log created: Application Approved for ${applicationId}`);

  res.json({
    success: true,
    message: 'Partner application approved successfully',
    partnerId: partnerData.partnerId,
    username: partnerData.username,
    password: partnerData.password,
  });
});

// POST /partner-applications/ai-score - Score a partner application using AI
router.post('/ai-score', async (req, res) => {
  const { applicationId } = req.body;

  if (!applicationId) {
    return res.status(400).json({
      success: false,
      error: 'applicationId',
      message: 'Application ID is required',
    });
  }

  // Retrieve application from partner_applications collection
  const application = await pb.collection('partner_applications').getFirstListItem(
    `applicationId = "${applicationId}"`
  );

  if (!application) {
    throw new Error('Application not found');
  }

  // Calculate AI score based on multiple factors
  let aiScore = 0;

  // 1. Email domain credibility (0-20 points)
  const emailDomain = application.email.split('@')[1]?.toLowerCase();
  const businessDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  if (emailDomain) {
    if (!businessDomains.includes(emailDomain)) {
      aiScore += 20; // Company domain
    } else {
      aiScore += 10; // Personal email
    }
  }

  // 2. Business type relevance (0-15 points)
  const businessType = application.businessType.toLowerCase();
  if (businessType.includes('agency') || businessType.includes('reseller')) {
    aiScore += 15;
  } else if (businessType.includes('enterprise') || businessType.includes('company')) {
    aiScore += 12;
  } else if (businessType.includes('freelancer') || businessType.includes('consultant')) {
    aiScore += 10;
  } else {
    aiScore += 8;
  }

  // 3. Services offered alignment (0-20 points)
  let servicesOffered = [];
  try {
    servicesOffered = typeof application.servicesOffered === 'string'
      ? JSON.parse(application.servicesOffered)
      : application.servicesOffered;
  } catch {
    servicesOffered = [];
  }

  if (Array.isArray(servicesOffered)) {
    if (servicesOffered.length >= 5) {
      aiScore += 20;
    } else if (servicesOffered.length >= 3) {
      aiScore += 15;
    } else if (servicesOffered.length >= 1) {
      aiScore += 10;
    }
  }

  // 4. Region match (0-15 points) - all regions equal
  aiScore += 15;

  // 5. Portfolio/website quality (0-15 points)
  if (application.website && application.website.trim()) {
    if (isValidUrl(application.website)) {
      aiScore += 15;
    }
  }

  // 6. Motivation quality (0-15 points)
  const whyPartner = application.whyPartner.toLowerCase();
  let motivationScore = 0;

  // Length bonus
  if (application.whyPartner.length > 100) {
    motivationScore += 5;
  } else if (application.whyPartner.length > 50) {
    motivationScore += 3;
  }

  // Keyword bonus
  const positiveKeywords = ['expand', 'grow', 'partnership', 'collaborate', 'innovative', 'professional', 'committed', 'dedicated', 'experienced', 'opportunity'];
  positiveKeywords.forEach((keyword) => {
    if (whyPartner.includes(keyword)) {
      motivationScore += 1;
    }
  });

  aiScore += Math.min(motivationScore, 15);

  // Cap score at 100
  aiScore = Math.min(aiScore, 100);

  // Determine recommendation
  let aiRecommendation = 'Reject';
  if (aiScore >= 75) {
    aiRecommendation = 'Approve';
  } else if (aiScore >= 50) {
    aiRecommendation = 'Review';
  }

  // Determine risk level
  let riskLevel = 'High';
  if (aiScore >= 75) {
    riskLevel = 'Low';
  } else if (aiScore >= 50) {
    riskLevel = 'Medium';
  }

  // Generate auto tags
  const autoTags = [];
  if (aiScore >= 75) {
    autoTags.push('High Potential');
  } else if (aiScore >= 50) {
    autoTags.push('Medium Potential');
  } else {
    autoTags.push('Low Potential');
  }

  // Update application record
  const updatedApplication = await pb.collection('partner_applications').update(application.id, {
    aiScore,
    aiRecommendation,
    riskLevel,
    autoTags: JSON.stringify(autoTags),
  });

  logger.info(`AI scoring completed for ${applicationId}: Score ${aiScore}, Recommendation: ${aiRecommendation}`);

  res.json({
    success: true,
    applicationId,
    aiScore,
    aiRecommendation,
    riskLevel,
    autoTags,
  });
});

export default router;