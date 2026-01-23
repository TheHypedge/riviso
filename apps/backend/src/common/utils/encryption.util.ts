import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encryption utility for securely storing sensitive data like OAuth tokens
 */
export class EncryptionUtil {
  /**
   * Derive encryption key from password and salt
   */
  private static getKey(encryptionKey: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, 'sha512');
  }

  /**
   * Encrypt text using AES-256-GCM
   * @param text - Plain text to encrypt
   * @param encryptionKey - Encryption key (from environment)
   * @returns Base64 encoded encrypted data
   */
  static encrypt(text: string, encryptionKey: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.getKey(encryptionKey, salt);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    // Format: salt + iv + tag + encrypted data
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  /**
   * Decrypt encrypted text
   * @param encryptedData - Base64 encoded encrypted data
   * @param encryptionKey - Encryption key (from environment)
   * @returns Decrypted plain text
   */
  static decrypt(encryptedData: string, encryptionKey: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    const key = this.getKey(encryptionKey, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
