
import nodemailer from 'nodemailer';
import emailTemplates from './emailTemplates.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.defaultFrom = process.env.SMTP_FROM || 'OxGenie Edge <notifications@oxgenieedge.com>';
    this.salesEmail = process.env.SALES_EMAIL || 'hello@oxgenieedge.com';
  }

  async sendLeadNotification(lead) {
    try {
      const html = emailTemplates.newLead(lead);
      const result = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: this.salesEmail,
        subject: `New Lead - ${lead.name}`,
        html
      });
      console.log('Lead notification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending lead notification:', error);
      throw error;
    }
  }

  async sendWhatsAppNotification(senderPhone, messageText, timestamp) {
    try {
      const html = emailTemplates.whatsappMessage(senderPhone, messageText, timestamp);
      const result = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: this.salesEmail,
        subject: `New WhatsApp Message from ${senderPhone}`,
        html
      });
      console.log('WhatsApp notification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      throw error;
    }
  }

  async sendContactFormNotification(name, email, message, timestamp) {
    try {
      const html = emailTemplates.contactFormSubmission(name, email, message, timestamp);
      const result = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: this.salesEmail,
        subject: `New Contact Form Submission from ${name}`,
        html
      });
      console.log('Contact form notification sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending contact form notification:', error);
      throw error;
    }
  }
}

export default new EmailService();
