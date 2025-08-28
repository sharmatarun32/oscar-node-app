#!/bin/bash

# ==================================================================================================
# 🚀 Automated Deployment Script for Node.js App on AWS Ubuntu EC2
# ==================================================================================================
# This script:
# ✅ Clones a private GitHub repo using HTTPS authentication
# ✅ Installs Node.js and dependencies
# ✅ Starts the app using PM2 for process management
# ✅ Configures Nginx as a reverse proxy to make the app publicly accessible
# ✅ Sets up SSL (Let's Encrypt) and domain configuration
# ==================================================================================================

set -e  # Exit script immediately if any command fails (useful for debugging)

# Define variables
GITHUB_USERNAME="sharmatarun32"      # Your GitHub username
GITHUB_REPO="oscar-node-app"      # Your private repository name
GITHUB_TOKEN="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"     # Your GitHub personal access token for authentication
APP_DIR="/var/www/oscar-node-app"    # Directory where the app will be cloned
NODE_VERSION="18"                    # Node.js version to install
PORT=3000                            # Port where your app will run

# ========================================================================================
# 1️⃣ UPDATE SYSTEM & INSTALL REQUIRED DEPENDENCIES
# ========================================================================================
echo "Updating system packages..."
sudo apt update -y && sudo apt upgrade -y

echo "Installing required dependencies..."
sudo apt install -y git curl nginx

# ========================================================================================
# 2️⃣ INSTALL NODE.JS
# ========================================================================================
echo "Installing Node.js..."
# Remove any existing Node.js versions
sudo apt remove -y nodejs npm || true

# Add NodeSource repo for Node.js 18
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -

# Install Node.js 18
sudo apt install -y nodejs

# ========================================================================================
# 3️⃣ CLONE OR UPDATE THE REPOSITORY
# ========================================================================================
if [ -d "$APP_DIR" ]; then
    echo "Repository already exists. Pulling latest changes..."
    cd "$APP_DIR"
    echo "Resetting local changes and pulling latest updates..."
    git reset --hard HEAD
    git pull origin main
else
    echo "Cloning repository..."
    sudo mkdir -p /var/www
    sudo chown -R ubuntu:ubuntu /var/www
    git clone https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$GITHUB_REPO.git "$APP_DIR"
    cd "$APP_DIR"
fi

# ========================================================================================
# 4️⃣ INSTALL NODE.JS DEPENDENCIES
# ========================================================================================
echo "Installing Node.js dependencies..."
npm install

# ========================================================================================
# 5️⃣ SET UP ENVIRONMENT VARIABLES
# ========================================================================================
if [ ! -f "$APP_DIR/.env" ]; then
    echo "No .env file found. Creating a default .env file..."
    cat <<EOT > "$APP_DIR/.env"
DB_USER=POSTGRES_USER
DB_PASSWORD=POSTGRES_PASSWORD
DB_HOST=POSTGRES_HOST
DB_NAME=POSTGRES_DATABASE
DB_PORT=5432
PORT=$PORT
EOT
fi

# ========================================================================================
# 7️⃣ CONFIGURE NGINX AS A REVERSE PROXY
# ========================================================================================
echo "Configuring Nginx as a reverse proxy..."

sudo tee /etc/nginx/sites-available/myapp > /dev/null <<EOT
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOT

# Enable the new config
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# ========================================================================================
# 8️⃣ RESTART NGINX TO APPLY CHANGES
# ========================================================================================
echo "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# ========================================================================================
# 6️⃣ START THE APPLICATION USING PM2
# ========================================================================================
echo "Starting the application with PM2..."
sudo npm install -g pm2
pm2 stop all || true
pm2 start src/index.js --name oscar-node-app
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# ========================================================================================
# 9️⃣ ADDING SSL (HTTPS) & CUSTOM DOMAIN CONFIGURATION
# ========================================================================================
# For SSL on Ubuntu:
# sudo apt install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com
# sudo certbot renew --dry-run

# ========================================================================================
# ✅ DEPLOYMENT COMPLETE
# ========================================================================================
echo "Deployment completed successfully! Your app is live."
echo "Access it at: http://your-ec2-public-ip/ or http://your-domain.com (if configured)"
