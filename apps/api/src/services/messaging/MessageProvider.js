/**
 * Abstract MessageProvider base class
 * All messaging service implementations must extend this class and implement all methods.
 */
export class MessageProvider {
  /**
   * Initialize the messaging provider with configuration.
   * Must be called before any other methods.
   *
   * @param {Object} config - Provider configuration object
   * @returns {Promise<void>}
   * @throws {Error} If configuration is invalid or connection fails
   */
  async initialize(config) {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Send a message.
   *
   * @param {string} to - Recipient identifier (phone, email, user ID, etc.)
   * @param {string} message - Message content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Message object with {messageId, status, sentAt}
   * @throws {Error} If message sending fails
   */
  async sendMessage(to, message, metadata = {}) {
    throw new Error('sendMessage() must be implemented by subclass');
  }

  /**
   * Handle incoming message webhook.
   *
   * @param {Object} webhookData - Webhook payload from provider
   * @returns {Promise<Object>} Created message record
   * @throws {Error} If webhook data is invalid
   */
  async handleIncomingMessage(webhookData) {
    throw new Error('handleIncomingMessage() must be implemented by subclass');
  }

  /**
   * Get message status.
   *
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Message status with {messageId, status, deliveredAt, readAt}
   * @throws {Error} If message not found
   */
  async getMessageStatus(messageId) {
    throw new Error('getMessageStatus() must be implemented by subclass');
  }

  /**
   * Get conversation history.
   *
   * @param {string} conversationId - Conversation ID
   * @param {Object} options - Query options {limit, offset}
   * @returns {Promise<Array>} Array of messages
   * @throws {Error} If conversation not found
   */
  async getConversationHistory(conversationId, options = {}) {
    throw new Error('getConversationHistory() must be implemented by subclass');
  }

  /**
   * Update message status.
   *
   * @param {string} messageId - Message ID
   * @param {string} status - New status (sent, delivered, read, failed)
   * @returns {Promise<Object>} Updated message
   * @throws {Error} If message not found or update fails
   */
  async updateMessageStatus(messageId, status) {
    throw new Error('updateMessageStatus() must be implemented by subclass');
  }

  /**
   * Delete a message.
   *
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Deletion result
   * @throws {Error} If message not found or deletion fails
   */
  async deleteMessage(messageId) {
    throw new Error('deleteMessage() must be implemented by subclass');
  }
}

export default MessageProvider;