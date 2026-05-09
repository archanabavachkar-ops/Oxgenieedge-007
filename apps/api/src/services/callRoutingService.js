import 'dotenv/config';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * Call Routing Service
 * Manages call routing rules, agent assignment, and queue management
 */
export class CallRoutingService {
  /**
   * Get all active routing rules sorted by priority.
   *
   * @returns {Promise<Array>} Array of routing rules
   */
  async getRoutingRules() {
    try {
      const rules = await pb.collection('routing_rules').getFullList({
        filter: 'is_active = true',
        sort: '-priority',
      });

      logger.info(`Retrieved ${rules.length} active routing rules`);

      return rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        priority: rule.priority,
        conditions: rule.conditions ? JSON.parse(rule.conditions) : {},
        target_queue: rule.target_queue,
        target_agent: rule.target_agent,
        is_active: rule.is_active,
      }));
    } catch (error) {
      logger.error(`Failed to get routing rules: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find the best available agent based on routing rules and call data.
   *
   * @param {Object} callData - Call information
   * @param {string} callData.customerId - Customer ID
   * @param {string} callData.language - Preferred language
   * @param {string} callData.leadSource - Lead source
   * @param {string} callData.customerSegment - Customer segment
   * @returns {Promise<Object>} Best agent with {agentId, agentName, skills, availability}
   */
  async findBestAgent(callData) {
    try {
      const rules = await this.getRoutingRules();

      // Match against routing rules
      let matchedRule = null;
      for (const rule of rules) {
        if (this.matchesConditions(callData, rule.conditions)) {
          matchedRule = rule;
          break;
        }
      }

      // Get available agents
      const agents = await pb.collection('agents').getFullList({
        filter: 'status = "available"',
      });

      if (agents.length === 0) {
        throw new Error('No available agents');
      }

      // Filter agents based on matched rule or default criteria
      let candidateAgents = agents;

      if (matchedRule) {
        if (matchedRule.target_agent) {
          candidateAgents = agents.filter((a) => a.id === matchedRule.target_agent);
        } else if (matchedRule.target_queue) {
          candidateAgents = agents.filter((a) => a.queue === matchedRule.target_queue);
        }
      }

      if (candidateAgents.length === 0) {
        candidateAgents = agents;
      }

      // Select best agent based on load
      const bestAgent = this.selectLeastBusyAgent(candidateAgents);

      logger.info(`Best agent found: ${bestAgent.id} for call from customer ${callData.customerId}`);

      return {
        agentId: bestAgent.id,
        agentName: bestAgent.name,
        skills: bestAgent.skills ? JSON.parse(bestAgent.skills) : [],
        availability: bestAgent.availability,
        currentLoad: bestAgent.current_calls || 0,
      };
    } catch (error) {
      logger.error(`Failed to find best agent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if call data matches routing rule conditions.
   *
   * @param {Object} callData - Call data
   * @param {Object} conditions - Rule conditions
   * @returns {boolean} True if conditions match
   */
  matchesConditions(callData, conditions) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true; // No conditions = match all
    }

    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'language' && callData.language !== value) {
        return false;
      }
      if (key === 'lead_source' && callData.leadSource !== value) {
        return false;
      }
      if (key === 'customer_segment' && callData.customerSegment !== value) {
        return false;
      }
      if (key === 'time_of_day') {
        const hour = new Date().getHours();
        if (value.start && value.end) {
          if (hour < value.start || hour > value.end) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Select the least busy agent from candidates.
   *
   * @param {Array} agents - Candidate agents
   * @returns {Object} Selected agent
   */
  selectLeastBusyAgent(agents) {
    return agents.reduce((least, agent) => {
      const agentLoad = agent.current_calls || 0;
      const leastLoad = least.current_calls || 0;
      return agentLoad < leastLoad ? agent : least;
    });
  }

  /**
   * Assign agent to call and notify via WebSocket.
   *
   * @param {string} callId - Call ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} Assignment result
   */
  async assignAgent(callId, agentId) {
    try {
      const call = await pb.collection('calls').getOne(callId);
      const agent = await pb.collection('agents').getOne(agentId);

      // Update call record
      await pb.collection('calls').update(callId, {
        agent_id: agentId,
        assigned_at: new Date().toISOString(),
        status: 'assigned',
      });

      // Update agent's current calls
      const currentCalls = (agent.current_calls || 0) + 1;
      await pb.collection('agents').update(agentId, {
        current_calls: currentCalls,
        last_call_assigned: new Date().toISOString(),
      });

      // Broadcast via WebSocket
      if (global.io) {
        global.io.of('/call-centre').to(`agent:${agentId}`).emit('call:assigned', {
          callId,
          customerId: call.customer_id,
          phoneNumber: call.phone_number,
          callerId: call.caller_id,
          assignedAt: new Date().toISOString(),
        });
      }

      logger.info(`Agent assigned: ${agentId} to call ${callId}`);

      return {
        callId,
        agentId,
        assignedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to assign agent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get agent availability and current load.
   *
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} Agent availability info
   */
  async getAgentAvailability(agentId) {
    try {
      const agent = await pb.collection('agents').getOne(agentId);

      const currentCalls = agent.current_calls || 0;
      const maxCalls = agent.max_concurrent_calls || 5;
      const isAvailable = currentCalls < maxCalls && agent.status === 'available';

      return {
        agentId,
        isAvailable,
        status: agent.status,
        currentCalls,
        maxCalls,
        availableSlots: Math.max(0, maxCalls - currentCalls),
      };
    } catch (error) {
      logger.error(`Failed to get agent availability: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current queue status.
   *
   * @returns {Promise<Object>} Queue status with length and average wait time
   */
  async getQueueStatus() {
    try {
      const queuedCalls = await pb.collection('calls').getFullList({
        filter: 'status = "queued"',
      });

      // Calculate average wait time
      let totalWaitTime = 0;
      for (const call of queuedCalls) {
        const queuedAt = new Date(call.queued_at);
        const waitTime = Math.floor((Date.now() - queuedAt.getTime()) / 1000);
        totalWaitTime += waitTime;
      }

      const avgWaitTime = queuedCalls.length > 0 ? Math.floor(totalWaitTime / queuedCalls.length) : 0;

      logger.info(`Queue status: ${queuedCalls.length} calls, avg wait: ${avgWaitTime}s`);

      return {
        queueLength: queuedCalls.length,
        averageWaitTime: avgWaitTime,
        longestWaitTime: queuedCalls.length > 0 ? Math.max(...queuedCalls.map((c) => {
          const queuedAt = new Date(c.queued_at);
          return Math.floor((Date.now() - queuedAt.getTime()) / 1000);
        })) : 0,
      };
    } catch (error) {
      logger.error(`Failed to get queue status: ${error.message}`);
      throw error;
    }
  }
}

export default new CallRoutingService();