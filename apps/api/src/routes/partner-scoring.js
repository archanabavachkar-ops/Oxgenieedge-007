import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// List of known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'yopmail.com',
  'maildrop.cc',
  'trashmail.com',
  'fakeinbox.com',
  'sharklasers.com',
  'spam4.me',
  'temp-mail.io',
  'tempmail.io',
  'guerrillamail.info',
  'grr.la',
  'pokemail.net',
  'spam.la',
  'spamgourmet.com',
  'trashmail.ws',
];

// Helper function to check if email is disposable
const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

// Helper function to validate domain credibility
const validateDomainCredibility = (email, portfolioWebsite) => {
  let score = 0;

  // Check email domain
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (emailDomain) {
    // Check for common business domains
    const businessDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    if (businessDomains.includes(emailDomain)) {
      score += 5; // Personal email gets lower score
    } else if (emailDomain.includes('company') || emailDomain.includes('business')) {
      score += 15; // Company domain gets higher score
    } else {
      score += 10; // Generic domain
    }
  }

  // Check portfolio website
  if (portfolioWebsite) {
    try {
      const url = new URL(portfolioWebsite);
      const domain = url.hostname.toLowerCase();

      // Check for professional TLDs
      const professionalTlds = ['.com', '.io', '.co', '.net', '.org', '.biz'];
      const hasProfessionalTld = professionalTlds.some((tld) => domain.endsWith(tld));

      if (hasProfessionalTld) {
        score += 5;
      }

      // Check for HTTPS
      if (url.protocol === 'https:') {
        score += 5;
      }
    } catch (error) {
      logger.warn(`Invalid portfolio URL: ${portfolioWebsite}`);
    }
  }

  return Math.min(score, 20); // Cap at 20 points
};

// Helper function to score business type relevance
const scoreBusinessTypeRelevance = (businessType) => {
  if (!businessType) return 0;

  const relevantTypes = [
    'digital_agency',
    'marketing_agency',
    'consulting',
    'software_development',
    'web_design',
    'seo_services',
    'social_media_marketing',
    'content_creation',
    'branding',
    'advertising',
  ];

  const normalizedType = businessType.toLowerCase().replace(/\s+/g, '_');
  if (relevantTypes.includes(normalizedType)) {
    return 15; // Highly relevant
  }

  // Check for partial matches
  if (normalizedType.includes('agency') || normalizedType.includes('marketing') || normalizedType.includes('digital')) {
    return 12; // Somewhat relevant
  }

  return 5; // Generic business type
};

// Helper function to score services alignment
const scoreServicesAlignment = (servicesInterested) => {
  if (!servicesInterested) return 0;

  const alignedServices = [
    'ppc',
    'social_media',
    'seo',
    'crm',
    'ai_chatbot',
    'content_marketing',
    'email_marketing',
    'analytics',
    'conversion_optimization',
    'brand_strategy',
  ];

  const normalizedServices = servicesInterested.toLowerCase().replace(/\s+/g, '_');
  let score = 0;

  alignedServices.forEach((service) => {
    if (normalizedServices.includes(service)) {
      score += 2;
    }
  });

  return Math.min(score, 20); // Cap at 20 points
};

// Helper function to score geographic region match
const scoreGeographicRegionMatch = (region) => {
  if (!region) return 0;

  // Regions with higher market potential
  const highPotentialRegions = [
    'north_america',
    'europe',
    'asia_pacific',
    'india',
    'united_states',
    'united_kingdom',
    'canada',
    'australia',
  ];

  const normalizedRegion = region.toLowerCase().replace(/\s+/g, '_');
  if (highPotentialRegions.includes(normalizedRegion)) {
    return 15; // High potential region
  }

  return 8; // Other regions
};

// Helper function to score portfolio website quality
const scorePortfolioWebsiteQuality = (portfolioWebsite) => {
  if (!portfolioWebsite) return 0;

  try {
    const url = new URL(portfolioWebsite);
    let score = 0;

    // Check for HTTPS
    if (url.protocol === 'https:') {
      score += 5;
    }

    // Check for professional domain
    const domain = url.hostname.toLowerCase();
    if (!domain.includes('free') && !domain.includes('blogspot') && !domain.includes('wordpress.com')) {
      score += 5;
    }

    // Check for custom domain
    if (!domain.includes('github') && !domain.includes('medium') && !domain.includes('linkedin')) {
      score += 5;
    }

    return Math.min(score, 15); // Cap at 15 points
  } catch (error) {
    return 0;
  }
};

// Helper function to score motivation quality
const scoreMotivationQuality = (motivation) => {
  if (!motivation) return 0;

  let score = 0;
  const motivationLower = motivation.toLowerCase();

  // Check for specific, detailed motivation
  if (motivation.length > 100) {
    score += 5; // Detailed motivation
  } else if (motivation.length > 50) {
    score += 3; // Moderate detail
  }

  // Check for positive keywords
  const positiveKeywords = [
    'partnership',
    'growth',
    'collaboration',
    'opportunity',
    'expand',
    'innovative',
    'professional',
    'committed',
    'dedicated',
    'experienced',
  ];

  positiveKeywords.forEach((keyword) => {
    if (motivationLower.includes(keyword)) {
      score += 1;
    }
  });

  // Check for red flags
  const redFlags = ['spam', 'scam', 'fake', 'test', 'quick money', 'easy cash'];
  redFlags.forEach((flag) => {
    if (motivationLower.includes(flag)) {
      score -= 5;
    }
  });

  return Math.max(0, Math.min(score, 15)); // Cap between 0-15
};

