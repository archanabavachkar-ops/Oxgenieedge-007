
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { validateEmail, validatePhone, validateRequired, validateLength } from '../utils/validation.js';
import { AssignmentService } from './AssignmentService.js';

export class LeadService {
  static validate(data) {
    const errors = {};
    if (!validateRequired('name', data.name) || !validateLength(data.name, 2, 100)) {
      errors.name = 'Valid name (2-100 characters) is required';
    }
    if (data.email && !validateEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
    if (data.mobile && !validatePhone(data.mobile)) {
      errors.mobile = 'Invalid mobile format';
    }
    if (!data.email && !data.mobile) {
      errors.contact = 'Either email or mobile is required';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static async checkDuplicate(email, mobile) {
    let filterParts = [];
    if (email) filterParts.push(`email = "${email}"`);
    if (mobile) filterParts.push(`mobile = "${mobile}"`);
    
    if (filterParts.length === 0) return null;

    try {
      const duplicates = await pb.collection('leads').getFullList({
        filter: filterParts.join(' || '),
        limit: 1
      });
      return duplicates.length > 0 ? duplicates[0] : null;
    } catch (error) {
      logger.error('Error checking duplicate leads:', { error: error.message });
      throw error;
    }
  }

  static async createLead(data) {
    const validation = this.validate(data);
    if (!validation.isValid) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.details = validation.errors;
      throw err;
    }

    try {
      const duplicate = await this.checkDuplicate(data.email, data.mobile);
      if (duplicate) {
        logger.info(`Duplicate lead found: ${duplicate.id}`);
        // Optionally handle duplicate merging here
      }

      const payload = {
        name: data.name,
        email: data.email || '',
        mobile: data.mobile || '',
        company: data.company || '',
        description: data.description || '',
        serviceInterest: data.serviceInterest || '',
        source: data.source || 'Manual',
        status: data.status || 'New Lead',
        priority: data.priority || 'Medium',
        nextFollowUpDate: data.nextFollowUpDate || new Date(Date.now() + 86400000).toISOString()
      };

      const createdLead = await pb.collection('leads').create(payload);
      logger.info(`Lead created successfully: ${createdLead.id}`);
      
      return createdLead;
    } catch (error) {

      console.error('GET LEADS ERROR:', error);

      return [{
        error: error.message
      }];
    }
  }
  static async getAllLeads() {
    try {

      const leads = await pb.collection('leads').getFullList({
        sort: '-created'
      });

      return leads;

    } catch (error) {

      logger.error('Failed to fetch leads', {
        error: error.message
      });

      throw error;
    }
  }
    static async assignLead(leadId) {
    return AssignmentService.autoAssign(leadId);
  }
}
