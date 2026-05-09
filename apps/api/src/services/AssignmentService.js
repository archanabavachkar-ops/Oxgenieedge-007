
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

export class AssignmentService {
  static async getAvailableAgents() {
    try {
      const agents = await pb.collection('crm_users').getFullList({
        filter: 'status = "Active" && role = "Admin"', // Simplified for example, maybe "Agent"
      });
      return agents;
    } catch (error) {
      logger.error('Failed to get available agents', { error: error.message });
      throw error;
    }
  }

  static async assignToAgent(leadId, agentId) {
    try {
      const updatedLead = await pb.collection('leads').update(leadId, {
        assignedTo: agentId
      });
      logger.info(`Lead ${leadId} manually assigned to agent ${agentId}`);
      return updatedLead;
    } catch (error) {
      logger.error(`Failed to assign lead ${leadId} to agent ${agentId}`, { error: error.message });
      throw error;
    }
  }

  static async autoAssign(leadId) {
    try {
      const agents = await this.getAvailableAgents();
      if (agents.length === 0) {
        logger.warn(`No available agents to auto-assign lead ${leadId}`);
        return null;
      }
      
      // Simple round-robin or random assignment logic
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      
      const updatedLead = await pb.collection('leads').update(leadId, {
        assignedTo: randomAgent.id
      });
      
      logger.info(`Lead ${leadId} auto-assigned to agent ${randomAgent.id}`);
      return updatedLead;
    } catch (error) {
      logger.error(`Failed auto-assigning lead ${leadId}`, { error: error.message });
      throw error;
    }
  }
}
