const isDev = process.env.NODE_ENV !== 'production';

const format = (level, message, data) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
  };
};

const logger = {
  info: (message, data) => {
    const log = format('INFO', message, data);
    isDev
      ? console.log(`[INFO] ${message}`, data || '')
      : console.log(JSON.stringify(log));
  },

  error: (message, error) => {
    const log = format('ERROR', message, {
      message: error?.message,
      stack: error?.stack,
    });

    isDev
      ? console.error(`[ERROR] ${message}`, error || '')
      : console.error(JSON.stringify(log));
  },

  warn: (message, data) => {
    const log = format('WARN', message, data);
    isDev
      ? console.warn(`[WARN] ${message}`, data || '')
      : console.warn(JSON.stringify(log));
  },
};

export default logger;