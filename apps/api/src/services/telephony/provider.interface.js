/**
 * Abstract TelephonyProvider class defining the interface for telephony service implementations.
 * All telephony providers (Exotel, Twilio, etc.) must extend this class and implement all methods.
 */
export class TelephonyProvider {
  /**
   * Initialize the telephony provider with configuration.
   * Must be called before any other methods.
   *
   * @param {Object} config - Provider configuration object
   * @param {string} config.apiKey - API key for authentication
   * @param {string} config.apiSecret - API secret for authentication
   * @param {string} config.accountId - Account ID or SID
   * @param {string} config.phoneNumber - Default phone number for outbound calls
   * @returns {Promise<void>}
   * @throws {Error} If configuration is invalid or connection fails
   */
  async initialize(config) {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Initiate an outbound call.
   *
   * @param {Object} params - Call parameters
   * @param {string} params.phoneNumber - Recipient phone number (E.164 format)
   * @param {string} params.customerId - Customer ID for CRM integration
   * @param {string} params.agentId - Agent ID to connect call to
   * @param {string} [params.callbackUrl] - Webhook URL for call status updates
   * @param {Object} [params.metadata] - Additional metadata to store with call
   * @returns {Promise<Object>} Call object with {callId, status, initiatedAt}
   * @throws {Error} If phone number is invalid or call initiation fails
   */
  async initiateCall(params) {
    throw new Error('initiateCall() must be implemented by subclass');
  }

  /**
   * Handle incoming call webhook from provider.
   * Parse webhook data and create call record in database.
   *
   * @param {Object} webhookData - Webhook payload from provider
   * @param {string} webhookData.callId - Provider's call ID
   * @param {string} webhookData.from - Caller phone number
   * @param {string} webhookData.to - Called phone number
   * @param {string} [webhookData.callerId] - Caller ID name
   * @returns {Promise<Object>} Created call record with {id, callerId, status}
   * @throws {Error} If webhook data is invalid
   */
  async handleIncomingCall(webhookData) {
    throw new Error('handleIncomingCall() must be implemented by subclass');
  }

  /**
   * Update call status in provider and database.
   * Broadcast status change via WebSocket to agents and supervisors.
   *
   * @param {string} callId - Internal call ID
   * @param {string} status - New status (initiated, ringing, connected, on-hold, transferred, ended)
   * @param {Object} [metadata] - Additional status metadata
   * @returns {Promise<Object>} Updated call object
   * @throws {Error} If call not found or status update fails
   */
  async updateCallStatus(callId, status, metadata = {}) {
    throw new Error('updateCallStatus() must be implemented by subclass');
  }

  /**
   * Fetch and store call recording.
   * Download recording from provider, encrypt, and store in secure location.
   *
   * @param {string} callId - Internal call ID
   * @param {string} [recordingUrl] - Provider's recording URL (if not in call record)
   * @returns {Promise<Object>} Recording metadata with {recordingId, encryptedPath, duration, size}
   * @throws {Error} If recording not found or download fails
   */
  async fetchRecording(callId, recordingUrl = null) {
    throw new Error('fetchRecording() must be implemented by subclass');
  }

  /**
   * Stream audio for real-time processing (transcription, sentiment analysis).
   * Establish connection to provider's media stream and yield audio chunks.
   *
   * @param {string} callId - Internal call ID
   * @param {Function} onAudioChunk - Callback function for each audio chunk
   * @param {Object} [options] - Streaming options
   * @param {string} [options.format] - Audio format (pcm, wav, etc.)
   * @param {number} [options.sampleRate] - Sample rate in Hz
   * @returns {Promise<void>}
   * @throws {Error} If streaming connection fails
   */
  async streamAudio(callId, onAudioChunk, options = {}) {
    throw new Error('streamAudio() must be implemented by subclass');
  }

  /**
   * Get detailed call information from provider.
   *
   * @param {string} callId - Internal call ID
   * @returns {Promise<Object>} Call details with {callId, from, to, status, duration, recordingUrl, etc.}
   * @throws {Error} If call not found
   */
  async getCallDetails(callId) {
    throw new Error('getCallDetails() must be implemented by subclass');
  }

  /**
   * Transfer call to another agent or phone number.
   *
   * @param {string} callId - Internal call ID
   * @param {string} targetNumber - Target phone number or agent ID
   * @param {Object} [options] - Transfer options
   * @param {boolean} [options.blind] - Blind transfer (don't wait for answer)
   * @param {string} [options.reason] - Reason for transfer
   * @returns {Promise<Object>} Transfer result with {success, newCallId, status}
   * @throws {Error} If transfer fails
   */
  async transferCall(callId, targetNumber, options = {}) {
    throw new Error('transferCall() must be implemented by subclass');
  }

  /**
   * Mute or unmute call audio.
   *
   * @param {string} callId - Internal call ID
   * @param {boolean} mute - True to mute, false to unmute
   * @returns {Promise<Object>} Result with {callId, muted, timestamp}
   * @throws {Error} If mute operation fails
   */
  async muteCall(callId, mute) {
    throw new Error('muteCall() must be implemented by subclass');
  }

  /**
   * Place call on hold or resume from hold.
   *
   * @param {string} callId - Internal call ID
   * @param {boolean} hold - True to hold, false to resume
   * @param {Object} [options] - Hold options
   * @param {string} [options.musicUrl] - URL to hold music
   * @returns {Promise<Object>} Result with {callId, onHold, timestamp}
   * @throws {Error} If hold operation fails
   */
  async holdCall(callId, hold, options = {}) {
    throw new Error('holdCall() must be implemented by subclass');
  }

  /**
   * End call and trigger post-call processing.
   *
   * @param {string} callId - Internal call ID
   * @param {Object} [options] - End call options
   * @param {string} [options.reason] - Reason for ending call
   * @param {Object} [options.metadata] - Additional metadata
   * @returns {Promise<Object>} Call summary with {callId, duration, recordingUrl, status}
   * @throws {Error} If call end fails
   */
  async endCall(callId, options = {}) {
    throw new Error('endCall() must be implemented by subclass');
  }
}