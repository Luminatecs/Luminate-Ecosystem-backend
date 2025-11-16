/**
 * Email Templates
 * HTML email templates for guardian credentials and password reset
 */

export interface GuardianCredentialsData {
  guardianName: string;
  guardianEmail: string;
  studentName: string;
  tempCode: string;
  tempPassword: string;
  organizationName: string;
  expiryDate: Date;
}

export interface PasswordResetData {
  userName: string;
  userEmail: string;
  resetToken: string;
  resetUrl: string;
  expiryDate: Date;
}

export class EmailTemplates {
  /**
   * Guardian credentials email template
   */
  static guardianCredentials(data: GuardianCredentialsData): {
    subject: string;
    html: string;
    text: string;
  } {
    const expiryDateStr = data.expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Roboto, Arial, sans-serif; background: #f5f5f5; color: #212121; margin: 0; }
          .container { max-width: 480px; margin: 32px auto; background: #fff; border-radius: 4px; box-shadow: 0 2px 8px rgba(25, 118, 210, 0.06); padding: 0 0 24px 0; }
          .header { background: #1976d2; color: #fff; padding: 20px 24px; border-radius: 4px 4px 0 0; text-align: left; }
          .header h2 { margin: 0; font-weight: 500; font-size: 1.3rem; letter-spacing: 0.5px; }
          .content { padding: 24px; }
          .credentials { background: #f5f5f5; border-radius: 4px; padding: 16px; margin: 16px 0; font-size: 1rem; }
          .credentials strong { color: #1976d2; }
          .footer { color: #757575; font-size: 13px; text-align: center; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Luminate Career Guidance Portal</h2>
          </div>
          <div class="content">
            <p>Hello ${data.guardianName},</p>
            <p>You have been granted access to the <strong>Luminate Career Guidance Portal</strong> for your ward, <strong>${data.studentName}</strong>, through <strong>${data.organizationName}</strong>.</p>
            <div class="credentials">
              <div><strong>Username:</strong> ${data.tempCode}</div>
              <div><strong>Temporary Password:</strong> ${data.tempPassword}</div>
            </div>
            <p style="margin-bottom: 8px;">These credentials expire on <strong>${expiryDateStr}</strong>. Please log in and set your own password.</p>
            <p>If you need help, just reach out to <a href="mailto:support@luminate.com">hello@luminatecs.com</a>.</p>
            <div class="footer">
              Luminate Ecosystem<br>
              &copy; ${new Date().getFullYear()} Luminate ECS
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Luminate Career Guidance Portal

Hello ${data.guardianName},

You have been granted access to the Luminate Career Guidance Portal for your ward, ${data.studentName}, through ${data.organizationName}.

Username: ${data.tempCode}
Temporary Password: ${data.tempPassword}

These credentials expire on ${expiryDateStr}. Please log in and set your own password.

If you need help, just reply to this email.

Luminate Ecosystem
© ${new Date().getFullYear()} Luminate ECS
    `;

    return {
      subject: `Access to Luminate Career Guidance Portal`,
      html,
      text
    };
  }

  /**
   * Password reset email template
   */
  static passwordReset(data: PasswordResetData): {
    subject: string;
    html: string;
    text: string;
  } {
    const expiryTime = data.expiryDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4299e1 0%, #2c5282 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 2px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: linear-gradient(135deg, #4299e1 0%, #2c5282 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .warning { background: #fff5f5; border: 2px solid #fc8181; color: #c53030; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${data.userName},</p>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>⏰ This link expires at ${expiryTime}</strong> for security reasons.
            </div>
            
            <p><strong>If you didn't request this password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
            
            <p>For security, never share this link with anyone.</p>
            
            <div class="footer">
              <p>This is an automated message from the Luminate Ecosystem.</p>
              <p>© ${new Date().getFullYear()} Luminate ECS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Reset Request

Hello ${data.userName},

We received a request to reset your password. Click the link below to create a new password:

${data.resetUrl}

This link expires at ${expiryTime} for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security, never share this link with anyone.

This is an automated message from the Luminate Ecosystem.
© ${new Date().getFullYear()} Luminate ECS. All rights reserved.
    `;

    return {
      subject: 'Password Reset Request - Luminate Ecosystem',
      html,
      text
    };
  }

  /**
   * Bulk enrollment summary email template
   */
  static bulkEnrollmentSummary(
    organizationName: string,
    adminName: string,
    successCount: number,
    errorCount: number
  ): {
    subject: string;
    html: string;
    text: string;
  } {
    const totalProcessed = successCount + errorCount;
    const successRate = totalProcessed > 0 ? ((successCount / totalProcessed) * 100).toFixed(1) : '0';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4299e1 0%, #2c5282 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 2px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .stats-box { background: white; border: 2px solid #4299e1; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .stat-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .stat-label { font-weight: 600; color: #2c5282; }
          .stat-value { font-size: 18px; font-weight: 700; }
          .success { color: #48bb78; }
          .error { color: #f56565; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bulk Enrollment Complete</h1>
            <p>${organizationName}</p>
          </div>
          <div class="content">
            <p>Hello ${adminName},</p>
            
            <p>Your bulk student enrollment has been processed. Here's the summary:</p>
            
            <div class="stats-box">
              <div class="stat-item">
                <span class="stat-label">Total Processed:</span>
                <span class="stat-value">${totalProcessed}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Successful Enrollments:</span>
                <span class="stat-value success">${successCount}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Failed Enrollments:</span>
                <span class="stat-value error">${errorCount}</span>
              </div>
              <div class="stat-item" style="border-bottom: none;">
                <span class="stat-label">Success Rate:</span>
                <span class="stat-value">${successRate}%</span>
              </div>
            </div>
            
            <p>${successCount > 0 ? `<strong>${successCount}</strong> guardian(s) have been sent their login credentials via email.` : ''}</p>
            
            <p>${errorCount > 0 ? `<strong>Note:</strong> ${errorCount} enrollment(s) failed. Please check the data and try again for failed entries.` : ''}</p>
            
            <div class="footer">
              <p>This is an automated message from the Luminate Ecosystem.</p>
              <p>© ${new Date().getFullYear()} Luminate ECS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bulk Enrollment Complete - ${organizationName}

Hello ${adminName},

Your bulk student enrollment has been processed. Here's the summary:

Total Processed: ${totalProcessed}
Successful Enrollments: ${successCount}
Failed Enrollments: ${errorCount}
Success Rate: ${successRate}%

${successCount > 0 ? `${successCount} guardian(s) have been sent their login credentials via email.` : ''}

${errorCount > 0 ? `Note: ${errorCount} enrollment(s) failed. Please check the data and try again for failed entries.` : ''}

This is an automated message from the Luminate Ecosystem.
© ${new Date().getFullYear()} Luminate ECS. All rights reserved.
    `;

    return {
      subject: `Bulk Student Enrollment Complete - ${organizationName}`,
      html,
      text
    };
  }
}
