import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Recording Service
 * Manages call recording storage, encryption, transcription, and analysis
 */
export class RecordingService {
  constructor() {
    this.encryptionKey = process.env.RECORDING_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
    this.storageDir = process.env.RECORDING_STORAGE_DIR || './recordings';
    this.retentionDays = parseInt(process.env.RECORDING_RETENTION_DAYS || '90');
    this.transcriptionLanguage = process.env.TRANSCRIPTION_LANGUAGE || 'en-US';
    this.googleSpeechApiKey = process.env.GOOGLE_SPEECH_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    // Ensure storage directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Encrypt recording data using AES-256-CBC
   *
   * @param {Buffer} data - Recording data to encrypt
   * @returns {Object} Encrypted data with {iv, encryptedData, algorithm}
   */
  encryptRecording(data) {
    try {
      if (!data || data.length === 0) {
        throw new Error('Recording data is required');
      }

      if (this.encryptionKey.length !== 32) {
        throw new Error('Encryption key must be 32 bytes for AES-256');
      }

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);

      let encrypted = cipher.update(data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      logger.info(`Recording encrypted: ${encrypted.length} bytes`);

      return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
        algorithm: 'aes-256-cbc',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to encrypt recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrypt recording data using AES-256-CBC
   *
   * @param {string} encryptedData - Hex-encoded encrypted data
   * @param {string} iv - Hex-encoded initialization vector
   * @returns {Buffer} Decrypted recording data
   */
  decryptRecording(encryptedData, iv) {
    try {
      if (!encryptedData || !iv) {
        throw new Error('Encrypted data and IV are required');
      }

      if (this.encryptionKey.length !== 32) {
        throw new Error('Encryption key must be 32 bytes for AES-256');
      }

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(this.encryptionKey),
        Buffer.from(iv, 'hex')
      );

      let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      logger.info(`Recording decrypted: ${decrypted.length} bytes`);

      return decrypted;
    } catch (error) {
      logger.error(`Failed to decrypt recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Store recording from provider URL
   *
   * @param {string} callId - Call ID
   * @param {string} recordingUrl - Recording URL from provider
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Stored recording metadata
   */
  async storeRecording(callId, recordingUrl, metadata = {}) {
    try {
      if (!callId || !recordingUrl) {
        throw new Error('Call ID and recording URL are required');
      }

      // Download recording
      logger.info(`Downloading recording from ${recordingUrl}`);
      const response = await axios.get(recordingUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const recordingBuffer = response.data;
      const fileSize = recordingBuffer.length;

      // Encrypt recording
      const encrypted = this.encryptRecording(recordingBuffer);

      // Generate filename
      const filename = `${callId}_${Date.now()}.enc`;
      const filepath = path.join(this.storageDir, filename);

      // Store encrypted file
      fs.writeFileSync(filepath, Buffer.from(encrypted.encryptedData, 'hex'));

      // Create recording record in PocketBase
      const recordingRecord = await pb.collection('call_recordings').create({
        call_id: callId,
        provider_url: recordingUrl,
        encrypted_path: filepath,
        file_size: fileSize,
        iv: encrypted.iv,
        algorithm: encrypted.algorithm,
        stored_at: encrypted.timestamp,
        metadata: JSON.stringify(metadata),
      });

      logger.info(`Recording stored: ${recordingRecord.id} for call ${callId}`);

      return {
        recordingId: recordingRecord.id,
        callId,
        fileSize,
        storedAt: recordingRecord.stored_at,
        encryptionAlgorithm: encrypted.algorithm,
      };
    } catch (error) {
      logger.error(`Failed to store recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve recording by ID
   *
   * @param {string} recordingId - Recording ID
   * @returns {Promise<Object>} Recording metadata
   */
  async getRecording(recordingId) {
    try {
      if (!recordingId) {
        throw new Error('Recording ID is required');
      }

      const recording = await pb.collection('call_recordings').getOne(recordingId);

      if (!recording) {
        throw new Error('Recording not found');
      }

      logger.info(`Recording retrieved: ${recordingId}`);

      return {
        recordingId: recording.id,
        callId: recording.call_id,
        fileSize: recording.file_size,
        storedAt: recording.stored_at,
        encryptionAlgorithm: recording.algorithm,
        metadata: recording.metadata ? JSON.parse(recording.metadata) : {},
      };
    } catch (error) {
      logger.error(`Failed to get recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete recording and cleanup encrypted file
   *
   * @param {string} recordingId - Recording ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRecording(recordingId) {
    try {
      if (!recordingId) {
        throw new Error('Recording ID is required');
      }

      const recording = await pb.collection('call_recordings').getOne(recordingId);

      if (!recording) {
        throw new Error('Recording not found');
      }

      // Delete encrypted file
      if (fs.existsSync(recording.encrypted_path)) {
        fs.unlinkSync(recording.encrypted_path);
        logger.info(`Encrypted file deleted: ${recording.encrypted_path}`);
      }

      // Delete recording record
      await pb.collection('call_recordings').delete(recordingId);

      logger.info(`Recording deleted: ${recordingId}`);

      return {
        success: true,
        recordingId,
        message: 'Recording deleted successfully',
      };
    } catch (error) {
      logger.error(`Failed to delete recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transcribe recording using Google Speech-to-Text
   *
   * @param {string} recordingId - Recording ID
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeRecording(recordingId) {
    try {
      if (!recordingId) {
        throw new Error('Recording ID is required');
      }

      const recording = await pb.collection('call_recordings').getOne(recordingId);

      if (!recording) {
        throw new Error('Recording not found');
      }

      // Check if transcription already exists
      const existingTranscriptions = await pb.collection('call_transcriptions').getFullList({
        filter: `recording_id = "${recordingId}"`,
      }).catch(() => []);

      if (existingTranscriptions.length > 0) {
        logger.info(`Transcription already exists for recording ${recordingId}`);
        return {
          transcriptionId: existingTranscriptions[0].id,
          recordingId,
          text: existingTranscriptions[0].text,
          language: existingTranscriptions[0].language,
          confidence: existingTranscriptions[0].confidence,
        };
      }

      // Call transcription service
      const transcriptionResult = await this.callTranscriptionService(recordingId, recording);

      // Store transcription
      const transcriptionRecord = await pb.collection('call_transcriptions').create({
        recording_id: recordingId,
        call_id: recording.call_id,
        text: transcriptionResult.text,
        language: this.transcriptionLanguage,
        confidence: transcriptionResult.confidence || 0.85,
        duration: transcriptionResult.duration || 0,
        transcribed_at: new Date().toISOString(),
      });

      logger.info(`Recording transcribed: ${transcriptionRecord.id}`);

      return {
        transcriptionId: transcriptionRecord.id,
        recordingId,
        text: transcriptionResult.text,
        language: this.transcriptionLanguage,
        confidence: transcriptionResult.confidence || 0.85,
      };
    } catch (error) {
      logger.error(`Failed to transcribe recording: ${error.message}`);
      // Return fallback response
      return {
        success: false,
        error: error.message,
        fallback: true,
        message: 'Transcription service unavailable. Please try again later.',
      };
    }
  }

  /**
   * Generate AI summary from transcription
   *
   * @param {string} transcriptionId - Transcription ID
   * @returns {Promise<Object>} Summary result
   */
  async generateSummary(transcriptionId) {
    try {
      if (!transcriptionId) {
        throw new Error('Transcription ID is required');
      }

      const transcription = await pb.collection('call_transcriptions').getOne(transcriptionId);

      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Check if summary already exists
      const existingSummaries = await pb.collection('call_summaries').getFullList({
        filter: `transcription_id = "${transcriptionId}"`,
      }).catch(() => []);

      if (existingSummaries.length > 0) {
        logger.info(`Summary already exists for transcription ${transcriptionId}`);
        return {
          summaryId: existingSummaries[0].id,
          transcriptionId,
          summary: existingSummaries[0].summary,
          keyPoints: existingSummaries[0].key_points ? JSON.parse(existingSummaries[0].key_points) : [],
          sentiment: existingSummaries[0].sentiment,
        };
      }

      // Call AI summary service
      const summaryResult = await this.callAISummaryService(transcription.text);

      // Extract key points
      const keyPoints = this.extractKeyPoints(transcription.text);

      // Analyze sentiment
      const sentiment = await this.analyzeSentiment(transcription.text);

      // Store summary
      const summaryRecord = await pb.collection('call_summaries').create({
        transcription_id: transcriptionId,
        call_id: transcription.call_id,
        recording_id: transcription.recording_id,
        summary: summaryResult.summary,
        key_points: JSON.stringify(keyPoints),
        sentiment: sentiment.sentiment,
        sentiment_score: sentiment.score,
        generated_at: new Date().toISOString(),
      });

      logger.info(`Summary generated: ${summaryRecord.id}`);

      return {
        summaryId: summaryRecord.id,
        transcriptionId,
        summary: summaryResult.summary,
        keyPoints,
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
      };
    } catch (error) {
      logger.error(`Failed to generate summary: ${error.message}`);
      // Return fallback response
      return {
        success: false,
        error: error.message,
        fallback: true,
        message: 'Summary generation service unavailable. Please try again later.',
      };
    }
  }

  /**
   * Extract key points from transcription text
   *
   * @param {string} text - Transcription text
   * @returns {Array} Array of key points
   */
  extractKeyPoints(text) {
    try {
      if (!text || text.length === 0) {
        return [];
      }

      // Simple key point extraction: sentences with important keywords
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const keywords = ['important', 'urgent', 'critical', 'issue', 'problem', 'solution', 'action', 'required', 'deadline', 'follow-up'];

      const keyPoints = sentences
        .filter((sentence) => {
          const lowerSentence = sentence.toLowerCase();
          return keywords.some((keyword) => lowerSentence.includes(keyword));
        })
        .slice(0, 5) // Limit to 5 key points
        .map((s) => s.trim());

      logger.info(`Extracted ${keyPoints.length} key points from transcription`);

      return keyPoints;
    } catch (error) {
      logger.warn(`Failed to extract key points: ${error.message}`);
      return [];
    }
  }

  /**
   * Analyze sentiment of transcription text
   *
   * @param {string} text - Transcription text
   * @returns {Promise<Object>} Sentiment analysis result
   */
  async analyzeSentiment(text) {
    try {
      if (!text || text.length === 0) {
        return { sentiment: 'neutral', score: 0.5 };
      }

      // Simple sentiment analysis based on keywords
      const positiveKeywords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'pleased', 'wonderful', 'amazing'];
      const negativeKeywords = ['bad', 'poor', 'terrible', 'angry', 'frustrated', 'disappointed', 'awful', 'horrible'];

      const lowerText = text.toLowerCase();
      const positiveCount = positiveKeywords.filter((keyword) => lowerText.includes(keyword)).length;
      const negativeCount = negativeKeywords.filter((keyword) => lowerText.includes(keyword)).length;

      let sentiment = 'neutral';
      let score = 0.5;

      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        score = Math.min(0.5 + (positiveCount * 0.1), 1.0);
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        score = Math.max(0.5 - (negativeCount * 0.1), 0.0);
      }

      logger.info(`Sentiment analyzed: ${sentiment} (score: ${score})`);

      return { sentiment, score };
    } catch (error) {
      logger.warn(`Failed to analyze sentiment: ${error.message}`);
      return { sentiment: 'neutral', score: 0.5 };
    }
  }

  /**
   * Call transcription service (Google Speech-to-Text)
   *
   * @param {string} recordingId - Recording ID
   * @param {Object} recording - Recording object
   * @returns {Promise<Object>} Transcription result
   */
  async callTranscriptionService(recordingId, recording) {
    try {
      if (!this.googleSpeechApiKey) {
        logger.warn('Google Speech API key not configured');
        return {
          text: '[Transcription service unavailable]',
          confidence: 0,
          duration: 0,
        };
      }

      // In production, call Google Speech-to-Text API
      // For now, return placeholder
      logger.info(`Transcription service called for recording ${recordingId}`);

      return {
        text: '[Transcription placeholder - configure Google Speech API]',
        confidence: 0.85,
        duration: 0,
      };
    } catch (error) {
      logger.error(`Transcription service error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Call AI summary service (OpenAI)
   *
   * @param {string} text - Transcription text
   * @returns {Promise<Object>} Summary result
   */
  async callAISummaryService(text) {
    try {
      if (!this.openaiApiKey) {
        logger.warn('OpenAI API key not configured');
        return {
          summary: '[Summary service unavailable]',
        };
      }

      // In production, call OpenAI API
      // For now, return placeholder
      logger.info('AI summary service called');

      return {
        summary: `[Summary placeholder - configure OpenAI API] Text length: ${text.length} characters`,
      };
    } catch (error) {
      logger.error(`AI summary service error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all recordings for a call
   *
   * @param {string} callId - Call ID
   * @returns {Promise<Array>} Array of recordings
   */
  async getCallRecordings(callId) {
    try {
      if (!callId) {
        throw new Error('Call ID is required');
      }

      const recordings = await pb.collection('call_recordings').getFullList({
        filter: `call_id = "${callId}"`,
        sort: '-stored_at',
      });

      logger.info(`Retrieved ${recordings.length} recordings for call ${callId}`);

      return recordings.map((recording) => ({
        recordingId: recording.id,
        callId: recording.call_id,
        fileSize: recording.file_size,
        storedAt: recording.stored_at,
        encryptionAlgorithm: recording.algorithm,
      }));
    } catch (error) {
      logger.error(`Failed to get call recordings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transcription for a recording
   *
   * @param {string} recordingId - Recording ID
   * @returns {Promise<Object>} Transcription data
   */
  async getTranscription(recordingId) {
    try {
      if (!recordingId) {
        throw new Error('Recording ID is required');
      }

      const transcriptions = await pb.collection('call_transcriptions').getFullList({
        filter: `recording_id = "${recordingId}"`,
      });

      if (transcriptions.length === 0) {
        throw new Error('Transcription not found');
      }

      const transcription = transcriptions[0];

      logger.info(`Transcription retrieved: ${transcription.id}`);

      return {
        transcriptionId: transcription.id,
        recordingId: transcription.recording_id,
        callId: transcription.call_id,
        text: transcription.text,
        language: transcription.language,
        confidence: transcription.confidence,
        duration: transcription.duration,
        transcribedAt: transcription.transcribed_at,
      };
    } catch (error) {
      logger.error(`Failed to get transcription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get summary for a call
   *
   * @param {string} callId - Call ID
   * @returns {Promise<Object>} Summary data
   */
  async getSummary(callId) {
    try {
      if (!callId) {
        throw new Error('Call ID is required');
      }

      const summaries = await pb.collection('call_summaries').getFullList({
        filter: `call_id = "${callId}"`,
        sort: '-generated_at',
      });

      if (summaries.length === 0) {
        throw new Error('Summary not found');
      }

      const summary = summaries[0];

      logger.info(`Summary retrieved: ${summary.id}`);

      return {
        summaryId: summary.id,
        callId: summary.call_id,
        recordingId: summary.recording_id,
        summary: summary.summary,
        keyPoints: summary.key_points ? JSON.parse(summary.key_points) : [],
        sentiment: summary.sentiment,
        sentimentScore: summary.sentiment_score,
        generatedAt: summary.generated_at,
      };
    } catch (error) {
      logger.error(`Failed to get summary: ${error.message}`);
      throw error;
    }
  }
}

export default new RecordingService();