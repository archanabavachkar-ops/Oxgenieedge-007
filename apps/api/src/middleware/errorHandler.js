
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Server Error:', {
    message: err.message,
    stack: err.stack,
    isAbort: err.isAbort,
    response: err.response
  });

  // Handle PocketBase specific errors
  if (err.isAbort || err.response) {
    const status = err.status || 500;
    const message = err.response?.message || err.message || 'Database Error';
    return res.status(status).json({
      success: false,
      error: message,
      details: err.response?.data || {}
    });
  }

  // Handle standard HTTP errors with explicitly set statuses
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    error: message
  });
};
