
import logger from '../utils/logger.js';

export class RetryQueue {
  /**
   * Executes a function with exponential backoff retries.
   * @param {Function} fn - Async function to execute
   * @param {number} retries - Number of total attempts (default 3)
   * @param {number} delayMs - Initial delay in ms (default 1000)
   */
  static async execute(fn, retries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === retries) {
          logger.error(`RetryQueue: All ${retries} attempts failed.`);
          throw error;
        }
        
        const nextDelay = delayMs * Math.pow(2, attempt - 1);
        logger.warn(`RetryQueue: Attempt ${attempt} failed. Retrying in ${nextDelay}ms. Error: ${error.message}`);
        
        await new Promise(resolve => setTimeout(resolve, nextDelay));
      }
    }
  }
}
