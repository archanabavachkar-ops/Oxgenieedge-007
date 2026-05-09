
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

export class CrmDashboardService {
  static async getKPIs() {
    const allLeads = await pb.collection('leads').getFullList();
    const totalLeads = allLeads.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newLeadsThisMonth = allLeads.filter(lead => new Date(lead.created) >= startOfMonth).length;
    const convertedLeads = allLeads.filter(lead => lead.status === 'Won').length;
    const activeLeads = allLeads.filter(lead => ['Connected', 'Qualified', 'Proposal Sent', 'Negotiation'].includes(lead.status)).length;

    return {
      totalLeads,
      newLeadsThisMonth,
      convertedLeads,
      activeLeads,
    };
  }
}
