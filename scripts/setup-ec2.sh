#!/bin/bash

# EC2 Setup Script for TicketsManage Backend
# Run this script on a fresh EC2 instance (Amazon Linux 2023 or Ubuntu 22.04)

set -e

echo "========================================="
echo "TicketsManage EC2 Setup Script"
echo "========================================="

# Update system packages
echo "Updating system packages..."
sudo yum update -y || sudo apt-get update -y

# Install Docker
echo "Installing Docker..."
if command -v yum &> /dev/null; then
    # Amazon Linux 2023
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
else
    # Ubuntu
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "Installing Git..."
sudo yum install -y git || sudo apt-get install -y git

# Install AWS CLI (for S3 testing)
echo "Installing AWS CLI..."
if command -v yum &> /dev/null; then
    sudo yum install -y aws-cli
else
    sudo apt-get install -y awscli
fi

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/ticketsmanage
sudo chown $USER:$USER /opt/ticketsmanage
cd /opt/ticketsmanage

# Clone repository
echo "Cloning repository..."
read -p "Enter your GitHub username: " GITHUB_USER
git clone https://github.com/$GITHUB_USER/TicketsManage.git
cd TicketsManage
git checkout develop

# Navigate to backend
cd backend

# Create environment file
echo "Creating environment file..."
cat > .env.aws << 'EOF'
# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=learnitup

# AWS S3 Configuration
AWS_S3_BUCKET_NAME=ticketsmanage-attachments-dev
AWS_S3_ENABLED=true

# Google OAuth (TO BE UPDATED)
GOOGLE_CLIENT_ID=YOUR_AWS_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_AWS_GOOGLE_CLIENT_SECRET

# Email Service
RESEND_API_KEY=re_Qdt76M9Y_Bsd3wJTiNu3wM6kg9qXMR5W6
RESEND_FROM=noreply@ticksmanage.email

# JWT Secret
JWT_SECRET=aws-super-secret-jwt-key-that-is-at-least-256-bits-long-for-hs256-deployment-2026

# Secret Codes
ADMIN_SECRET_CODE=ADMIN_SECRET_AWS_2026
AGENT_SECRET_CODE=AGENT_SECRET_AWS_2026

# Frontend URL (TO BE UPDATED)
FRONTEND_URL=http://localhost:3000
EOF

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit /opt/ticketsmanage/TicketsManage/backend/.env.aws with your Google OAuth credentials"
echo "2. Update FRONTEND_URL after deploying frontend to Amplify"
echo "3. Run: cd /opt/ticketsmanage/TicketsManage/backend && ./deploy.sh"
echo ""
echo "NOTE: You may need to log out and log back in for Docker group changes to take effect"
echo "      Or run: newgrp docker"
echo ""
