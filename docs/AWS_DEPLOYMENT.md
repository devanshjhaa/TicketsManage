# AWS Deployment Guide for TicketsManage

This guide walks you through deploying the TicketsManage system to AWS infrastructure.

## Prerequisites

- AWS Account with Free Tier access
- RDS PostgreSQL instance created (✓ Already done)
- GitHub repository access
- Basic knowledge of AWS services

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  AWS Amplify    │────────▶│   EC2 Instance   │────────▶│  RDS PostgreSQL │
│  (Frontend)     │         │  (Backend Docker)│         │  (Database)     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   S3 Bucket     │
                            │  (Attachments)  │
                            └─────────────────┘
```

## Step 1: Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. **Bucket name**: `ticketsmanage-attachments-dev`
4. **Region**: `ap-south-1` (Mumbai) - same as RDS
5. **Block Public Access**: Keep all enabled (private bucket)
6. **Versioning**: Enable (optional but recommended)
7. Click "Create bucket"

## Step 2: Create IAM Role for EC2

1. Go to AWS IAM Console → Roles
2. Click "Create role"
3. **Trusted entity**: AWS service → EC2
4. **Permissions**: Attach `AmazonS3FullAccess` policy
   - (For production, create a custom policy with only `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on your bucket)
5. **Role name**: `TicketsManage-EC2-S3-Role`
6. Click "Create role"

## Step 3: Launch EC2 Instance

1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. **Name**: `TicketsManage-Backend`
4. **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
5. **Instance type**: `t3.micro` (or `t2.micro` for Free Tier)
6. **Key pair**: Create new or select existing (save the .pem file!)
7. **Network settings**:
   - Auto-assign public IP: Enable
   - Security group: Create new with rules:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (8080) - Anywhere
8. **Advanced details**:
   - IAM instance profile: Select `TicketsManage-EC2-S3-Role`
9. Click "Launch instance"

## Step 4: Configure RDS Security Group

1. Go to RDS Console → Databases → `ticketsmanage-db`
2. Click on the VPC security group
3. Edit inbound rules → Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: EC2 security group (select the one you just created)
4. Save rules

## Step 5: Connect to EC2 and Setup

1. **Get EC2 Public IP**: Copy from EC2 Console
2. **Connect via SSH**:
   ```bash
   ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
   # Or for Ubuntu:
   ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
   ```

3. **Run setup script**:
   ```bash
   # Download and run setup script
   curl -o setup-ec2.sh https://raw.githubusercontent.com/devanshjhaa/TicketsManage/develop/scripts/setup-ec2.sh
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```

4. **Or manual setup**:
   ```bash
   # Update system
   sudo yum update -y  # Amazon Linux
   # sudo apt-get update -y  # Ubuntu

   # Install Docker
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER

   # Install Git
   sudo yum install -y git

   # Clone repository
   mkdir -p /opt/ticketsmanage
   cd /opt/ticketsmanage
   git clone https://github.com/devanshjhaa/TicketsManage.git
   cd TicketsManage
   git checkout develop
   ```

## Step 6: Configure Google OAuth for AWS

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. **Application type**: Web application
6. **Name**: `TicketsManage AWS`
7. **Authorized redirect URIs**:
   ```
   http://<EC2-PUBLIC-IP>:8080/login/oauth2/code/google
   ```
8. Click "Create"
9. **Copy Client ID and Client Secret**

## Step 7: Update Environment Variables

1. **On EC2**, edit the `.env.aws` file:
   ```bash
   cd /opt/ticketsmanage/TicketsManage/backend
   nano .env.aws
   ```

2. **Update these values**:
   ```bash
   # Update Google OAuth
   GOOGLE_CLIENT_ID=<your-aws-client-id>
   GOOGLE_CLIENT_SECRET=<your-aws-client-secret>

   # Update S3 bucket name (if different)
   AWS_S3_BUCKET_NAME=ticketsmanage-attachments-dev

   # Frontend URL will be updated after Amplify deployment
   FRONTEND_URL=http://<EC2-PUBLIC-IP>:8080
   ```

3. Save and exit (Ctrl+X, Y, Enter)

## Step 8: Deploy Backend

```bash
cd /opt/ticketsmanage/TicketsManage/backend
chmod +x deploy.sh
./deploy.sh
```

**Expected output**:
```
✓ Deployment Successful!
✓ Application is healthy!
```

**Verify deployment**:
```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# View logs
docker logs -f ticketsmanage-backend
```

## Step 9: Test RDS Connection

The backend should automatically connect to RDS and run Flyway migrations.

**Check logs for**:
```
Flyway Community Edition ... by Redgate
Successfully validated 9 migrations
Migrating schema "public" to version ...
Successfully applied 9 migrations
```

