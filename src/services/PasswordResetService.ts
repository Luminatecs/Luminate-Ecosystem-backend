/**
 * Password Reset Service
 * Handles password reset token generation, validation, and password updates
 */

import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../uitls/queryutils/database';
import { emailService } from './EmailService';

interface PasswordResetToken {
  id: string;
  user_id: string;
  reset_token: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}

interface CreateResetTokenResult {
  success: boolean;
  token?: string;
  message: string;
}

interface ValidateTokenResult {
  isValid: boolean;
  userId?: string;
  message: string;
}

export class PasswordResetService {
  /**
   * Generate a secure random reset token
   */
  private generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create a password reset token for a user
   */
  async createResetToken(email: string): Promise<CreateResetTokenResult> {
    try {
      console.log('🔐 PasswordResetService: Creating reset token for email', email);

      // Find user by email
      const userQuery = `
        SELECT id, first_name, last_name, email 
        FROM users 
        WHERE email = $1 AND deleted_at IS NULL
      `;
      const userResult = await db.query(userQuery, [email]);

      if (userResult.rows.length === 0) {
        console.warn('⚠️  PasswordResetService: User not found with email', email);
        // Don't reveal whether user exists or not
        return {
          success: true,
          message: 'If the email exists, a reset link will be sent'
        };
      }

      const user = userResult.rows[0];

      // Invalidate any existing unused tokens for this user
      const invalidateQuery = `
        UPDATE password_reset_tokens 
        SET is_used = true 
        WHERE user_id = $1 AND is_used = false
      `;
      await db.query(invalidateQuery, [user.id]);

      // Generate new reset token
      const resetToken = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store the reset token in database
      const insertQuery = `
        INSERT INTO password_reset_tokens 
        (user_id, reset_token, expires_at, is_used) 
        VALUES ($1, $2, $3, false) 
        RETURNING id
      `;
      await db.query(insertQuery, [user.id, resetToken, expiresAt]);

      // Construct reset URL
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      // Send email with reset link
      await emailService.sendPasswordResetEmail({
        userEmail: user.email,
        userName: `${user.first_name} ${user.last_name}`,
        resetToken,
        resetUrl,
        expiryDate: expiresAt
      });

      console.log('✅ PasswordResetService: Reset token created and email sent');

      return {
        success: true,
        token: resetToken,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('❌ PasswordResetService: Failed to create reset token', error);
      return {
        success: false,
        message: 'Failed to create password reset token'
      };
    }
  }

  /**
   * Validate a reset token
   */
  async validateResetToken(token: string): Promise<ValidateTokenResult> {
    try {
      console.log('🔍 PasswordResetService: Validating reset token');

      const query = `
        SELECT 
          id,
          user_id,
          reset_token,
          expires_at,
          is_used
        FROM password_reset_tokens
        WHERE reset_token = $1
      `;
      const result = await db.query(query, [token]);

      if (result.rows.length === 0) {
        console.warn('⚠️  PasswordResetService: Reset token not found');
        return {
          isValid: false,
          message: 'Invalid reset token'
        };
      }

      const resetToken: PasswordResetToken = result.rows[0];

      // Check if token is already used
      if (resetToken.is_used) {
        console.warn('⚠️  PasswordResetService: Reset token already used');
        return {
          isValid: false,
          message: 'This reset token has already been used'
        };
      }

      // Check if token is expired
      if (new Date() > new Date(resetToken.expires_at)) {
        console.warn('⚠️  PasswordResetService: Reset token expired');
        return {
          isValid: false,
          message: 'This reset token has expired. Please request a new one.'
        };
      }

      console.log('✅ PasswordResetService: Reset token is valid');

      return {
        isValid: true,
        userId: resetToken.user_id,
        message: 'Token is valid'
      };
    } catch (error) {
      console.error('❌ PasswordResetService: Failed to validate reset token', error);
      return {
        isValid: false,
        message: 'Failed to validate reset token'
      };
    }
  }

  /**
   * Reset password using a valid token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔐 PasswordResetService: Resetting password with token');

      // Validate token first
      const validation = await this.validateResetToken(token);

      if (!validation.isValid || !validation.userId) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password
      const updateQuery = `
        UPDATE users 
        SET password = $1, updated_at = NOW() 
        WHERE id = $2
      `;
      await db.query(updateQuery, [hashedPassword, validation.userId]);

      // Mark token as used
      const markUsedQuery = `
        UPDATE password_reset_tokens 
        SET is_used = true 
        WHERE reset_token = $1
      `;
      await db.query(markUsedQuery, [token]);

      console.log('✅ PasswordResetService: Password reset successfully');

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      console.error('❌ PasswordResetService: Failed to reset password', error);
      return {
        success: false,
        message: 'Failed to reset password'
      };
    }
  }

  /**
   * Cleanup expired reset tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      console.log('🧹 PasswordResetService: Cleaning up expired reset tokens');

      const query = `
        DELETE FROM password_reset_tokens 
        WHERE expires_at < NOW() OR is_used = true
        RETURNING id
      `;
      const result = await db.query(query);

      const deletedCount = result.rows.length;
      console.log(`✅ PasswordResetService: Cleaned up ${deletedCount} expired tokens`);

      return deletedCount;
    } catch (error) {
      console.error('❌ PasswordResetService: Failed to cleanup expired tokens', error);
      return 0;
    }
  }

  /**
   * Get reset token info (for debugging/admin purposes)
   */
  async getResetTokenInfo(token: string): Promise<PasswordResetToken | null> {
    try {
      const query = `
        SELECT * FROM password_reset_tokens 
        WHERE reset_token = $1
      `;
      const result = await db.query(query, [token]);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('❌ PasswordResetService: Failed to get reset token info', error);
      return null;
    }
  }
}

export const passwordResetService = new PasswordResetService();
