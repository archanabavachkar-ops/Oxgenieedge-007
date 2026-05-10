import integrationRoutes from './src/routes/integrations.js';
import reportRoutes from './src/routes/crm-reports.js';
import crmRoutes from './src/routes/crm-ai.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';

import botRoutes from './routes/bot.js';
import escalationRoutes from './routes/escalations.js';
import automationRoutes from './routes/automations.js';
import webhooksRoutes from './src/routes/webhooks.js';
import logger from './utils/logger.js';
import whatsappRoutes from './routes/whatsappWebhooks.js';
import PocketBase from 'pocketbase';

const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
);

const app = express();
// Railway / Reverse Proxy Support
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// 🛡️ Security
app.use(helmet());
app.use(cors({
  origin: [
    'https://oxgenieedge.com',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// 📊 Logging
app.use(morgan('combined'));

// 🚦 Rate limit (only API routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// 📦 Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❤️ Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 🔐 Auth middleware (NOT for WhatsApp)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  next();
};

// ================= ROUTES =================

// Protected routes
app.use('/api/bots', authMiddleware, botRoutes);
app.use('/api/escalations', authMiddleware, escalationRoutes);

// ✅ CRM Modules
app.use('/crm', authMiddleware, crmRoutes);
app.use('/analytics', authMiddleware, analyticsRoutes);
app.use('/admin', authMiddleware, adminRoutes);
app.use('/automations', authMiddleware, automationRoutes);
app.use('/integrations', authMiddleware, integrationRoutes);
app.use('/reports', authMiddleware, reportRoutes);
app.use('/webhooks', webhooksRoutes);

// Existing routes
app.use('/api/automations', authMiddleware, automationRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// ✅ WhatsApp webhook (NO AUTH)
app.use('/api/webhooks/whatsapp', whatsappRoutes);

// ================= END ROUTES =================

// ================= CONTACTS API =================

// GET Contacts (NO AUTH REQUIRED)
app.get('/hcgi/api/contacts', async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'Contacts fetched successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST Contact Form
app.post('/api/contacts', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
      source,
    } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required',
      });
    }

    // Lead Data Mapping
    const leadData = {
      name,
      email,
      mobile: phone || '',
      company: company || '',
      serviceInterest: subject || '',
      notes: message || '',
      source: source || 'Website Contact Form',
      status: 'New Lead',
      stage: 'NEW LEAD',
      leadScore: 50,
      createdAt: new Date().toISOString(),
    };

    // Save into PocketBase
    const record = await pb.collection('leads').create(leadData);

    console.log('Lead Created:', record);

    res.json({
      success: true,
      message: 'Lead created successfully',
      recordId: record.id,
      data: record,
    });

  } catch (error) {
    console.error('Contact API Error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// TEST API
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API working',
  });
});

// CONTACTS API
app.post('/api/contacts', async (req, res) => {
  try {
    console.log('Contact API Hit');

    res.json({
      success: true,
      message: 'Contact received successfully',
      data: req.body,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'OxGenie CRM API',
    status: 'running',
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API working successfully',
  });
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ⚠️ Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

// 🚀 Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;