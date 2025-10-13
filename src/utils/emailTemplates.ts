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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          .credentials-box { background: white; border: 2px solid #4299e1; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .credential-item { margin: 15px 0; }
          .credential-label { font-weight: 600; color: #2c5282; }
          .credential-value { font-family: monospace; font-size: 16px; background: #f1f5f9; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
          .warning { background: #fff5f5; border: 2px solid #fc8181; color: #c53030; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${data.organizationName}</h1>
            <p>Student Portal Access Credentials</p>
          </div>
          <div class="content">
            <p>Dear ${data.guardianName},</p>
            
            <p>Your ward, <strong>${data.studentName}</strong>, has been enrolled at <strong>${data.organizationName}</strong>. Below are the temporary login credentials to access the student portal.</p>
            
            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #2c5282;">Login Credentials</h3>
              
              <div class="credential-item">
                <div class="credential-label">Temporary Username:</div>
                <div class="credential-value">${data.tempCode}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Temporary Password:</div>
                <div class="credential-value">${data.tempPassword}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> These credentials will expire on <strong>${expiryDateStr}</strong>. Upon your first login, you will be required to create a permanent username and password.
            </div>
            
            <h3 style="color: #2c5282;">Next Steps:</h3>
            <ol>
              <li>Visit the student portal login page</li>
              <li>Enter the temporary username and password provided above</li>
              <li>Create your permanent credentials when prompted</li>
              <li>Access the full student portal features</li>
            </ol>
            
            <p>If you have any questions or need assistance, please contact <strong>${data.organizationName}</strong> administration.</p>
            
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
Welcome to ${data.organizationName}

Dear ${data.guardianName},

Your ward, ${data.studentName}, has been enrolled at ${data.organizationName}. Below are the temporary login credentials to access the student portal.

LOGIN CREDENTIALS:
Temporary Username: ${data.tempCode}
Temporary Password: ${data.tempPassword}

IMPORTANT: These credentials will expire on ${expiryDateStr}. Upon your first login, you will be required to create a permanent username and password.

NEXT STEPS:
1. Visit the student portal login page
2. Enter the temporary username and password provided above
3. Create your permanent credentials when prompted
4. Access the full student portal features

If you have any questions or need assistance, please contact ${data.organizationName} administration.

This is an automated message from the Luminate Ecosystem.
© ${new Date().getFullYear()} Luminate ECS. All rights reserved.
    `;

    return {
      subject: `${data.organizationName} - Student Portal Access Credentials`,
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
