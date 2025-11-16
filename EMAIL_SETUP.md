# Email Configuration Guide

## Setting Up Email Service with Zoho Mail

### 1. Generate Zoho App Password

1. Log in to your Zoho Mail account
2. Go to **Settings** → **Security** → **App Passwords**
3. Generate a new app password for "Luminate Ecosystem"
4. Copy the generated password

### 2. Configure Environment Variables

Add the following to your `.env` file in the Backend directory:

```env
# Email Configuration
EMAIL_ENABLED=true
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
ZOHO_USER=your-email@zoho.com
ZOHO_APP_PASSWORD=your-app-password-here
```

**Important Notes:**
- Use port `587` for TLS (recommended)
- Use port `465` for SSL (if required)
- Make sure `EMAIL_ENABLED=true` (not `false` or empty)
- Replace `your-email@zoho.com` with your actual Zoho email
- Replace `your-app-password-here` with the app password you generated

### 3. Verify Email Configuration

The system will log connection status on startup:

```
📧 EmailService: Initializing email service
📧 SMTP Configuration: { host: 'smtp.zoho.com', port: '587', user: 'your***', passwordSet: true }
✅ EmailService: Transporter created successfully
```

### 4. Test Email Sending

When a ward is created, the logs will show:

```
📧 EmailService: Sending guardian credentials email
📤 Attempting to send email with options: { from: '...', to: '...', subject: '...' }
✅ EmailService: Guardian credentials email sent successfully
```

### 5. Troubleshooting

#### Email not sending (shows "Email disabled"):
- Check that `EMAIL_ENABLED=true` in `.env`
- Restart the backend server after changing `.env`

#### SMTP Authentication Error:
- Verify your app password is correct
- Make sure you're using an app password, not your regular account password
- Check that your Zoho email is correct

#### Connection Timeout:
- Try port `465` with SSL instead of `587`
- Check your firewall settings
- Verify your network allows SMTP connections

#### Still Not Working?
Check the detailed error logs which will show:
- Error message
- Error code
- SMTP response
- Command that failed

## Alternative SMTP Providers

If Zoho doesn't work, you can use:

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
ZOHO_USER=your-email@gmail.com
ZOHO_APP_PASSWORD=your-gmail-app-password
```

### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
ZOHO_USER=your-email@outlook.com
ZOHO_APP_PASSWORD=your-outlook-password
```

## Security Best Practices

1. **Never commit `.env` file to git**
2. Use app-specific passwords, not your main account password
3. Keep your app passwords secure
4. Regularly rotate app passwords
5. Use environment variables for all sensitive data