**Manually test RDS** (optional):
```bash
# Install PostgreSQL client
sudo yum install -y postgresql15

# Connect to RDS
psql -h ticketsmanage-db.cngeqga6wi79.ap-south-1.rds.amazonaws.com -U postgres -d ticketsmanage-db

# List tables
\dt
```

## Step 10: Deploy Frontend to AWS Amplify

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. **Source**: GitHub
4. **Authorize** AWS Amplify to access your GitHub
5. **Repository**: `TicketsManage`
6. **Branch**: `develop`
7. **App name**: `ticketsmanage-frontend`
8. **Build settings**: Amplify should auto-detect Next.js
   - If not, use the `amplify.yml` file in the repository
9. **Advanced settings** → Environment variables:
   ```
   NEXT_PUBLIC_API_URL = http://<EC2-PUBLIC-IP>:8080
   ```
10. Click "Save and deploy"

**Wait for deployment** (5-10 minutes)

## Step 11: Update Backend with Frontend URL

1. **Get Amplify URL**: Copy from Amplify Console (e.g., `https://develop.d1234567890.amplifyapp.com`)

2. **Update backend environment**:
   ```bash
   # SSH to EC2
   cd /opt/ticketsmanage/TicketsManage/backend
   nano .env.aws
   ```

3. **Update FRONTEND_URL**:
   ```bash
   FRONTEND_URL=https://develop.d1234567890.amplifyapp.com
   ```

4. **Redeploy backend**:
   ```bash
   ./deploy.sh
   ```

5. **Update Google OAuth redirect URIs**:
   - Go to Google Cloud Console → Credentials
   - Edit your AWS OAuth client
   - Add authorized redirect URI:
     ```
     https://develop.d1234567890.amplifyapp.com/api/auth/callback/google
     ```

## Step 12: End-to-End Testing

1. **Open Amplify URL** in browser
2. **Click "Login with Google"**
3. **Authenticate** with Google account
4. **Create a test ticket**
5. **Upload an attachment**
6. **Verify in S3**:
   ```bash
   # On EC2
   aws s3 ls s3://ticketsmanage-attachments-dev/tickets/
   ```
7. **Download the attachment** from ticket details
8. **Test all features**: Create ticket, comment, assign, close, etc.

## Step 13: (Optional) Set Up HTTPS

### Option A: Using Application Load Balancer + ACM

1. Create Application Load Balancer
2. Request ACM certificate for your domain
3. Configure ALB to forward HTTPS → EC2:8080
4. Update DNS to point to ALB

### Option B: Using Nginx + Certbot on EC2

1. Install Nginx on EC2
2. Configure Nginx as reverse proxy to localhost:8080
3. Use Certbot to get Let's Encrypt certificate
4. Update Google OAuth redirect URIs to HTTPS

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs ticketsmanage-backend

# Common issues:
# - RDS connection failed: Check security group
# - S3 access denied: Check IAM role attached to EC2
# - Port 8080 in use: Stop other services
```

### Frontend can't connect to backend
```bash
# Check CORS settings in backend
# Verify NEXT_PUBLIC_API_URL is correct
# Check EC2 security group allows port 8080
```

### Flyway migration errors
```bash
# Connect to RDS and check schema
psql -h ticketsmanage-db.cngeqga6wi79.ap-south-1.rds.amazonaws.com -U postgres -d ticketsmanage-db

# Drop and recreate if needed (CAUTION: loses data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## Cost Monitoring

**Free Tier Limits**:
- EC2: 750 hours/month (t2.micro or t3.micro)
- RDS: 750 hours/month (db.t3.micro)
- S3: 5GB storage, 20,000 GET, 2,000 PUT
- Amplify: 1,000 build minutes, 15GB served/month

**Monitor costs**:
1. AWS Billing Dashboard
2. Set up billing alerts for $1, $5, $10

## Useful Commands

```bash
# Backend
docker logs -f ticketsmanage-backend
docker restart ticketsmanage-backend
docker exec -it ticketsmanage-backend sh

# Database
psql -h ticketsmanage-db.cngeqga6wi79.ap-south-1.rds.amazonaws.com -U postgres -d ticketsmanage-db

# S3
aws s3 ls s3://ticketsmanage-attachments-dev/
aws s3 cp s3://ticketsmanage-attachments-dev/tickets/<ticket-id>/<file> .

# System
sudo systemctl status docker
df -h  # Check disk space
free -m  # Check memory
```

## Next Steps

- [ ] Set up automated backups for RDS
- [ ] Configure CloudWatch monitoring
- [ ] Set up CI/CD with GitHub Actions
- [ ] Implement HTTPS
- [ ] Add custom domain
- [ ] Set up staging environment

## Support

For issues, check:
1. Backend logs: `docker logs ticketsmanage-backend`
2. RDS connectivity: Security groups
3. S3 access: IAM role permissions
4. Frontend build: Amplify console logs
