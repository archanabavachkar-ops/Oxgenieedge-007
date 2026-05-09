
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

export class AnalyticsService {
  static daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
  }

  static async getFunnel() {
    const leads = await pb.collection('leads').getFullList();
    const stages = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Won'];
    const funnel = [];
    let maxCount = leads.length;

    stages.forEach((stage, i) => {
      const stageLeads = leads.filter(lead => lead.status === stage);
      const count = stageLeads.length;
      const conversionRate = maxCount > 0 ? ((count / maxCount) * 100).toFixed(2) : 0;
      const dropoff = i > 0 ? (100 - parseFloat(conversionRate)).toFixed(2) : 0;
      
      let avgDays = 0;
      if (stageLeads.length > 0) {
        const totalDays = stageLeads.reduce((sum, lead) => sum + this.daysBetween(lead.created, new Date()), 0);
        avgDays = (totalDays / stageLeads.length).toFixed(2);
      }

      funnel.push({
        name: stage,
        count,
        conversionRate: parseFloat(conversionRate),
        dropoff: parseFloat(dropoff),
        avgDays: parseFloat(avgDays),
      });
    });

    let bottleneck = null;
    let maxDropoff = 0;
    for (let i = 1; i < funnel.length; i++) {
      if (funnel[i].dropoff > maxDropoff) {
        maxDropoff = funnel[i].dropoff;
        bottleneck = funnel[i].name;
      }
    }

    return { stages: funnel, bottleneck };
  }

  static async getSources() {
    const leads = await pb.collection('leads').getFullList();
    const sourceMap = {};
    
    leads.forEach(lead => {
      const source = lead.source || 'Direct';
      if (!sourceMap[source]) {
        sourceMap[source] = { name: source, totalLeads: 0, convertedLeads: 0 };
      }
      sourceMap[source].totalLeads++;
      if (lead.status === 'Won') sourceMap[source].convertedLeads++;
    });

    const sources = Object.values(sourceMap).map(s => ({
      name: s.name,
      totalLeads: s.totalLeads,
      convertedLeads: s.convertedLeads,
      conversionRate: s.totalLeads > 0 ? parseFloat(((s.convertedLeads / s.totalLeads) * 100).toFixed(2)) : 0
    }));

    return { sources: sources.sort((a, b) => b.conversionRate - a.conversionRate) };
  }

  static async getPipeline() {
    const leads = await pb.collection('leads').getFullList();
    const activeLeads = leads.filter(lead => ['Attempted Contact', 'Connected', 'Qualified', 'Proposal Sent', 'Negotiation'].includes(lead.status)).length;
    const healthScore = Math.min(100, Math.round((activeLeads / Math.max(leads.length, 1)) * 100));

    return {
      activeDeals: activeLeads,
      healthScore,
      totalLeads: leads.length
    };
  }

  static async getQuality() {
    const leads = await pb.collection('leads').getFullList();
    const engagementRate = leads.length > 0 
      ? parseFloat(((leads.filter(l => l.priority === 'Hot').length / leads.length) * 100).toFixed(2)) 
      : 0;

    return { engagementRate, totalAnalyzed: leads.length };
  }
}
