import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

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
  }

  /**
   * Create a new routing rule.
   *
   * @param {Object} ruleData - Rule data
   * @returns {Promise<Object>} Created rule
   */
  async createRoutingRule(ruleData) {
    const { name, priority, conditions, target_queue, target_agent, is_active } = ruleData;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Rule name is required');
    }

    if (priority === undefined || typeof priority !== 'number') {
      throw new Error('Priority must be a number');
    }

    const rule = await pb.collection('routing_rules').create({
      name: name.trim(),
      priority,
      conditions: conditions ? JSON.stringify(conditions) : '{}',
      target_queue: target_queue || '',
      target_agent: target_agent || '',
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
    });

    logger.info(`Routing rule created: ${rule.id} - ${name}`);

    return {
      id: rule.id,
      name: rule.name,
      priority: rule.priority,
      conditions: JSON.parse(rule.conditions),
      target_queue: rule.target_queue,
      target_agent: rule.target_agent,
      is_active: rule.is_active,
    };
  }

  /**
   * Update a routing rule.
   *
   * @param {string} ruleId - Rule ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated rule
   */
  async updateRoutingRule(ruleId, updates) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    const rule = await pb.collection('routing_rules').getOne(ruleId);

    if (!rule) {
      throw new Error('Routing rule not found');
    }

    const updateData = {};

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim() === '') {
        throw new Error('Rule name must be a non-empty string');
      }
      updateData.name = updates.name.trim();
    }

    if (updates.priority !== undefined) {
      if (typeof updates.priority !== 'number') {
        throw new Error('Priority must be a number');
      }
      updateData.priority = updates.priority;
    }

    if (updates.conditions !== undefined) {
      updateData.conditions = JSON.stringify(updates.conditions);
    }

    if (updates.target_queue !== undefined) {
      updateData.target_queue = updates.target_queue;
    }

    if (updates.target_agent !== undefined) {
      updateData.target_agent = updates.target_agent;
    }

    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
    }

    updateData.updated_at = new Date().toISOString();

    const updatedRule = await pb.collection('routing_rules').update(ruleId, updateData);

    logger.info(`Routing rule updated: ${ruleId}`);

    return {
      id: updatedRule.id,
      name: updatedRule.name,
      priority: updatedRule.priority,
      conditions: JSON.parse(updatedRule.conditions),
      target_queue: updatedRule.target_queue,
      target_agent: updatedRule.target_agent,
      is_active: updatedRule.is_active,
    };
  }

  /**
   * Delete a routing rule.
   *
   * @param {string} ruleId - Rule ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRoutingRule(ruleId) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    const rule = await pb.collection('routing_rules').getOne(ruleId);

    if (!rule) {
      throw new Error('Routing rule not found');
    }

    await pb.collection('routing_rules').delete(ruleId);

    logger.info(`Routing rule deleted: ${ruleId}`);

    return {
      success: true,
      message: 'Routing rule deleted successfully',
    };
  }

  /**
   * Find the best available agent based on routing rules and call data.
   *
   * @param {Object} callData - Call information
   * @returns {Promise<Object>} Best agent
   */
  async findBestAgent(callData) {
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

    // Select best agent based on strategy
    const strategy = callData.strategy || 'least_busy';
    const bestAgent = strategy === 'round_robin'
      ? this.selectAgentRoundRobin(candidateAgents)
      : this.selectLeastBusyAgent(candidateAgents);

    logger.info(`Best agent found: ${bestAgent.id} for call from customer ${callData.customerId}`);

    return {
      agentId: bestAgent.id,
      agentName: bestAgent.name,
      skills: bestAgent.skills ? JSON.parse(bestAgent.skills) : [],
      availability: bestAgent.availability,
      currentLoad: bestAgent.current_calls || 0,
    };
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
   * Select agent using round-robin strategy.
   *
   * @param {Array} agents - Candidate agents
   * @returns {Object} Selected agent
   */
  selectAgentRoundRobin(agents) {
    // Simple round-robin: select agent with lowest last_assigned_index
    return agents.reduce((selected, agent) => {
      const selectedIndex = selected.last_assigned_index || 0;
      const agentIndex = agent.last_assigned_index || 0;
      return agentIndex < selectedIndex ? agent : selected;
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
    if (!callId) {
      throw new Error('Call ID is required');
    }

    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    const call = await pb.collection('calls').getOne(callId);
    const agent = await pb.collection('agents').getOne(agentId);

    if (!call) {
      throw new Error('Call not found');
    }

    if (!agent) {
      throw new Error('Agent not found');
    }

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
      last_assigned_index: (agent.last_assigned_index || 0) + 1,
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
  }

  /**
   * Get agent availability and current load.
   *
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} Agent availability info
   */
  async getAgentAvailability(agentId) {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    const agent = await pb.collection('agents').getOne(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

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
  }

  /**
   * Get current queue status.
   *
   * @param {string} queue - Queue name (optional)
   * @returns {Promise<Object>} Queue status
   */
  async getQueueStatus(queue = null) {
    let filter = 'status = "queued"';
    if (queue) {
      filter += ` && queue = "${queue}"`;
    }

    const queuedCalls = await pb.collection('calls').getFullList({
      filter,
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
  }

  /**
   * Get total number of agents.
   *
   * @returns {Promise<Object>} Agent count statistics
   */
  async getTotalAgents() {
    const allAgents = await pb.collection('agents').getFullList();
    const availableAgents = allAgents.filter((a) => a.status === 'available');
    const busyAgents = allAgents.filter((a) => a.status === 'busy');
    const onBreakAgents = allAgents.filter((a) => a.status === 'on_break');
    const offlineAgents = allAgents.filter((a) => a.status === 'offline');

    logger.info(`Agent statistics: Total=${allAgents.length}, Available=${availableAgents.length}, Busy=${busyAgents.length}`);

    return {
      total: allAgents.length,
      available: availableAgents.length,
      busy: busyAgents.length,
      onBreak: onBreakAgents.length,
      offline: offlineAgents.length,
    };
  }
}

export default new CallRoutingService();