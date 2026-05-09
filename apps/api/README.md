# Call Centre & Omnichannel API Documentation

This module provides the backend infrastructure for the AI-powered Call Centre and Omnichannel communication system.

## REST API Endpoints

All endpoints are prefixed with `/call-centre`.

### Calls Management
- `GET /call-centre/calls` - Fetch paginated calls list. Accepts query params: `date`, `agent`, `status`.
- `GET /call-centre/calls/:id` - Fetch details for a specific call including transcription and AI summary.
- `POST /call-centre/calls` - Create a new call record.
- `PUT /call-centre/calls/:id` - Update call details (status, notes, sentiment).

### Conversations & Messaging
- `GET /call-centre/conversations` - Fetch paginated conversations. Accepts query params: `customer`, `agent`, `channel`.
- `GET /call-centre/conversations/:id` - Fetch a specific conversation and its message thread.
- `POST /call-centre/messages` - Send a new message in a conversation.

### Credits & Billing
- `GET /call-centre/credits` - Retrieve current user's credit usage and limits.
- `POST /call-centre/credits/deduct` - Deduct credits for usage (internal/admin use).

## WebSocket Events (Socket.io)

Connect to the `/call-centre` namespace for real-time updates.

### Emitted Events (Server to Client)
- `call:initiated` - Broadcast when a new inbound call arrives.
- `call:connected` - Sent to the assigned agent when a call connects.
- `call:ended` - Broadcast when a call finishes, includes summary data.
- `message:new` - Broadcast when a new message is added to an active conversation.
- `agent:status` - Broadcast agent availability changes.

### Received Events (Client to Server)
- `agent:join` / `agent:leave` - Manage agent presence.
- `call:hold` / `call:resume` - Update call state.
- `call:transfer` - Initiate a call transfer to another agent.

## Configuration
Configuration is managed in `src/config/callCentreConfig.js`, including SLA timers, AI model selection, and provider credentials.