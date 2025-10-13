/**
 * Temporary Credential Service
 * Handles temporary login credentials for org ward first-time login
 */

import { db } from '../uitls/queryutils/database';
import { TemporaryCredential, TemporaryCredentialResponse } from '../models/TemporaryCredential';
import { TempCodeGenerator } from '../utils/tempCodeGenerator';
import bcrypt from 'bcryptjs';

export class TemporaryCredentialService {
  private readonly EXPIRY_DAYS = 5;

  /**
   * Generate temporary credentials for a user
   */
  async generateTempCredentials(userId: string): Promise<TemporaryCredentialResponse> {
    try {
      // Generate temp code and password
      const tempCode = TempCodeGenerator.generate();
      const tempPassword = TempCodeGenerator.generatePassword();
      const expiresAt = TempCodeGenerator.generateExpiryDate(this.EXPIRY_DAYS);

      // Hash the temporary password
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Store in database
      const query = `
        INSERT INTO temporary_credentials (
          user_id, temp_code, temp_password, expires_at, is_used, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      await db.query(query, [
        userId,
        tempCode,
        hashedPassword,
        expiresAt,
        false,
        new Date()
      ]);

      console.log('✅ TemporaryCredentialService: Temp credentials generated', {
        userId,
        tempCode,
        expiresAt
      });

      // Return plain credentials for email (password is not hashed in response)
      return {
        tempCode,
        tempPassword, // Return plain password for email
        expiresAt
      };
    } catch (error) {
      console.error('❌ TemporaryCredentialService: Failed to generate temp credentials', error);
      throw error;
    }
  }

  /**
   * Validate temporary credentials
   */
  async validateTempCredentials(tempCode: string, password: string): Promise<{
    isValid: boolean;
    userId?: string;
    error?: string;
  }> {
    try {
      // Validate code format first
      if (!TempCodeGenerator.isValid(tempCode)) {
        return {
          isValid: false,
          error: 'Invalid temporary code format'
        };
      }

      // Get credentials from database
      const query = `
        SELECT 
          id,
          user_id as "userId",
          temp_code as "tempCode",
          temp_password as "tempPassword",
          expires_at as "expiresAt",
          is_used as "isUsed"
        FROM temporary_credentials
        WHERE temp_code = $1
      `;

      const result = await db.query<TemporaryCredential>(query, [tempCode]);

      if (result.rows.length === 0) {
        console.warn('⚠️  TemporaryCredentialService: Temp code not found', { tempCode });
        return {
          isValid: false,
          error: 'Invalid temporary credentials'
        };
      }

      const credential = result.rows[0];

      // Check if already used
      if (credential.isUsed) {
        console.warn('⚠️  TemporaryCredentialService: Temp code already used', { tempCode });
        return {
          isValid: false,
          error: 'These credentials have already been used. Please contact your administrator.'
        };
      }

      // Check if expired
      if (new Date() > new Date(credential.expiresAt)) {
        console.warn('⚠️  TemporaryCredentialService: Temp code expired', { tempCode, expiresAt: credential.expiresAt });
        return {
          isValid: false,
          error: 'These credentials have expired. Please contact your administrator.'
        };
      }

      // Verify password (skip if empty string - used when just validating code for password change)
      if (password) {
        const isPasswordValid = await bcrypt.compare(password, credential.tempPassword);

        if (!isPasswordValid) {
          console.warn('⚠️  TemporaryCredentialService: Invalid temp password', { tempCode });
          return {
            isValid: false,
            error: 'Invalid temporary credentials'
          };
        }
      }

      console.log('✅ TemporaryCredentialService: Temp credentials validated successfully', {
        tempCode,
        userId: credential.userId
      });

      return {
        isValid: true,
        userId: credential.userId
      };
    } catch (error) {
      console.error('❌ TemporaryCredentialService: Failed to validate temp credentials', error);
      throw error;
    }
  }

  /**
   * Check if credentials are expired
   */
  async isExpired(tempCode: string): Promise<boolean> {
    try {
      const query = `
        SELECT expires_at as "expiresAt"
        FROM temporary_credentials
        WHERE temp_code = $1
      `;

      const result = await db.query<{ expiresAt: Date }>(query, [tempCode]);

      if (result.rows.length === 0) {
        return true;
      }

      return new Date() > new Date(result.rows[0].expiresAt);
    } catch (error) {
      console.error('❌ TemporaryCredentialService: Failed to check expiry', error);
      throw error;
    }
  }

  /**
   * Invalidate temporary credentials after successful password change
   */
  async invalidateTempCredentials(tempCode: string): Promise<boolean> {
    try {
      const query = `
        UPDATE temporary_credentials
        SET is_used = true
        WHERE temp_code = $1
        RETURNING id
      `;

      const result = await db.query(query, [tempCode]);

      const invalidated = result.rowCount > 0;

      if (invalidated) {
        console.log('✅ TemporaryCredentialService: Temp credentials invalidated', { tempCode });
      } else {
        console.warn('⚠️  TemporaryCredentialService: Temp code not found for invalidation', { tempCode });
      }

      return invalidated;
    } catch (error) {
      console.error('❌ TemporaryCredentialService: Failed to invalidate temp credentials', error);
      throw error;
    }
  }

  /**
   * Clean up expired credentials (can be run as cron job)
   */
  async cleanupExpiredCredentials(): Promise<number> {
    try {
      const query = `
        DELETE FROM temporary_credentials
        WHERE expires_at < NOW()
        OR is_used = true
      `;

      const result = await db.query(query);
      const deletedCount = result.rowCount || 0;

      console.log('🧹 TemporaryCredentialService: Cleaned up expired credentials', {
        deletedCount
      });

      return deletedCount;
    } catch (error) {
      console.error('❌ TemporaryCredentialService: Failed to cleanup expired credentials', error);
      throw error;
    }
  }

  /**
   * Get temp credential by user ID
   */
  async getTempCredentialByUserId(userId: string): Promise<TemporaryCredential | null> {
    try {
      const query = `
        SELECT 
          id,
          user_id as "userId",
          temp_code as "tempCode",
          temp_password as "tempPassword",
          expires_at as "expiresAt",
          is_used as "isUsed",
          created_at as "createdAt"
        FROM temporary_credentials
        WHERE user_id = $1
        AND is_used = false
        AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await db.query<TemporaryCredential>(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ TemporaryCredentialService: Failed to get temp credential by user ID', error);
      throw error;
    }
  }
}

export const temporaryCredentialService = new TemporaryCredentialService();
