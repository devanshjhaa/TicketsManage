#!/bin/bash

# Backend Deployment Script for EC2
# Run this from the backend directory on EC2

set -e

echo "========================================="
echo "TicketsManage Backend Deployment"
echo "========================================="

# Load environment variables
if [ -f .env.aws ]; then
    export $(cat .env.aws | grep -v '^#' | xargs)
    echo "✓ Loaded environment variables from .env.aws"
else
    echo "ERROR: .env.aws file not found!"
    echo "Please create .env.aws with required environment variables"
    exit 1
fi

# Stop and remove existing container
echo "Stopping existing container..."
docker stop ticketsmanage-backend 2>/dev/null || true
docker rm ticketsmanage-backend 2>/dev/null || true

# Build Docker image
echo "Building Docker image..."
docker build -t ticketsmanage-backend:latest .

# Run container
echo "Starting container..."
docker run -d \
  --name ticketsmanage-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DB_USERNAME="$DB_USERNAME" \
  -e DB_PASSWORD="$DB_PASSWORD" \
  -e AWS_S3_BUCKET_NAME="$AWS_S3_BUCKET_NAME" \
  -e AWS_S3_ENABLED="$AWS_S3_ENABLED" \
  -e GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  -e GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
  -e RESEND_API_KEY="$RESEND_API_KEY" \
  -e RESEND_FROM="$RESEND_FROM" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e ADMIN_SECRET_CODE="$ADMIN_SECRET_CODE" \
  -e AGENT_SECRET_CODE="$AGENT_SECRET_CODE" \
  -e FRONTEND_URL="$FRONTEND_URL" \
  ticketsmanage-backend:latest

# Wait for container to start
echo "Waiting for application to start..."
sleep 10

# Check container status
if docker ps | grep -q ticketsmanage-backend; then
    echo ""
    echo "========================================="
    echo "✓ Deployment Successful!"
    echo "========================================="
    echo ""
    echo "Container is running. Checking health..."
    
    # Try to hit health endpoint
    if curl -f http://localhost:8080/actuator/health 2>/dev/null; then
        echo ""
        echo "✓ Application is healthy!"
    else
        echo ""
        echo "⚠ Application may still be starting up..."
        echo "Check logs with: docker logs -f ticketsmanage-backend"
    fi
    
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker logs -f ticketsmanage-backend"
    echo "  Stop:         docker stop ticketsmanage-backend"
    echo "  Restart:      docker restart ticketsmanage-backend"
    echo "  Shell access: docker exec -it ticketsmanage-backend sh"
    echo ""
else
    echo ""
    echo "========================================="
    echo "✗ Deployment Failed!"
    echo "========================================="
    echo ""
    echo "Container failed to start. Check logs:"
    echo "  docker logs ticketsmanage-backend"
    exit 1
fi
