
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for contact form submissions
 * Allows 100 requests per 15 minutes
 */
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many contact form submissions from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Rate limiter for integration endpoints
 * Allows 100 requests per 15 minutes
 */
export const integrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many integration requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Rate limiter for WhatsApp endpoints
 * Allows 50 requests per 15 minutes (stricter limit for messaging)
 */
export const whatsappLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per windowMs
  message: 'Too many WhatsApp requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
});
