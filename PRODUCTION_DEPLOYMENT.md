# Production Deployment Guide

## Overview
This backend is configured to run in production using compiled JavaScript (not TypeScript directly) with PM2 for process management. This setup provides better performance and reliability.

## Local Development vs Production

### Development (What you see locally):
- Runs TypeScript directly with `nodemon` and `ts-node`
- Command: `npm run dev`
- Hot reload on file changes

### Production (What runs on server):
- Runs compiled JavaScript with PM2
- Command: `npm start` (after building)
- Process management, auto-restart, logging

## Files Added for Production

### 1. `ecosystem.config.js` - PM2 Configuration
```javascript
module.exports = {
  apps: [{
    name: 'luminate-backend',
    script: './dist/server.js',        // Runs compiled JS
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3002
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: './logs/err.log',      // Error logs
    out_file: './logs/out.log',        // Output logs
    log_file: './logs/combined.log',   // Combined logs
    time: true
  }]
};
```

### 2. Updated `package.json` Scripts
```json
{
  "scripts": {
    "build": "tsc",                    // Compiles TypeScript to JavaScript
    "start": "node dist/server.js",    // Runs compiled JS (production)
    "dev": "nodemon src/server.ts"     // Runs TypeScript directly (development)
  }
}
```

### 3. Directory Structure After Build
```
Backend/
├── src/           # TypeScript source code
├── dist/          # Compiled JavaScript (created by npm run build)
├── logs/          # PM2 log files
├── package.json
├── tsconfig.json
└── ecosystem.config.js
```

## How to Deploy to Production Server

### First Time Setup (on your droplet/server):

1. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

2. **Clone repository and navigate to backend**
   ```bash
   git clone <your-repo-url>
   cd /path/to/Backend
   ```

3. **Install dependencies (production only)**
   ```bash
   npm ci --only=production
   ```

4. **Build TypeScript to JavaScript**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

6. **Save PM2 configuration (so it starts on reboot)**
   ```bash
   pm2 save
   pm2 startup
   ```

### Updating Code (regular deployments):

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Install any new dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Rebuild the application**
   ```bash
   npm run build
   ```

4. **Restart the PM2 process**
   ```bash
   pm2 restart luminate-backend
   ```

## PM2 Management Commands

```bash
# View all running processes
pm2 list

# View logs in real-time
pm2 logs luminate-backend

# View only error logs
pm2 logs luminate-backend --err

# Monitor CPU/Memory usage
pm2 monit

# Restart application
pm2 restart luminate-backend

# Stop application
pm2 stop luminate-backend

# Delete application from PM2
pm2 delete luminate-backend

# Reload PM2 configuration
pm2 reload ecosystem.config.js
```

## Why This Setup?

### Benefits of Compiled JavaScript:
- ✅ **Faster execution** - No TypeScript compilation at runtime
- ✅ **Smaller memory footprint** - No ts-node overhead
- ✅ **Production ready** - Industry standard approach
- ✅ **Better error handling** - Cleaner stack traces

### Benefits of PM2:
- ✅ **Auto-restart** - App restarts if it crashes
- ✅ **Process monitoring** - CPU, memory, uptime tracking
- ✅ **Log management** - Automatic log rotation and storage
- ✅ **Zero-downtime deploys** - Graceful restarts
- ✅ **Startup script** - Automatically starts on server reboot

## Troubleshooting

### If build fails:
```bash
# Clean dist folder and rebuild
npm run clean
npm run build
```

### If PM2 won't start:
```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs luminate-backend --lines 50

# Kill all PM2 processes and start fresh
pm2 kill
pm2 start ecosystem.config.js --env production
```

### If logs are missing:
```bash
# Create logs directory
mkdir -p logs

# Restart PM2 to recreate log files
pm2 restart luminate-backend
```

## Environment Variables

Make sure your `.env` file exists in the Backend directory with all required variables:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PORT=3002
NODE_ENV=production
```

## Quick Reference

| Task | Command |
|------|---------|
| Deploy new code | `git pull && npm run build && pm2 restart luminate-backend` |
| View logs | `pm2 logs luminate-backend` |
| Check status | `pm2 list` |
| Monitor performance | `pm2 monit` |
| Stop server | `pm2 stop luminate-backend` |
| Start server | `pm2 start ecosystem.config.js --env production` |

---

**Note**: Always test locally with `npm run build && npm start` before deploying to ensure the compiled JavaScript works correctly.