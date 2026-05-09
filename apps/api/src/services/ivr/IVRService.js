import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * IVR (Interactive Voice Response) Service
 * Manages IVR flows, execution state, and DTMF input processing
 */
export class IVRService {
  constructor() {
    // In-memory store for flow execution state
    // In production, this should be persisted to database
    this.flowExecutions = new Map();
  }

  /**
   * Create a new IVR flow with validation.
   *
   * @param {string} name - Flow name
   * @param {Array} steps - Array of IVR steps
   * @returns {Promise<Object>} Created flow with {id, name, steps, createdAt}
   */
  async createFlow(name, steps) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Flow name is required');
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('At least one step is required');
    }

    // Validate step structure
    for (const step of steps) {
      this.validateStep(step);
    }

    const flowRecord = await pb.collection('ivr_flows').create({
      name: name.trim(),
      steps: JSON.stringify(steps),
      is_active: true,
      created_at: new Date().toISOString(),
    });

    logger.info(`IVR flow created: ${flowRecord.id} - ${name}`);

    return {
      id: flowRecord.id,
      name: flowRecord.name,
      steps,
      createdAt: flowRecord.created_at,
    };
  }

  /**
   * Get all IVR flows.
   *
   * @returns {Promise<Array>} Array of flows
   */
  async getAllFlows() {
    const flows = await pb.collection('ivr_flows').getFullList({
      sort: '-created_at',
    });

    logger.info(`Retrieved ${flows.length} IVR flows`);

    return flows.map((flow) => ({
      id: flow.id,
      name: flow.name,
      steps: JSON.parse(flow.steps || '[]'),
      isActive: flow.is_active !== false,
      createdAt: flow.created_at,
      updatedAt: flow.updated_at,
    }));
  }

  /**
   * Get a specific IVR flow by ID.
   *
   * @param {string} flowId - Flow ID
   * @returns {Promise<Object>} Flow details
   */
  async getFlow(flowId) {
    if (!flowId) {
      throw new Error('Flow ID is required');
    }

    const flow = await pb.collection('ivr_flows').getOne(flowId);

    if (!flow) {
      throw new Error('IVR flow not found');
    }

    logger.info(`Retrieved IVR flow: ${flowId}`);

    return {
      id: flow.id,
      name: flow.name,
      steps: JSON.parse(flow.steps || '[]'),
      isActive: flow.is_active !== false,
      createdAt: flow.created_at,
      updatedAt: flow.updated_at,
    };
  }

  /**
   * Update an existing IVR flow.
   *
   * @param {string} flowId - Flow ID
   * @param {Object} updates - Fields to update {name, steps, isActive}
   * @returns {Promise<Object>} Updated flow
   */
  async updateFlow(flowId, updates) {
    if (!flowId) {
      throw new Error('Flow ID is required');
    }

    const flow = await pb.collection('ivr_flows').getOne(flowId);

    if (!flow) {
      throw new Error('IVR flow not found');
    }

    const updateData = {};

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim() === '') {
        throw new Error('Flow name must be a non-empty string');
      }
      updateData.name = updates.name.trim();
    }

    if (updates.steps !== undefined) {
      if (!Array.isArray(updates.steps) || updates.steps.length === 0) {
        throw new Error('At least one step is required');
      }
      for (const step of updates.steps) {
        this.validateStep(step);
      }
      updateData.steps = JSON.stringify(updates.steps);
    }

    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive;
    }

    updateData.updated_at = new Date().toISOString();

    const updatedFlow = await pb.collection('ivr_flows').update(flowId, updateData);

    logger.info(`IVR flow updated: ${flowId}`);

    return {
      id: updatedFlow.id,
      name: updatedFlow.name,
      steps: JSON.parse(updatedFlow.steps || '[]'),
      isActive: updatedFlow.is_active !== false,
      createdAt: updatedFlow.created_at,
      updatedAt: updatedFlow.updated_at,
    };
  }

  /**
   * Delete an IVR flow.
   *
   * @param {string} flowId - Flow ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFlow(flowId) {
    if (!flowId) {
      throw new Error('Flow ID is required');
    }

    const flow = await pb.collection('ivr_flows').getOne(flowId);

    if (!flow) {
      throw new Error('IVR flow not found');
    }

    await pb.collection('ivr_flows').delete(flowId);

    logger.info(`IVR flow deleted: ${flowId}`);

    return {
      success: true,
      message: 'IVR flow deleted successfully',
    };
  }

  /**
   * Execute IVR flow for a call.
   *
   * @param {string} callId - Call ID
   * @param {string} flowId - IVR flow ID
   * @returns {Promise<Object>} Flow execution with {executionId, callId, flowId, currentStep, status}
   */
  async executeFlow(callId, flowId) {
    if (!callId) {
      throw new Error('Call ID is required');
    }

    if (!flowId) {
      throw new Error('Flow ID is required');
    }

    const flow = await pb.collection('ivr_flows').getOne(flowId);

    if (!flow) {
      throw new Error('IVR flow not found');
    }

    const steps = JSON.parse(flow.steps || '[]');
    if (steps.length === 0) {
      throw new Error('Flow has no steps');
    }

    const firstStep = steps[0];

    // Create flow execution record
    const executionRecord = await pb.collection('ivr_executions').create({
      call_id: callId,
      flow_id: flowId,
      current_step_id: firstStep.id,
      status: 'in_progress',
      retry_count: 0,
      started_at: new Date().toISOString(),
    });

    // Store in memory
    this.flowExecutions.set(executionRecord.id, {
      executionId: executionRecord.id,
      callId,
      flowId,
      steps,
      currentStepIndex: 0,
      retryCount: 0,
      startedAt: executionRecord.started_at,
    });

    logger.info(`IVR flow started: ${executionRecord.id} for call ${callId}`);

    return {
      executionId: executionRecord.id,
      callId,
      flowId,
      currentStep: firstStep,
      status: 'in_progress',
    };
  }

  /**
   * Process DTMF input and determine next step.
   *
   * @param {string} executionId - Flow execution ID
   * @param {string} dtmfInput - DTMF input (0-9, *, #)
   * @returns {Promise<Object>} Next step or completion status
   */
  async processDTMFInput(executionId, dtmfInput) {
    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    if (!dtmfInput) {
      throw new Error('DTMF input is required');
    }

    const execution = this.flowExecutions.get(executionId);

    if (!execution) {
      throw new Error('Flow execution not found');
    }

    const currentStep = execution.steps[execution.currentStepIndex];

    if (currentStep.type === 'menu') {
      const nextStepId = currentStep.next_steps[dtmfInput];

      if (!nextStepId) {
        // Invalid input, retry
        execution.retryCount++;

        if (execution.retryCount >= (currentStep.retries || 3)) {
          // Max retries exceeded, hangup
          return {
            status: 'max_retries_exceeded',
            action: 'hangup',
          };
        }

        return {
          status: 'invalid_input',
          action: 'retry',
          currentStep,
          retryCount: execution.retryCount,
        };
      }

      // Find next step
      const nextStepIndex = execution.steps.findIndex((s) => s.id === nextStepId);
      const nextStep = execution.steps[nextStepIndex];

      execution.currentStepIndex = nextStepIndex;
      execution.retryCount = 0;

      // Update execution record
      await pb.collection('ivr_executions').update(executionId, {
        current_step_id: nextStep.id,
        updated_at: new Date().toISOString(),
      });

      logger.info(`IVR input processed: ${executionId} - Input: ${dtmfInput}, Next step: ${nextStep.id}`);

      if (nextStep.type === 'hangup') {
        return {
          status: 'completed',
          action: 'hangup',
        };
      }

      return {
        status: 'in_progress',
        currentStep: nextStep,
      };
    }

    return {
      status: 'invalid_step_type',
      error: 'Current step does not accept DTMF input',
    };
  }

  /**
   * Get current flow execution status.
   *
   * @param {string} executionId - Flow execution ID
   * @returns {Promise<Object>} Execution status
   */
  async getFlowStatus(executionId) {
    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    const execution = this.flowExecutions.get(executionId);

    if (!execution) {
      // Try to fetch from database
      const record = await pb.collection('ivr_executions').getOne(executionId);

      if (!record) {
        throw new Error('Flow execution not found');
      }

      return {
        executionId: record.id,
        callId: record.call_id,
        flowId: record.flow_id,
        currentStepId: record.current_step_id,
        status: record.status,
        retryCount: record.retry_count || 0,
        startedAt: record.started_at,
      };
    }

    const currentStep = execution.steps[execution.currentStepIndex];

    return {
      executionId,
      callId: execution.callId,
      flowId: execution.flowId,
      currentStep,
      status: 'in_progress',
      retryCount: execution.retryCount,
      startedAt: execution.startedAt,
    };
  }

  /**
   * Complete flow execution.
   *
   * @param {string} executionId - Flow execution ID
   * @param {string} reason - Completion reason
   * @returns {Promise<Object>} Completion result
   */
  async completeFlow(executionId, reason = 'completed') {
    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    const execution = this.flowExecutions.get(executionId);

    if (execution) {
      this.flowExecutions.delete(executionId);
    }

    // Update execution record
    await pb.collection('ivr_executions').update(executionId, {
      status: 'completed',
      completion_reason: reason,
      completed_at: new Date().toISOString(),
    });

    logger.info(`IVR flow completed: ${executionId} - Reason: ${reason}`);

    return {
      executionId,
      status: 'completed',
      reason,
    };
  }

  /**
   * Validate IVR step structure.
   *
   * @param {Object} step - Step to validate
   * @throws {Error} If step structure is invalid
   */
  validateStep(step) {
    if (!step.id || typeof step.id !== 'string') {
      throw new Error('Step must have a unique id');
    }

    if (!step.type || !['prompt', 'menu', 'transfer', 'hangup'].includes(step.type)) {
      throw new Error('Step type must be one of: prompt, menu, transfer, hangup');
    }

    if (step.type === 'prompt' || step.type === 'menu') {
      if (!step.message && !step.audio_url) {
        throw new Error('Prompt/Menu step must have message or audio_url');
      }
    }

    if (step.type === 'menu') {
      if (!step.next_steps || typeof step.next_steps !== 'object') {
        throw new Error('Menu step must have next_steps mapping');
      }
    }

    if (step.type === 'transfer') {
      if (!step.target_number && !step.target_agent) {
        throw new Error('Transfer step must have target_number or target_agent');
      }
    }
  }
}

export default new IVRService();