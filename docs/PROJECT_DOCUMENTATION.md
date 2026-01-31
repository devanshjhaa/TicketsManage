# TicketsManage

**Full-Stack Support Ticket System (Spring Boot + Next.js + AWS)**

---

## Why I Built This

I built TicketsManage to learn how real support systems work end-to-end — from authentication and role management to file storage and AWS deployment.

The main goals were:

- implementing multi-role workflows (users, agents, admins),
- building OAuth + JWT authentication correctly,
- designing a clean ticket lifecycle,
- admin panel,agent panel and user dashboard


Some of the hardest parts were:

- debugging Google OAuth redirects across local, Vercel/Render, and AWS environments,
- migrating attachments from local disk storage to S3,
- locking down IAM permissions for EC2,
- running Flyway migrations automatically inside Docker,
- and setting up DNS + TLS certificates with Route 53 and ACM.



---

## High-Level Architecture

```
Frontend (Next.js on Amplify)  →  Spring Boot API on EC2  →  RDS PostgreSQL
                                        |
                                        →  S3 (Attachments)
                                        →  Resend (Emails)
```

This setup was chosen to mirror a small production environment while staying within AWS free-tier limits.

- Frontend is deployed through AWS Amplify with automatic builds from GitHub.
- Backend runs inside a Docker container on an EC2 t3.micro instance.
- PostgreSQL is hosted on AWS RDS.
- Ticket attachments are stored in a private S3 bucket.
- HTTPS certificates are issued using ACM and DNS is handled via Route 53.

---

## Technology Stack

### Backend

- Java 17 + Spring Boot 3
- Spring Security with JWT + Google OAuth2
- PostgreSQL with Flyway migrations
- Spring Data JPA / Hibernate
- AWS SDK for S3
- Docker (multi-stage build)
- Resend API for email notifications

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Radix UI
- TanStack Query for API caching
- Axios client
- Recharts for analytics
- Zod + React Hook Form for validation

### Infrastructure

- AWS EC2 (t3.micro)
- AWS RDS PostgreSQL
- AWS S3
- AWS Amplify
- Route 53 + ACM for DNS and HTTPS
- Docker for backend deployment

---

## Core Features

### Ticket Lifecycle

Tickets move through:

```
OPEN → IN_PROGRESS → RESOLVED
```

and can be reopened when needed.

**Users can:**

- create tickets,
- upload attachments,
- comment on issues,
- and rate resolved tickets.

**Support agents can:**

- update ticket status,
- assign or reassign tickets,
- add internal notes.

**Admins can:**

- manage users,
- view system-wide tickets,
- and access analytics dashboards.

### Attachments

- Stored in AWS S3.
- Access restricted to ticket owner and assigned agent.
- Download authorization handled server-side.
- Supports multiple attachments per ticket.

### Analytics Dashboard

Admins get insights into:

- ticket volume by status and priority,
- agent workload,
- resolution times,
- and historical trends.

---

## Authentication & Security

Two login methods are supported:

### Email / Password

- Passwords hashed using BCrypt.
- JWT issued after login.
- Role elevation requires secret registration codes.

### Google OAuth

- Users authenticate via Google.
- Accounts are created automatically on first login.
- Backend issues JWT and redirects back to frontend.

### Security Decisions

- JWT stored in HttpOnly cookies in production.
- CORS restricted to known frontend domains.
- Role checks enforced at controller/service level.
- Soft deletes used for audit history.
- File access validated before S3 downloads.

---

## Database Design & Migrations

PostgreSQL is the primary datastore and schema changes are tracked through Flyway so local, Render, and AWS environments stay in sync.

Flyway runs automatically when the backend container starts.

### Core Tables

```
users
 ├─ id (UUID, PK)
 ├─ email (unique)
 ├─ password
 ├─ first_name
 ├─ last_name
 ├─ role
 ├─ active
 ├─ created_at
 └─ updated_at

tickets
 ├─ id (UUID, PK)
 ├─ title
 ├─ description
 ├─ owner_id (FK → users)
 ├─ assignee_id (FK → users)
 ├─ status
 ├─ priority
 ├─ rating
 ├─ rating_comment
 ├─ resolved_at
 ├─ deleted
 ├─ created_at
 └─ updated_at

comments
 ├─ id (UUID, PK)
 ├─ ticket_id (FK → tickets)
 ├─ author_id (FK → users)
 ├─ content
 ├─ created_at
 └─ updated_at

attachments
 ├─ id (UUID, PK)
 ├─ ticket_id (FK → tickets)
 ├─ uploader_id (FK → users)
 ├─ file_name
 ├─ file_path (S3 key)
 ├─ content_type
 ├─ size
 └─ created_at

ticket_activity
 ├─ id (UUID, PK)
 ├─ ticket_id (FK → tickets)
 ├─ actor_id (FK → users)
 ├─ action
 ├─ old_value
 ├─ new_value
 ├─ details
 └─ created_at
```

### Schema Decisions

- UUID primary keys to avoid guessable IDs.
- Soft delete flag for tickets to preserve history.
- Separate activity table for audits.
- Attachments store S3 object keys only.
- Nullable assignee for unassigned tickets.
- `resolved_at` stored for metrics.
- Indexes added on status, priority, owner, assignee, and created time.

### Flyway Versions

```
V1   core schema
V2   add password column
V3   enum fixes
V4   convert enums to varchar
V5   ticket comments
V6   ticket activity
V7   attachments
V8   profile picture
V9   closed → resolved rename
V10  activity details
V11  comment fixes
```

---

## Cloud Deployment (AWS)

AWS runs in parallel with the Render/Vercel setup.

- Amplify hosts the frontend at `ticketsmanage.dev`.
- EC2 runs the backend at `api.ticketsmanage.dev`.
- RDS PostgreSQL is private inside the VPC.
- EC2 uses IAM roles for S3 instead of static credentials.
- Attachments live in private S3 buckets.
- HTTPS via ACM certificates.
- DNS managed with Route 53.

### Deployment Flow

**Backend**

1. Docker image built via CI or locally.
2. Image pushed to registry.
3. EC2 pulls and runs container.
4. `.env.aws` injected at runtime.
5. Flyway migrations apply on startup.

**Frontend**

1. Push to `aws-deploy` branch.
2. Amplify builds automatically.
3. Next.js deployed to CloudFront.
4. Custom domain attached.
5. SSL auto-renewed.

---

## What I Learned

Through this project I worked across the full stack, from designing APIs and schemas to deploying and operating the system on AWS. It helped me understand authentication flows, database migrations, cloud permissions, and release pipelines in practice.

The biggest takeaways were debugging OAuth across different environments, getting Flyway to run cleanly inside Docker, and figuring out IAM roles for S3 access from EC2.
