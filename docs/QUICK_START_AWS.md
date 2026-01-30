# Quick Start: AWS Deployment

## Prerequisites
- ✓ RDS PostgreSQL instance created
- ✓ AWS account with Free Tier access
- EC2 instance (to be created)
- S3 bucket (to be created)

## 1. Create S3 Bucket
```bash
Bucket name: ticketsmanage-attachments-dev
Region: ap-south-1
Block public access: Enabled
```

## 2. Create IAM Role
```bash
Role name: TicketsManage-EC2-S3-Role
Policy: AmazonS3FullAccess
Trusted entity: EC2
```

## 3. Launch EC2 Instance
```bash
Name: TicketsManage-Backend
AMI: Amazon Linux 2023
Instance type: t3.micro
IAM role: TicketsManage-EC2-S3-Role
Security group: Allow SSH (22), HTTP (80), HTTPS (443), Custom TCP (8080)
```

## 4. Configure RDS Security Group
```bash
Add inbound rule:
  Type: PostgreSQL
  Port: 5432
  Source: EC2 security group
```

## 5. SSH to EC2 and Setup
```bash
ssh -i your-key.pem ec2-user@<EC2-IP>

# Clone repo
git clone https://github.com/devanshjhaa/TicketsManage.git
cd TicketsManage
git checkout develop

# Run setup script
cd scripts
chmod +x setup-ec2.sh
./setup-ec2.sh
```

## 6. Configure Google OAuth
1. Create new OAuth client in Google Cloud Console
2. Add redirect URI: `http://<EC2-IP>:8080/login/oauth2/code/google`
3. Copy Client ID and Secret

## 7. Update Environment Variables
```bash
cd /opt/ticketsmanage/TicketsManage/backend
nano .env.aws

# Update:
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
AWS_S3_BUCKET_NAME=ticketsmanage-attachments-dev
```

## 8. Deploy Backend
```bash
cd /opt/ticketsmanage/TicketsManage/backend
chmod +x deploy.sh
./deploy.sh
```

## 9. Deploy Frontend to Amplify
1. Go to AWS Amplify Console
2. Connect GitHub repository: `TicketsManage`, branch: `develop`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = http://<EC2-IP>:8080
   ```
4. Deploy

## 10. Update Backend with Amplify URL
```bash
# Update .env.aws
FRONTEND_URL=https://<amplify-url>

# Redeploy
./deploy.sh
```

## 11. Test
1. Open Amplify URL
2. Login with Google
3. Create ticket
4. Upload attachment
5. Verify in S3: `aws s3 ls s3://ticketsmanage-attachments-dev/tickets/`

## Troubleshooting
```bash
# Check backend logs
docker logs -f ticketsmanage-backend

# Check health
curl http://localhost:8080/actuator/health

# Test RDS connection
psql -h ticketsmanage-db.cngeqga6wi79.ap-south-1.rds.amazonaws.com -U postgres -d ticketsmanage-db
```

For detailed instructions, see [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)
