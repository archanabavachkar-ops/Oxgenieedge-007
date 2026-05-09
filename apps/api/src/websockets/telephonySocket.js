import logger from '../utils/logger.js';

/**
 * Telephony WebSocket event handlers
 * Manages real-time communication for call centre operations
 */
export default (io) => {
  const callCentreNamespace = io.of('/call-centre');

  callCentreNamespace.on('connection', (socket) => {
    logger.info(`Client connected to call-centre namespace: ${socket.id}`);

    // Handle call:initiated event - broadcast to available agents
    socket.on('call:initiated', (data) => {
      logger.info(`Call initiated: ${data.callId}`);

      callCentreNamespace.emit('call:initiated', {
        callId: data.callId,
        phoneNumber: data.phoneNumber,
        customerId: data.customerId,
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:incoming event - broadcast to all available agents
    socket.on('call:incoming', (data) => {
      logger.info(`Call incoming: ${data.callId}`);

      callCentreNamespace.emit('call:incoming', {
        callId: data.callId,
        callerId: data.callerId,
        phoneNumber: data.phoneNumber,
        customerId: data.customerId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:connected event - send to agent and supervisors
    socket.on('call:connected', (data) => {
      logger.info(`Call connected: ${data.callId}`);

      callCentreNamespace.to(`agent:${data.agentId}`).emit('call:connected', {
        callId: data.callId,
        customerId: data.customerId,
        connectedAt: new Date().toISOString(),
        timer: 0,
      });

      callCentreNamespace.to('supervisors').emit('call:connected', {
        callId: data.callId,
        agentId: data.agentId,
        customerId: data.customerId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:status event - broadcast status changes
    socket.on('call:status', (data) => {
      logger.info(`Call status: ${data.callId} -> ${data.status}`);

      callCentreNamespace.emit('call:status', {
        callId: data.callId,
        status: data.status,
        agentId: data.agentId,
        customerId: data.customerId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:ended event - send call summary and recording
    socket.on('call:ended', (data) => {
      logger.info(`Call ended: ${data.callId}`);

      callCentreNamespace.emit('call:ended', {
        callId: data.callId,
        agentId: data.agentId,
        customerId: data.customerId,
        duration: data.duration,
        recordingUrl: data.recordingUrl,
        summary: data.summary,
        sentiment: data.sentiment,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:recording event - broadcast recording received
    socket.on('call:recording', (data) => {
      logger.info(`Call recording: ${data.callId}`);

      callCentreNamespace.emit('call:recording', {
        callId: data.callId,
        recordingUrl: data.recordingUrl,
        duration: data.duration,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle dtmf:input event - send to IVR processor
    socket.on('dtmf:input', (data) => {
      logger.info(`DTMF input: ${data.callId} - ${data.digits}`);

      callCentreNamespace.emit('dtmf:input', {
        callId: data.callId,
        digits: data.digits,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:status event - send to supervisors
    socket.on('agent:status', (data) => {
      logger.info(`Agent status: ${data.agentId} -> ${data.status}`);

      callCentreNamespace.to('supervisors').emit('agent:status', {
        agentId: data.agentId,
        status: data.status,
        available: data.available,
        currentCallId: data.currentCallId || null,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:join event
    socket.on('agent:join', (data) => {
      logger.info(`Agent joined: ${data.agentId}`);

      socket.join(`agent:${data.agentId}`);
      socket.join('agents');

      callCentreNamespace.to('supervisors').emit('agent:online', {
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:leave event
    socket.on('agent:leave', (data) => {
      logger.info(`Agent left: ${data.agentId}`);

      socket.leave(`agent:${data.agentId}`);
      socket.leave('agents');

      callCentreNamespace.to('supervisors').emit('agent:offline', {
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle customer:join event
    socket.on('customer:join', (data) => {
      logger.info(`Customer joined: ${data.customerId}`);

      socket.join(`customer:${data.customerId}`);
      socket.join('customers');
    });

    // Handle customer:leave event
    socket.on('customer:leave', (data) => {
      logger.info(`Customer left: ${data.customerId}`);

      socket.leave(`customer:${data.customerId}`);
      socket.leave('customers');
    });

    // Handle supervisor:join event
    socket.on('supervisor:join', (data) => {
      logger.info(`Supervisor joined: ${data.supervisorId}`);

      socket.join('supervisors');
      socket.join(`supervisor:${data.supervisorId}`);
    });

    // Handle supervisor:leave event
    socket.on('supervisor:leave', (data) => {
      logger.info(`Supervisor left: ${data.supervisorId}`);

      socket.leave('supervisors');
      socket.leave(`supervisor:${data.supervisorId}`);
    });

    // Handle call:transfer event
    socket.on('call:transfer', (data) => {
      logger.info(`Call transfer: ${data.callId} from ${data.fromAgentId} to ${data.toAgentId}`);

      callCentreNamespace.to(`agent:${data.toAgentId}`).emit('call:transfer', {
        callId: data.callId,
        fromAgentId: data.fromAgentId,
        toAgentId: data.toAgentId,
        reason: data.reason,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:hold event
    socket.on('call:hold', (data) => {
      logger.info(`Call on hold: ${data.callId}`);

      callCentreNamespace.emit('call:hold', {
        callId: data.callId,
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:resume event
    socket.on('call:resume', (data) => {
      logger.info(`Call resumed: ${data.callId}`);

      callCentreNamespace.emit('call:resume', {
        callId: data.callId,
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
      logger.info(`Client disconnected from call-centre namespace: ${socket.id}`);
    });
  });

  return callCentreNamespace;
};