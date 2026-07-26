#!/bin/bash
# Digi8 Solutions Automated One-Click Deployment Script for Ubuntu VPS
# Domain: digi8solutions.com

set -e

echo "🚀 Starting Deployment for digi8solutions.com..."

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs git nginx mysql-server certbot python3-certbot-nginx

# 2. Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "⚙️ Installing PM2..."
    sudo npm install -g pm2
fi

# 3. Create database if it doesn't exist
echo "🗄️ Setting up MySQL Database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS digi8 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'digi8_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON digi8.* TO 'digi8_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 4. Install Frontend Dependencies & Build Static Assets
echo "🎨 Building Frontend..."
npm install
npm run build

# 5. Install Backend Dependencies & Compile TypeScript
echo "⚙️ Building Backend..."
cd server
npm install
npm run build

# 6. Start / Reload PM2 process
echo "🚀 Starting Node API Server..."
if pm2 list | grep -q "digi8-api"; then
    pm2 reload digi8-api
else
    pm2 start dist/index.js --name "digi8-api"
fi

pm2 save
pm2 startup || true

echo "✅ Build & Process launch complete! Ensure Nginx configuration and SSL certificates are active."
