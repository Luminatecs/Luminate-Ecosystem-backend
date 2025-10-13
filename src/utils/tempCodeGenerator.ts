/**
 * Temporary Code Generator Utility
 * Generates temporary codes and passwords for org ward first-time login
 */

import { randomUUID } from 'crypto';
import crypto from 'crypto';

export class TempCodeGenerator {
  /**
   * Generate temporary code with format: lumtempcode-{uuid}
   */
  static generate(): string {
    return `lumtempcode-${randomUUID()}`;
  }

  /**
   * Validate temp code format
   */
  static isValid(code: string): boolean {
    const regex = /^lumtempcode-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(code);
  }

  /**
   * Check if username is a temporary code
   */
  static isTempCode(username: string): boolean {
    return username.startsWith('lumtempcode-');
  }

  /**
   * Generate random password with sufficient complexity
   */
  static generatePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special
    
    // Fill remaining with random chars
    for (let i = password.length; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset.charAt(randomIndex);
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate expiry date (5 days from now)
   */
  static generateExpiryDate(days: number = 5): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate;
  }
}