// Helper function to check for duplicates
const checkForDuplicates = async (email, mobile, companyName) => {
  const duplicates = [];

  // Check for existing email
  const emailCheck = await pb.collection('partner_applications').getFullList({
    filter: `email = "${email}"`,
  }).catch(() => []);

  if (emailCheck.length > 0) {
    duplicates.push({
      type: 'email',
      severity: 'high',
      message: 'Email already exists in system',
    });
  }

  // Check for existing mobile
  if (mobile) {
    const mobileCheck = await pb.collection('partner_applications').getFullList({
      filter: `mobile = "${mobile}"`,
    }).catch(() => []);

    if (mobileCheck.length > 0) {
      duplicates.push({
        type: 'mobile',
        severity: 'high',
        message: 'Mobile number already exists in system',
      });
    }
  }

  // Check for existing company name
  if (companyName) {
    const companyCheck = await pb.collection('partner_applications').getFullList({
      filter: `company_name = "${companyName}"`,
    }).catch(() => []);

    if (companyCheck.length > 0) {
      duplicates.push({
        type: 'company_name',
        severity: 'medium',
        message: 'Company name already exists in system',
      });
    }
  }

  return duplicates;
};

// POST /partner-scoring/evaluate - Evaluate partner application
router.post('/evaluate', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    mobile,
    company_name,
    business_type,
    services_interested,
    geographic_region,
    portfolio_website,
    motivation,
  } = req.body;

  // Validate required fields
  if (!email || !company_name) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: email, company_name',
    });
  }

  logger.info(`AI scoring evaluation started for: ${email} - ${company_name}`);

  // Initialize scoring
  let email_domain_credibility = 0;
  let business_type_relevance = 0;
  let services_alignment = 0;
  let geographic_region_match = 0;
  let portfolio_website_quality = 0;
  let motivation_quality = 0;

  // Fraud detection: Check for disposable email
  let fraudFlags = [];
  if (isDisposableEmail(email)) {
    fraudFlags.push({
      type: 'disposable_email',
      severity: 'high',
      message: 'Disposable email address detected',
    });
  }

  // Check for duplicates
  const duplicates = await checkForDuplicates(email, mobile, company_name);
  if (duplicates.length > 0) {
    fraudFlags = fraudFlags.concat(duplicates);
  }

  // Calculate scores
  email_domain_credibility = validateDomainCredibility(email, portfolio_website);
  business_type_relevance = scoreBusinessTypeRelevance(business_type);
  services_alignment = scoreServicesAlignment(services_interested);
  geographic_region_match = scoreGeographicRegionMatch(geographic_region);
  portfolio_website_quality = scorePortfolioWebsiteQuality(portfolio_website);
  motivation_quality = scoreMotivationQuality(motivation);

  // Calculate total score
  const ai_score = Math.round(
    email_domain_credibility +
      business_type_relevance +
      services_alignment +
      geographic_region_match +
      portfolio_website_quality +
      motivation_quality
  );

  // Determine recommendation based on score
  let ai_recommendation = 'Reject';
  if (ai_score >= 75) {
    ai_recommendation = 'Approve';
  } else if (ai_score >= 50) {
    ai_recommendation = 'Review';
  }

  // Determine risk level
  let risk_level = 'High';
  if (ai_score >= 75) {
    risk_level = 'Low';
  } else if (ai_score >= 50) {
    risk_level = 'Medium';
  }

  // Generate auto tags
  const auto_tags = [];
  if (ai_score >= 75) {
    auto_tags.push('High Potential');
  } else if (ai_score >= 50) {
    auto_tags.push('Medium Potential');
  } else {
    auto_tags.push('Low Potential');
  }

  // Add additional tags based on scores
  if (email_domain_credibility >= 15) {
    auto_tags.push('Credible Domain');
  }
  if (business_type_relevance >= 12) {
    auto_tags.push('Relevant Business');
  }
  if (services_alignment >= 15) {
    auto_tags.push('Strong Service Alignment');
  }
  if (portfolio_website_quality >= 12) {
    auto_tags.push('Professional Website');
  }
  if (motivation_quality >= 12) {
    auto_tags.push('Strong Motivation');
  }

  // Add fraud flags as tags
  if (fraudFlags.length > 0) {
    auto_tags.push('Fraud Alert');
  }

  logger.info(`AI scoring completed: ${email} - Score: ${ai_score}, Recommendation: ${ai_recommendation}`);

  res.json({
    success: true,
    ai_score,
    ai_recommendation,
    risk_level,
    auto_tags,
    scoring_details: {
      email_domain_credibility,
      business_type_relevance,
      services_alignment,
      geographic_region_match,
      portfolio_website_quality,
      motivation_quality,
    },
    fraud_detection: {
      fraud_flags: fraudFlags,
      has_fraud_indicators: fraudFlags.length > 0,
    },
  });
});

export default router;