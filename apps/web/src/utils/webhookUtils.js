
import apiServerClient from '@/lib/apiServerClient';

/**
 * Generates the full webhook URL for external services to call.
 * @param {string} endpoint - The API endpoint path (e.g., '/integrations/facebook/webhook')
 * @returns {string} The full absolute URL
 */
export const generateWebhookUrl = (endpoint) => {
  const baseUrl = window.location.origin;
  // The API server is mounted at /hcgi/api
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/hcgi/api${cleanEndpoint}`;
};

/**
 * Sends a test payload to the specified webhook endpoint.
 * @param {string} endpoint - The API endpoint path
 * @param {object} payload - The JSON payload to send
 * @returns {Promise<{success: boolean, status: number, data: any, duration: number}>}
 */
export const sendTestPayload = async (endpoint, payload) => {
  const startTime = performance.now();
  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await apiServerClient.fetch(cleanEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const duration = Math.round(performance.now() - startTime);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }

    return {
      success: response.ok,
      status: response.status,
      data,
      duration,
    };
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    return {
      success: false,
      status: 0,
      data: { error: error.message },
      duration,
    };
  }
};

/**
 * Formats a webhook log entry for display.
 * @param {object} logEntry - The raw log entry from PocketBase
 * @returns {object} Formatted log entry
 */
export const formatWebhookLog = (logEntry) => {
  if (!logEntry) return null;
  
  let parsedPayload = logEntry.payload;
  if (typeof parsedPayload === 'string') {
    try {
      parsedPayload = JSON.parse(parsedPayload);
    } catch (e) {
      // Keep as string if parsing fails
    }
  }

  return {
    id: logEntry.id,
    timestamp: new Date(logEntry.timestamp || logEntry.created).toLocaleString(),
    endpoint: logEntry.endpoint || 'Unknown',
    source: logEntry.endpoint?.includes('facebook') ? 'Facebook' : 
            logEntry.endpoint?.includes('whatsapp') ? 'WhatsApp' : 'Other',
    status: logEntry.status || 'unknown',
    error: logEntry.error,
    payload: parsedPayload,
    preview: logEntry.error || (parsedPayload ? JSON.stringify(parsedPayload).substring(0, 60) + '...' : 'No payload'),
  };
};

/**
 * Calculates rate limit percentage and status.
 * @param {number} requestCount - Current number of requests
 * @param {number} limit - Maximum allowed requests
 * @param {number} windowMinutes - Time window in minutes
 * @returns {object} Rate limit status object
 */
export const calculateRateLimitStatus = (requestCount, limit, windowMinutes) => {
  const safeCount = Math.max(0, requestCount || 0);
  const safeLimit = Math.max(1, limit || 1);
  const percentage = Math.min(100, Math.round((safeCount / safeLimit) * 100));
  
  let status = 'healthy';
  if (percentage >= 90) status = 'critical';
  else if (percentage >= 75) status = 'warning';

  return {
    percentage,
    status,
    remaining: Math.max(0, safeLimit - safeCount),
    text: `${safeCount} / ${safeLimit} per ${windowMinutes}m`,
  };
};

/**
 * Copies text to the clipboard.
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
};
