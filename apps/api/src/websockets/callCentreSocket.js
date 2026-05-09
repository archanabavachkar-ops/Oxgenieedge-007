import logger from '../utils/logger.js';

module.exports = (io) => {
  const callCentreNamespace = io.of('/call-centre');

  callCentreNamespace.on('connection', (socket) => {
    logger.info(`Client connected to call-centre namespace: ${socket.id}`);

    // Handle call:initiated event
    socket.on('call:initiated', (data) => {
      logger.info(`Call initiated: ${data.call_id}`);

      // Broadcast to all agents
      callCentreNamespace.emit('call:initiated', {
        call_id: data.call_id,
        customer_id: data.customer_id,
        phone_number: data.phone_number,
        call_type: data.call_type,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:connected event
    socket.on('call:connected', (data) => {
      logger.info(`Call connected: ${data.call_id} - Agent: ${data.agent_id}`);

      // Broadcast to assigned agent
      callCentreNamespace.emit('call:connected', {
        call_id: data.call_id,
        agent_id: data.agent_id,
        customer_id: data.customer_id,
        connection_details: data.connection_details,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:ended event
    socket.on('call:ended', (data) => {
      logger.info(`Call ended: ${data.call_id}`);

      // Broadcast call summary to all participants
      callCentreNamespace.emit('call:ended', {
        call_id: data.call_id,
        agent_id: data.agent_id,
        customer_id: data.customer_id,
        duration: data.duration,
        summary: data.summary,
        sentiment: data.sentiment,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle message:new event
    socket.on('message:new', (data) => {
      logger.info(`New message in conversation: ${data.conversation_id}`);

      // Broadcast to conversation participants
      callCentreNamespace.emit('message:new', {
        conversation_id: data.conversation_id,
        message_id: data.message_id,
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        content: data.content,
        channel: data.channel,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:status event
    socket.on('agent:status', (data) => {
      logger.info(`Agent status changed: ${data.agent_id} - ${data.status}`);

      // Broadcast to all supervisors
      callCentreNamespace.emit('agent:status', {
        agent_id: data.agent_id,
        status: data.status,
        available: data.available,
        current_call_id: data.current_call_id || null,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:join event
    socket.on('agent:join', (data) => {
      logger.info(`Agent joined: ${data.agent_id}`);

      socket.join(`agent:${data.agent_id}`);
      socket.join('agents');

      // Broadcast agent online status
      callCentreNamespace.emit('agent:online', {
        agent_id: data.agent_id,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:leave event
    socket.on('agent:leave', (data) => {
      logger.info(`Agent left: ${data.agent_id}`);

      socket.leave(`agent:${data.agent_id}`);
      socket.leave('agents');

      // Broadcast agent offline status
      callCentreNamespace.emit('agent:offline', {
        agent_id: data.agent_id,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle customer:join event
    socket.on('customer:join', (data) => {
      logger.info(`Customer joined: ${data.customer_id}`);

      socket.join(`customer:${data.customer_id}`);
      socket.join('customers');
    });

    // Handle customer:leave event
    socket.on('customer:leave', (data) => {
      logger.info(`Customer left: ${data.customer_id}`);

      socket.leave(`customer:${data.customer_id}`);
      socket.leave('customers');
    });

    // Handle supervisor:join event
    socket.on('supervisor:join', (data) => {
      logger.info(`Supervisor joined: ${data.supervisor_id}`);

      socket.join('supervisors');
      socket.join(`supervisor:${data.supervisor_id}`);
    });

    // Handle supervisor:leave event
    socket.on('supervisor:leave', (data) => {
      logger.info(`Supervisor left: ${data.supervisor_id}`);

      socket.leave('supervisors');
      socket.leave(`supervisor:${data.supervisor_id}`);
    });

    // Handle call:transfer event
    socket.on('call:transfer', (data) => {
      logger.info(`Call transferred: ${data.call_id} from ${data.from_agent_id} to ${data.to_agent_id}`);

      // Notify both agents
      callCentreNamespace.to(`agent:${data.to_agent_id}`).emit('call:transfer', {
        call_id: data.call_id,
        from_agent_id: data.from_agent_id,
        to_agent_id: data.to_agent_id,
        reason: data.reason,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:hold event
    socket.on('call:hold', (data) => {
      logger.info(`Call on hold: ${data.call_id}`);

      callCentreNamespace.emit('call:hold', {
        call_id: data.call_id,
        agent_id: data.agent_id,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle call:resume event
    socket.on('call:resume', (data) => {
      logger.info(`Call resumed: ${data.call_id}`);

      callCentreNamespace.emit('call:resume', {
        call_id: data.call_id,
        agent_id: data.agent_id,
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