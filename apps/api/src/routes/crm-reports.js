import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to generate CSV
const generateCSV = (data, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value || '';
    }).join(',');
  });
  return [csvHeaders, ...csvRows].join('\n');
};

// Helper function to send email via platform's built-in mailer
const sendScheduledReportEmail = async (email, reportName, reportData) => {
  logger.info(`Scheduled report email prepared for ${email}: ${reportName}`);
  // In production, this would integrate with PocketBase mailer
  return { success: true };
};

// POST /crm/reports/custom - Generate custom report
router.post('/custom', async (req, res) => {
  const { dateRange, metrics, format } = req.body;

  if (!dateRange || !metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields: dateRange (with start, end), metrics array, format',
    });
  }

  if (!['csv', 'pdf'].includes(format)) {
    return res.status(400).json({
      error: 'Invalid format. Must be csv or pdf',
    });
  }

  // Fetch leads within date range
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  const leads = await pb.collection('leads').getFullList();
  const filteredLeads = leads.filter((lead) => {
    const createdDate = new Date(lead.created);
    return createdDate >= startDate && createdDate <= endDate;
  });

  // Build report data based on requested metrics
  const reportData = [];
  filteredLeads.forEach((lead) => {
    const row = { id: lead.id, name: lead.name, email: lead.email };
    metrics.forEach((metric) => {
      switch (metric) {
        case 'status':
          row.status = lead.status;
          break;
        case 'source':
          row.source = lead.source;
          break;
        case 'score':
          row.score = lead.score || 0;
          break;
        case 'serviceInterest':
          row.serviceInterest = lead.serviceInterest;
          break;
        case 'company':
          row.company = lead.company;
          break;
        case 'created':
          row.created = lead.created;
          break;
        default:
          break;
      }
    });
    reportData.push(row);
  });

  if (format === 'csv') {
    const headers = ['id', 'name', 'email', ...metrics];
    const csv = generateCSV(reportData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.csv"`);
    res.send(csv);
  } else if (format === 'pdf') {
    // For PDF, return JSON with data (actual PDF generation would require a library)
    res.json({
      success: true,
      message: 'PDF generation requires additional setup. Returning data as JSON.',
      data: reportData,
      count: reportData.length,
    });
  }

  logger.info(`Custom report generated: ${reportData.length} records`);
});

// POST /crm/reports/schedule - Schedule report delivery
router.post('/schedule', async (req, res) => {
  const { reportId, deliveryEmail, frequency } = req.body;

  if (!reportId || !deliveryEmail || !frequency) {
    return res.status(400).json({
      error: 'Missing required fields: reportId, deliveryEmail, frequency',
    });
  }

  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    return res.status(400).json({
      error: 'Invalid frequency. Must be daily, weekly, or monthly',
    });
  }

  // Create scheduled report record
  const scheduledReport = await pb.collection('scheduled_reports').create({
    reportId,
    deliveryEmail,
    frequency,
    status: 'active',
    nextDelivery: new Date().toISOString(),
  });

  logger.info(`Report scheduled: ${scheduledReport.id} - ${frequency} to ${deliveryEmail}`);

  res.json({
    success: true,
    scheduledReportId: scheduledReport.id,
    message: `Report scheduled for ${frequency} delivery to ${deliveryEmail}`,
  });
});

// GET /crm/reports/list - Get all saved reports
router.get('/list', async (req, res) => {
  const reports = await pb.collection('reports').getFullList();

  const reportList = reports.map((report) => ({
    id: report.id,
    name: report.name || 'Unnamed Report',
    createdAt: report.created,
    updatedAt: report.updated,
    type: report.type || 'custom',
  }));

  logger.info(`Reports list retrieved: ${reportList.length} reports`);

  res.json({
    reports: reportList,
    count: reportList.length,
  });
});

// GET /crm/reports/:id - Get specific report
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required field: id',
    });
  }

  const report = await pb.collection('reports').getOne(id);

  logger.info(`Report retrieved: ${id}`);

  res.json({
    id: report.id,
    name: report.name,
    type: report.type,
    data: report.data ? JSON.parse(report.data) : {},
    createdAt: report.created,
    updatedAt: report.updated,
  });
});

export default router;