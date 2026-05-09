import 'dotenv/config';
import axios from 'axios';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { encryptData } from '../utils/encryption.js';

/**
 * Recording Service
 * Manages call recording storage, transcription, and analysis
 */
export class RecordingService {
  /**
   * Store recording from provider.
   *
   * @param {string} callId - Call ID
   * @param {string} recordingUrl - Recording URL from provider
   * @returns {Promise<Object>} Stored recording metadata
   */
  async storeRecording(callId, recordingUrl) {
    try {
      const call = await pb.collection('calls').getOne(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      // Download recording
      const response = await axios.get(recordingUrl, {
        responseType: 'arraybuffer',
      });

      const recordingBuffer = response.data;
      const encryptionKey = process.env.RECORDING_ENCRYPTION_KEY;

      // Encrypt recording
      const encrypted = encryptData(recordingBuffer, encryptionKey);

      // Store encrypted recording metadata
      const recordingRecord = await pb.collection('recordings').create({
        call_id: callId,
        provider_url: recordingUrl,
        encrypted_path: `recordings/${callId}_${Date.now()}.enc`,
        duration: call.duration || 0,
        size: encrypted.length,
        encrypted_at: new Date().toISOString(),
      });

      // Update call record with recording URL
      await pb.collection('calls').update(callId, {
        recording_id: recordingRecord.id,
        recording_url: recordingUrl,
        recording_stored_at: new Date().toISOString(),
      });

      logger.info(`Recording stored: ${recordingRecord.id} for call ${callId}`);

      return {
        recordingId: recordingRecord.id,
        callId,
        encryptedPath: recordingRecord.encrypted_path,
        duration: recordingRecord.duration,
        size: recordingRecord.size,
      };
    } catch (error) {
      logger.error(`Failed to store recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transcribe recording using Google Speech-to-Text.
   *
   * @param {string} recordingId - Recording ID
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeRecording(recordingId) {
    try {
      const recording = await pb.collection('recordings').getOne(recordingId);

      if (!recording) {
        throw new Error('Recording not found');
      }

      // In production, call Google Speech-to-Text API
      // For now, return placeholder
      const transcription = `[Transcription placeholder for recording ${recordingId}]`;

      // Store transcription
      const transcriptionRecord = await pb.collection('transcriptions').create({
        recording_id: recordingId,
        call_id: recording.call_id,
        text: transcription,
        language: 'en-IN',
        confidence: 0.95,
        transcribed_at: new Date().toISOString(),
      });

      logger.info(`Recording transcribed: ${transcriptionRecord.id}`);

      return {
        transcriptionId: transcriptionRecord.id,
        recordingId,
        text: transcription,
        language: 'en-IN',
        confidence: 0.95,
      };
    } catch (error) {
      logger.error(`Failed to transcribe recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate AI summary and sentiment analysis.
   *
   * @param {string} callId - Call ID
   * @param {string} transcription - Transcription text
   * @returns {Promise<Object>} Summary and sentiment
   */
  async generateSummary(callId, transcription) {
    try {
      const call = await pb.collection('calls').getOne(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      // In production, call AI service for summary
      // For now, return placeholder
      const summary = `Summary of call: ${transcription.substring(0, 100)}...`;
      const sentiment = 'positive';
      const sentimentScore = 0.85;

      // Store summary
      const summaryRecord = await pb.collection('call_summaries').create({
        call_id: callId,
        summary,
        sentiment,
        sentiment_score: sentimentScore,
        generated_at: new Date().toISOString(),
      });

      // Update call record
      await pb.collection('calls').update(callId, {
        summary,
        sentiment,
        sentiment_score: sentimentScore,
      });

      logger.info(`Summary generated for call ${callId}`);

      return {
        callId,
        summary,
        sentiment,
        sentimentScore,
      };
    } catch (error) {
      logger.error(`Failed to generate summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze sentiment of transcription.
   *
   * @param {string} transcription - Transcription text
   * @returns {Promise<Object>} Sentiment analysis result
   */
  async analyzeSentiment(transcription) {
    try {
      if (!transcription || transcription.trim() === '') {
        throw new Error('Transcription is required');
      }

      // In production, call sentiment analysis API
      // For now, return placeholder
      const sentiment = 'neutral';
      const confidence = 0.75;
      const scores = {
        positive: 0.25,
        neutral: 0.75,
        negative: 0.0,
      };

      logger.info(`Sentiment analyzed: ${sentiment} (confidence: ${confidence})`);

      return {
        sentiment,
        confidence,
        scores,
      };
    } catch (error) {
      logger.error(`Failed to analyze sentiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect objections in transcription with timestamps.
   *
   * @param {string} transcription - Transcription text
   * @returns {Promise<Object>} Detected objections
   */
  async detectObjections(transcription) {
    try {
      if (!transcription || transcription.trim() === '') {
        throw new Error('Transcription is required');
      }

      // In production, use NLP to detect objections
      // For now, return placeholder
      const objections = [
        {
          type: 'price',
          text: 'too expensive',
          timestamp: 120,
          confidence: 0.85,
        },
        {
          type: 'timing',
          text: 'not right time',
          timestamp: 240,
          confidence: 0.72,
        },
      ];

      logger.info(`Objections detected: ${objections.length}`);

      return {
        objectionsFound: objections.length > 0,
        objections,
      };
    } catch (error) {
      logger.error(`Failed to detect objections: ${error.message}`);
      throw error;
    }
  }
}

export default new RecordingService();