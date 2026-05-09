import crypto from 'crypto';

/**
 * Encrypt data using AES-256-CBC.
 *
 * @param {Buffer|string} data - Data to encrypt
 * @param {string} key - Encryption key (32 bytes for AES-256)
 * @returns {Buffer} Encrypted data with IV prepended
 */
export function encryptData(data, key) {
  if (!key || key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes for AES-256');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return IV + encrypted data
  return Buffer.concat([iv, encrypted]);
}

/**
 * Decrypt data using AES-256-CBC.
 *
 * @param {Buffer} encryptedData - Encrypted data with IV prepended
 * @param {string} key - Encryption key (32 bytes for AES-256)
 * @returns {Buffer} Decrypted data
 */
export function decryptData(encryptedData, key) {
  if (!key || key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes for AES-256');
  }

  // Extract IV from first 16 bytes
  const iv = encryptedData.slice(0, 16);
  const encrypted = encryptedData.slice(16);

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}