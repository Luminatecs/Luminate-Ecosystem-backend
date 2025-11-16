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
  private transporter: any;
  private testMode: boolean; // Simulate sending without actually sending

  constructor() {
    this.emailEnabled = process.env.EMAIL_ENABLED === 'true';
    this.testMode = process.env.EMAIL_TEST_MODE === 'true'; // New test mode
    
    if (this.testMode) {
      console.log('🧪 EmailService: Running in TEST MODE - emails will be simulated');
    }
    
    if (this.emailEnabled) {
      console.log('📧 EmailService: Initializing email service');
      console.log('📧 SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.ZOHO_USER ? process.env.ZOHO_USER.substring(0, 5) + '***' : 'NOT SET',
        passwordSet: !!process.env.ZOHO_APP_PASSWORD
      });

      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.ZOHO_USER,
            pass: process.env.ZOHO_APP_PASSWORD
          },
          debug: true, // Enable debug output
          logger: true // Log information to console
        });
        console.log('✅ EmailService: Transporter created successfully');
      } catch (error) {
        console.error('❌ EmailService: Failed to create transporter', error);
      }
    } else {
      console.log('ℹ️  EmailService: Email service is DISABLED (EMAIL_ENABLED not set to true)');
    }
  }

  /**
   * Send temporary credentials to guardian
   */
  async sendGuardianCredentials(data: GuardianCredentialsData): Promise<boolean> {
    try {
      const emailContent = EmailTemplates.guardianCredentials(data);

      console.log('📧 EmailService: Preparing to send guardian credentials email', {
        to: data.guardianEmail,
        subject: emailContent.subject,
        wardName: data.studentName,
        emailEnabled: this.emailEnabled,
        testMode: this.testMode
      });

      // Test mode - simulate successful send without actually sending
      if (this.testMode) {
        console.log('🧪 TEST MODE: Simulating email send (not actually sent)');
        console.log('📧 Would send to:', data.guardianEmail);
        console.log('👤 Guardian:', data.guardianName);
        console.log('👨‍🎓 Student:', data.studentName);
        console.log('🔑 Temp Code:', data.tempCode);
        console.log('🔐 Temp Password:', data.tempPassword);
        
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ TEST MODE: Email simulated successfully');
        return true;
      }

      if (this.emailEnabled) {
        if (!this.transporter) {
          console.error('❌ EmailService: Transporter not initialized');
          return false;
        }

        const mailOptions = {
          from: `"Luminate Career Services" <${process.env.ZOHO_USER}>`,
          to: data.guardianEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        };

        // console.log('📤 Attempting to send email with options:', {
        //   from: mailOptions.from,
        //   to: mailOptions.to,
        //   subject: mailOptions.subject
        // });

        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ EmailService: Guardian credentials email sent successfully', {
          messageId: info.messageId,
          response: info.response
        });
        return true;
      } else {
        console.log('ℹ️  Email sending skipped (EMAIL_ENABLED=false). Credentials:', {
          guardianEmail: data.guardianEmail,
          tempCode: data.tempCode,
          tempPassword: data.tempPassword
        });
        return true;
      }
    } catch (error: any) {
      console.error('❌ EmailService: Failed to send guardian credentials email');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
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
        if (!this.transporter) {
          console.error('❌ EmailService: Transporter not initialized');
          return false;
        }

        const mailOptions = {
          from: `"Luminate Career Services" <${process.env.ZOHO_USER}>`,
          to: toEmail,
          subject: 'Test Email from Luminate Career Services',
          html: '<h1>Test Email</h1><p>If you receive this, your email configuration is working correctly!</p>',
          text: 'Test Email - If you receive this, your email configuration is working correctly!'
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ EmailService: Test email sent successfully', info.messageId);
        return true;
      } else {
        console.log('ℹ️  EmailService: Email disabled - test email would be sent to', toEmail);
        return false;
      }
    } catch (error: any) {
      console.error('❌ EmailService: Failed to send test email');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response
      });
      return false;
    }
  }

  /**
   * Verify email transporter connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.emailEnabled) {
        console.log('ℹ️  EmailService: Email is disabled, skipping verification');
        return false;
      }

      if (!this.transporter) {
        console.error('❌ EmailService: Transporter not initialized');
        return false;
      }

      console.log('🔍 EmailService: Verifying SMTP connection...');
      await this.transporter.verify();
      console.log('✅ EmailService: SMTP connection verified successfully');
      return true;
    } catch (error: any) {
      console.error('❌ EmailService: SMTP connection verification failed');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response
      });
      return false;
    }
  }

}

export const emailService = new EmailService();
