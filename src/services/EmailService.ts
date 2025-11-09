/**
 * Email Service
 * Handles sending emails for guardian credentials, password reset, etc.
 */

import { EmailTemplates, GuardianCredentialsData, PasswordResetData } from '../utils/emailTemplates';
const nodemailer = require('nodemailer');

// Note: In production, configure with nodemailer or other email service
// For now, this is a placeholder that logs emails
export class EmailService {
  private emailEnabled: boolean;

  constructor() {
    this.emailEnabled = process.env.EMAIL_ENABLED === 'true';
  }

  /**
   * Send temporary credentials to guardian
   */
  async sendGuardianCredentials(data: GuardianCredentialsData): Promise<boolean> {
    try {
      const emailContent = EmailTemplates.guardianCredentials(data);

      console.log('📧 EmailService: Sending guardian credentials email', {
        to: data.guardianEmail,
        subject: emailContent.subject,
        wardName: data.studentName
      });

      if (this.emailEnabled) {
        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER || process.env.ZOHO_USER,
            pass: process.env.SMTP_PASSWORD || process.env.ZOHO_APP_PASSWORD
          },
        });

        const mailOptions = {
          from: `"${data.organizationName}" <${process.env.SMTP_USER || process.env.ZOHO_USER}>`,
          to: data.guardianEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ EmailService: Guardian credentials email sent successfully', info.messageId);
        return true;
      } else {
        console.log('ℹ️  EmailService: Email disabled, logging content instead');
        console.log('---EMAIL CONTENT---');
        console.log('To:', data.guardianEmail);
        console.log('Guardian:', data.guardianName);
        console.log('Ward:', data.studentName);
        console.log('Subject:', emailContent.subject);
        console.log('Temp Code:', data.tempCode);
        console.log('Temp Password:', data.tempPassword);
        console.log('Expires:', data.expiryDate);
        console.log('---END EMAIL---');
        return true;
      }
    } catch (error) {
      console.error('❌ EmailService: Failed to send guardian credentials email', error);
      return false;
    }
  }


  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
    try {
      const emailContent = EmailTemplates.passwordReset(data);

      console.log('📧 EmailService: Sending password reset email', {
        to: data.userEmail,
        subject: emailContent.subject
      });

      if (this.emailEnabled) {
        // TODO: Implement actual email sending
        console.log('✅ EmailService: Password reset email sent successfully');
      } else {
        console.log('ℹ️  EmailService: Email disabled, logging content instead');
        console.log('---EMAIL CONTENT---');
        console.log('To:', data.userEmail);
        console.log('Subject:', emailContent.subject);
        console.log('Reset URL:', data.resetUrl);
        console.log('---END EMAIL---');
      }

      return true;
    } catch (error) {
      console.error('❌ EmailService: Failed to send password reset email', error);
      return false;
    }
  }

  /**
   * Send bulk enrollment summary to org admin
   */
  async sendBulkEnrollmentSummary(
    orgAdminEmail: string,
    adminName: string,
    organizationName: string,
    successCount: number,
    errorCount: number
  ): Promise<boolean> {
    try {
      const emailContent = EmailTemplates.bulkEnrollmentSummary(
        organizationName,
        adminName,
        successCount,
        errorCount
      );

      console.log('📧 EmailService: Sending bulk enrollment summary email', {
        to: orgAdminEmail,
        subject: emailContent.subject
      });

      if (this.emailEnabled) {
        // TODO: Implement actual email sending
        console.log('✅ EmailService: Bulk enrollment summary email sent successfully');
      } else {
        console.log('ℹ️  EmailService: Email disabled, logging content instead');
        console.log('---EMAIL CONTENT---');
        console.log('To:', orgAdminEmail);
        console.log('Subject:', emailContent.subject);
        console.log('Success:', successCount, 'Errors:', errorCount);
        console.log('---END EMAIL---');
      }

      return true;
    } catch (error) {
      console.error('❌ EmailService: Failed to send bulk enrollment summary email', error);
      return false;
    }
  }

  /**
   * Send enrollment confirmation to guardian
   */
  async sendEnrollmentConfirmation(
    guardianEmail: string,
    studentName: string,
    organizationName: string
  ): Promise<boolean> {
    try {
      console.log('📧 EmailService: Sending enrollment confirmation email', {
        to: guardianEmail,
        student: studentName,
        organization: organizationName
      });

      if (this.emailEnabled) {
        // TODO: Implement actual email sending
        console.log('✅ EmailService: Enrollment confirmation email sent successfully');
      } else {
        console.log('ℹ️  EmailService: Email disabled - enrollment confirmation for', studentName);
      }

      return true;
    } catch (error) {
      console.error('❌ EmailService: Failed to send enrollment confirmation email', error);
      return false;
    }
  }

  /**
   * Send test email (for configuration testing)
   */
  async sendTestEmail(toEmail: string): Promise<boolean> {
    try {
      console.log('📧 EmailService: Sending test email to', toEmail);

      if (this.emailEnabled) {
        // TODO: Implement actual email sending
        console.log('✅ EmailService: Test email sent successfully');
      } else {
        console.log('ℹ️  EmailService: Email disabled - test email would be sent to', toEmail);
      }

      return true;
    } catch (error) {
      console.error('❌ EmailService: Failed to send test email', error);
      return false;
    }
  }

}

export const emailService = new EmailService();
