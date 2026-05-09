import express from 'express';
import RecordingService from '../services/recording/RecordingService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /recording/store
 * Store a recording from provider URL
 */
router.post('/store', async (req, res) => {
  const { callId, recordingUrl, metadata } = req.body;

  if (!callId || !recordingUrl) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: callId, recordingUrl',
    });
  }

  const result = await RecordingService.storeRecording(callId, recordingUrl, metadata);

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * GET /recording/:recordingId
 * Get recording metadata
 */
router.get('/:recordingId', async (req, res) => {
  const { recordingId } = req.params;

  if (!recordingId) {
    return res.status(400).json({
      success: false,
      error: 'Recording ID is required',
    });
  }

  const result = await RecordingService.getRecording(recordingId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /recording/:recordingId/transcribe
 * Transcribe a recording
 */
router.post('/:recordingId/transcribe', async (req, res) => {
  const { recordingId } = req.params;

  if (!recordingId) {
    return res.status(400).json({
      success: false,
      error: 'Recording ID is required',
    });
  }

  const result = await RecordingService.transcribeRecording(recordingId);

  res.json({
    success: !result.fallback,
    data: result,
  });
});

/**
 * POST /recording/:transcriptionId/summary
 * Generate summary from transcription
 */
router.post('/:transcriptionId/summary', async (req, res) => {
  const { transcriptionId } = req.params;

  if (!transcriptionId) {
    return res.status(400).json({
      success: false,
      error: 'Transcription ID is required',
    });
  }

  const result = await RecordingService.generateSummary(transcriptionId);

  res.json({
    success: !result.fallback,
    data: result,
  });
});

/**
 * GET /recording/call/:callId
 * Get all recordings for a call
 */
router.get('/call/:callId', async (req, res) => {
  const { callId } = req.params;

  if (!callId) {
    return res.status(400).json({
      success: false,
      error: 'Call ID is required',
    });
  }

  const result = await RecordingService.getCallRecordings(callId);

  res.json({
    success: true,
    data: result,
    count: result.length,
  });
});

/**
 * GET /recording/transcription/:recordingId
 * Get transcription for a recording
 */
router.get('/transcription/:recordingId', async (req, res) => {
  const { recordingId } = req.params;

  if (!recordingId) {
    return res.status(400).json({
      success: false,
      error: 'Recording ID is required',
    });
  }

  const result = await RecordingService.getTranscription(recordingId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * GET /recording/summary/:callId
 * Get summary for a call
 */
router.get('/summary/:callId', async (req, res) => {
  const { callId } = req.params;

  if (!callId) {
    return res.status(400).json({
      success: false,
      error: 'Call ID is required',
    });
  }

  const result = await RecordingService.getSummary(callId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * DELETE /recording/:recordingId
 * Delete a recording
 */
router.delete('/:recordingId', async (req, res) => {
  const { recordingId } = req.params;

  if (!recordingId) {
    return res.status(400).json({
      success: false,
      error: 'Recording ID is required',
    });
  }

  const result = await RecordingService.deleteRecording(recordingId);

  res.json({
    success: result.success,
    data: result,
  });
});

export default router;