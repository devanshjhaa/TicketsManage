# TicketsManage

A full-stack support ticket management system built with Spring Boot and Next.js, deployed on AWS.

## What it does

- Users create support tickets and track their progress
- Support agents get assigned tickets, update status, and resolve issues
- Admins manage users and view analytics across the system

## Tech Stack

**Backend:** Java 17, Spring Boot 3, Spring Security, PostgreSQL, Flyway  
**Frontend:** Next.js 14, TypeScript, Tailwind CSS, TanStack Query  
**Infrastructure:** AWS (EC2, RDS, S3, Amplify), Docker

## Features

- JWT + Google OAuth authentication
- Role-based access (User, Agent, Admin)
- Ticket lifecycle management (Open → In Progress → Resolved)
- File attachments via S3
- Comments and activity history
- Post-resolution ratings
- Admin analytics dashboard

## Running Locally

### Backend

```bash
cd backend
cp .env.example .env  # configure your database and secrets
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Environment Variables

**Backend**
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` - PostgreSQL connection
- `JWT_SECRET` - minimum 64 characters for HS512
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `RESEND_API_KEY`, `RESEND_FROM` - email service
- `AWS_S3_BUCKET_NAME`, `AWS_REGION` - file storage

**Frontend**
- `NEXT_PUBLIC_API_URL` - backend API endpoint

## Project Structure

```
backend/
├── src/main/java/com/ticketsmanage/backend/
│   ├── security/       # JWT, OAuth, filters
│   ├── ticket/         # ticket CRUD and lifecycle
│   ├── user/           # user management
│   ├── comment/        # ticket comments
│   ├── attachment/     # S3 file handling
│   └── notification/   # email events
└── src/main/resources/
    └── db/migration/   # Flyway scripts

frontend/
├── src/app/            # Next.js pages
├── src/components/     # UI components
├── src/hooks/          # custom hooks
└── src/lib/            # axios, utils
```

## Deployment

Backend runs in Docker on EC2. Frontend deploys to Amplify with automatic builds from GitHub.

Database is on RDS PostgreSQL. Attachments stored in S3.

See [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) for detailed architecture notes.

## License

MIT
