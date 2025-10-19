#!/bin/bash

# Deployment script for Luminate Ecosystem Backend
# This script builds the TypeScript code, packages it, and deploys to the server

set -e  # Exit on any error

# Configuration
SERVER_ALIAS="luminateserver"
SERVER_PATH="~/backends/ecoautherver/Luminate-Ecosystem-backend"
APP_NAME="luminate-backend"

echo "🔨 Building TypeScript code..."
npm run build

echo "📦 Creating deployment package..."
tar -czf backend-deploy.tar.gz \
  dist/ \
  package.json \
  package-lock.json \
  ecosystem.config.js \
  migrations/ \
  PRODUCTION_DEPLOYMENT.md

echo "🚀 Uploading package to server..."
scp backend-deploy.tar.gz $SERVER_ALIAS:$SERVER_PATH/

echo "📱 Deploying on server..."
ssh -T $SERVER_ALIAS "cd $SERVER_PATH && \
echo '  ⏸️  Stopping PM2 process...' && \
pm2 stop $APP_NAME 2>/dev/null || echo '  ℹ️  Process was not running' && \
echo '  🗂️  Removing old dist directory...' && \
rm -rf dist/ && \
echo '  📂 Extracting new deployment package...' && \
tar -xzf backend-deploy.tar.gz && \
echo '  🔄 Restarting PM2 process...' && \
(pm2 restart $APP_NAME 2>/dev/null || pm2 start ecosystem.config.js --env production) && \
echo '  💾 Saving PM2 configuration...' && \
pm2 save && \
echo '  ✅ Deployment completed!'"

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "📊 Checking server status..."
ssh -T $SERVER_ALIAS "pm2 list"

echo ""
echo "🔍 Server logs (last 10 lines):"
ssh -T $SERVER_ALIAS "pm2 logs $APP_NAME --lines 10"

echo ""
echo "🌐 Your API should be available at:"
echo "   Health check: http://YOUR_DROPLET_IP:3002/health"
echo "   Main API: http://YOUR_DROPLET_IP:3002/"
echo ""
echo "🔧 To check logs: ssh $SERVER_ALIAS 'pm2 logs $APP_NAME'"
echo "🔧 To check status: ssh $SERVER_ALIAS 'pm2 list'"
echo ""