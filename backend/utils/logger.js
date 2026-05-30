/**
 * Logger Utility
 * Provides a standardized way to log information and errors.
 * You can later replace this with a more advanced library like Winston or Pino.
 */

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? meta : '');
    }
  }
};

module.exports = logger;
