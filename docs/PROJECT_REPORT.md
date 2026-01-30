# TicketsManage - Comprehensive Project Report

## 📋 Project Overview

**TicketsManage** is a full-stack, enterprise-grade ticketing and support management system designed to streamline customer support operations. The application enables organizations to efficiently manage support tickets, assign agents, track resolution progress, and gather customer feedback through a modern, intuitive interface.

---

## 🎯 Project Objectives

1. Provide a centralized platform for managing customer support tickets
2. Enable role-based access control for different user types (Users, Agents, Admins)
3. Implement real-time ticket tracking and status management
4. Support file attachments and commenting on tickets
5. Provide analytics and performance metrics for support agents
6. Ensure secure authentication with JWT and OAuth2 (Google)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js 14 Frontend                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │   Auth   │ │Dashboard │ │ Tickets  │ │  Admin   │ │ Profile  │  │   │
│  │  │  Pages   │ │   Page   │ │  Pages   │ │  Panel   │ │   Page   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │                     React Query + Axios                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   Spring Boot 3.5.10 Backend                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │   Auth   │ │  Ticket  │ │   User   │ │ Comment  │ │Attachment│  │   │
│  │  │Controller│ │Controller│ │Controller│ │Controller│ │Controller│  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Service Layer                              │   │   │
│  │  │  TicketService │ UserService │ AuthService │ EmailService    │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                   Security Layer                              │   │   │
│  │  │  JWT Filter │ OAuth2 Handler │ CORS Config │ Security Config │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ JPA/Hibernate
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL Database (Neon Cloud)                   │   │
│  │                                                                      │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────┐   │   │
│  │  │ users  │ │tickets │ │comments│ │activity│ │  attachments   │   │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────────────┘   │   │
│  │                                                                      │   │
│  │                      Flyway Migrations                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 17 | Core programming language |
| **Spring Boot** | 3.5.10 | Application framework |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | Database ORM |
| **Hibernate** | 6.6.41 | JPA Implementation |
| **PostgreSQL** | 17.7 | Relational database |
| **Flyway** | 10.x | Database migrations |
| **JWT (jjwt)** | 0.12.5 | Token-based authentication |
| **Lombok** | 1.18.x | Boilerplate code reduction |
| **Maven** | 3.9.x | Build tool & dependency management |
| **Hypersistence Utils** | 3.7.3 | Hibernate enhancements |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.35 | React framework with SSR |
| **React** | 18.x | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **TanStack Query** | 5.90.20 | Server state management |
| **TanStack Table** | 8.21.3 | Data table components |
| **Axios** | 1.13.4 | HTTP client |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **Radix UI** | Latest | Accessible UI primitives |
| **Framer Motion** | 12.29.2 | Animation library |
| **React Hook Form** | 7.71.1 | Form handling |
| **Zod** | 4.3.6 | Schema validation |
| **Recharts** | 3.7.0 | Charting library |
| **Lucide React** | 0.563.0 | Icon library |
| **date-fns** | 4.1.0 | Date manipulation |

### Infrastructure & DevOps

| Technology | Purpose |
|------------|---------|
| **Neon** | Serverless PostgreSQL hosting |
| **Git/GitHub** | Version control |
| **VS Code** | Development environment |

---

## 📊 Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │           USERS              │
    ├──────────────────────────────┤
    │ PK  id              UUID     │
    │     email           VARCHAR  │◄──────────────────────────────┐
    │     google_id       VARCHAR  │                               │
    │     password_hash   VARCHAR  │                               │
    │     first_name      VARCHAR  │                               │
    │     last_name       VARCHAR  │                               │
    │     role            ENUM     │                               │
    │     profile_picture VARCHAR  │                               │
    │     is_active       BOOLEAN  │                               │
    │     created_at      TIMESTAMP│                               │
    │     updated_at      TIMESTAMP│                               │
    └──────────────────────────────┘                               │
                │                                                   │
                │ 1:N (owner)                                      │
                │ 1:N (assignee)                                   │
                ▼                                                   │
    ┌──────────────────────────────┐                               │
    │          TICKETS             │                               │
    ├──────────────────────────────┤                               │
    │ PK  id              UUID     │                               │
    │     title           VARCHAR  │                               │
    │     description     TEXT     │                               │
    │     status          ENUM     │                               │
    │     priority        ENUM     │                               │
    │ FK  owner_id        UUID     │───────────────────────────────┤
    │ FK  assignee_id     UUID     │───────────────────────────────┤
    │     rating          INT(1-5) │                               │
    │     rating_comment  TEXT     │                               │
    │     is_deleted      BOOLEAN  │                               │
    │     created_at      TIMESTAMP│                               │
    │     updated_at      TIMESTAMP│                               │
    │     resolved_at     TIMESTAMP│                               │
    └──────────────────────────────┘                               │
                │                                                   │
        ┌───────┼───────┬───────────────────┐                      │
        │       │       │                   │                      │
        ▼       ▼       ▼                   ▼                      │
┌───────────┐ ┌───────────┐ ┌───────────────┐ ┌──────────────────┐ │
│ COMMENTS  │ │ ACTIVITY  │ │  ATTACHMENTS  │ │   AUDIT_LOGS     │ │
├───────────┤ ├───────────┤ ├───────────────┤ ├──────────────────┤ │
│PK id      │ │PK id      │ │PK id          │ │PK id             │ │
│FK ticket  │ │FK ticket  │ │FK ticket_id   │ │FK user_id        │─┘
│FK user_id │ │FK actor_id│ │FK uploaded_by │ │   action         │
│   body    │ │   action  │ │   file_name   │ │   entity_type    │
│   created │ │   old_val │ │   content_type│ │   entity_id      │
└───────────┘ │   new_val │ │   file_size   │ │   timestamp      │
              │   created │ │   storage_path│ └──────────────────┘
              └───────────┘ │   deleted     │
                            │   created_at  │
                            └───────────────┘
```

### Table Definitions

#### 1. USERS Table
```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    google_id           VARCHAR(255) UNIQUE,
    password_hash       VARCHAR(255),
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    role                VARCHAR(20) NOT NULL DEFAULT 'USER',
    profile_picture_url VARCHAR(500),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 2. TICKETS Table
```sql
CREATE TABLE tickets (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    status         VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    priority       VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    owner_id       UUID NOT NULL REFERENCES users(id),
    assignee_id    UUID REFERENCES users(id),
    rating         INT CHECK (rating BETWEEN 1 AND 5),
    rating_comment TEXT,
    is_deleted     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at    TIMESTAMPTZ
);
```

#### 3. TICKET_COMMENTS Table
```sql
CREATE TABLE ticket_comments (
    id         UUID PRIMARY KEY,
    ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id),
    body       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 4. TICKET_ACTIVITY Table
```sql
CREATE TABLE ticket_activity (
    id         UUID PRIMARY KEY,
    ticket_id  UUID NOT NULL REFERENCES tickets(id),
    actor_id   UUID NOT NULL REFERENCES users(id),
    action     VARCHAR(50) NOT NULL,
    old_value  TEXT,
    new_value  TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 5. TICKET_ATTACHMENTS Table
```sql
CREATE TABLE ticket_attachments (
    id           UUID PRIMARY KEY,
    ticket_id    UUID NOT NULL REFERENCES tickets(id),
    uploaded_by  UUID NOT NULL REFERENCES users(id),
    file_name    VARCHAR(255) NOT NULL,
    content_type VARCHAR(150),
    file_size    BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Enum Types

| Enum | Values |
|------|--------|
| **User Role** | `USER`, `SUPPORT_AGENT`, `ADMIN` |
| **Ticket Status** | `OPEN`, `IN_PROGRESS`, `RESOLVED` |
| **Ticket Priority** | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │      │  Server  │      │   JWT    │      │ Database │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ POST /api/auth/login             │                 │
     │ {email, password}                │                 │
     │────────────────►│                │                 │
     │                 │                │                 │
     │                 │ Validate credentials             │
     │                 │────────────────────────────────►│
     │                 │◄────────────────────────────────│
     │                 │                │                 │
     │                 │ Generate Token │                 │
     │                 │───────────────►│                 │
     │                 │◄───────────────│                 │
     │                 │                │                 │
     │ Set-Cookie: accessToken=jwt...  │                 │
     │◄────────────────│                │                 │
     │                 │                │                 │
     │ GET /api/tickets                │                 │
     │ Cookie: accessToken=jwt...      │                 │
     │────────────────►│                │                 │
     │                 │                │                 │
     │                 │ Validate Token │                 │
     │                 │───────────────►│                 │
     │                 │◄───────────────│                 │
     │                 │                │                 │
     │  200 OK + Data  │                │                 │
     │◄────────────────│                │                 │
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS512",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user@email.com",
    "role": "SUPPORT_AGENT",
    "iat": 1769731271,
    "exp": 1769817671
  }
}
```

### Role-Based Access Control (RBAC)

| Feature | USER | SUPPORT_AGENT | ADMIN |
|---------|:----:|:-------------:|:-----:|
| Create Ticket | ✅ | ✅ | ✅ |
| View Own Tickets | ✅ | ✅ | ✅ |
| View Assigned Tickets | ❌ | ✅ | ✅ |
| View All Tickets | ❌ | ❌ | ✅ |
| Update Ticket Status | Own Only | Assigned | All |
| Assign Ticket | ❌ | ✅ | ✅ |
| Rate Resolved Ticket | Own Only | ❌ | ❌ |
| Add Comments | ✅ | ✅ | ✅ |
| Upload Attachments | ✅ | ✅ | ✅ |
| View Dashboard | Basic | Agent Stats | Full |
| Manage Users | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ |

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/logout` | Logout and clear cookie |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/me/stats` | Get agent performance stats |
| POST | `/api/users/me/profile-picture` | Upload profile picture |
| GET | `/api/users/{id}/profile-picture` | Get user's profile picture |

### Ticket Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | Get all tickets (role-aware) |
| GET | `/api/tickets/my` | Get current user's tickets |
| GET | `/api/tickets/search` | Search/filter tickets |
| GET | `/api/tickets/{id}` | Get ticket by ID |
| POST | `/api/tickets` | Create new ticket |
| PUT | `/api/tickets/{id}/status` | Update ticket status |
| POST | `/api/tickets/{id}/assign` | Assign ticket to agent |
| POST | `/api/tickets/{id}/rating` | Rate resolved ticket |
| DELETE | `/api/tickets/{id}` | Soft delete ticket |
| POST | `/api/tickets/{id}/restore` | Restore deleted ticket |
| GET | `/api/tickets/admin/dashboard` | Admin dashboard data |

### Comment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/{ticketId}/comments` | Get ticket comments |
| POST | `/api/tickets/{ticketId}/comments` | Add comment |

### Attachment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/{ticketId}/attachments` | List attachments |
| POST | `/api/tickets/{ticketId}/attachments` | Upload attachment |
| GET | `/api/tickets/{ticketId}/attachments/{id}` | Download attachment |
| DELETE | `/api/tickets/{ticketId}/attachments/{id}` | Delete attachment |

### Activity Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/{ticketId}/activities` | Get ticket activity log |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/{id}/status` | Toggle user active status |
| PUT | `/api/admin/users/{id}/role` | Update user role |
| GET | `/api/audit-logs` | Get system audit logs |

---

## ✨ Features

### 1. User Management
- **Registration & Login**: Email/password authentication
- **Google OAuth2**: Social login integration
- **Profile Management**: Upload profile pictures
- **Role Management**: Admin can assign roles

### 2. Ticket Management
- **Create Tickets**: Users can submit support requests
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Status Tracking**: OPEN → IN_PROGRESS → RESOLVED
- **Search & Filter**: By status, priority, search term
- **Pagination**: Server-side pagination support
- **Soft Delete**: Tickets can be archived and restored

### 3. Agent Features
- **Ticket Assignment**: Self-assign or admin assignment
- **Status Updates**: Move tickets through workflow
- **Performance Stats**: View average rating and ticket counts
- **Assigned Tickets View**: Dedicated page for assigned work

### 4. Collaboration
- **Comments**: Discussion threads on tickets
- **Activity Feed**: Complete audit trail of changes
- **File Attachments**: Upload supporting documents

### 5. Rating System
- **5-Star Rating**: Users rate resolved tickets
- **Rating Comments**: Optional feedback text
- **Agent Metrics**: Average rating calculation

### 6. Admin Dashboard
- **Overview Stats**: Total tickets, status breakdown
- **Priority Distribution**: Visual charts
- **User Management**: Activate/deactivate users
- **Audit Logs**: System activity tracking

### 7. Email Notifications
- **Ticket Created**: Notification to admins
- **Ticket Assigned**: Notification to assigned agent
- **Status Changed**: Notification to ticket owner

### 8. Security Features
- **JWT Authentication**: Secure token-based auth
- **HttpOnly Cookies**: XSS protection
- **CORS Configuration**: Cross-origin security
- **Role-Based Access**: Fine-grained permissions
- **Input Validation**: Server-side validation

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/main/java/com/ticketsmanage/backend/
│   ├── BackendApplication.java
│   ├── attachment/
│   │   ├── controller/AttachmentController.java
│   │   ├── dto/AttachmentDto.java
│   │   ├── entity/AttachmentEntity.java
│   │   ├── repository/AttachmentRepository.java
│   │   └── service/AttachmentService.java
│   ├── audit/
│   │   ├── controller/AuditController.java
│   │   └── service/AuditService.java
│   ├── comment/
│   │   ├── controller/TicketCommentController.java
│   │   ├── dto/CommentDto.java
│   │   ├── entity/CommentEntity.java
│   │   ├── repository/CommentRepository.java
│   │   └── service/CommentService.java
│   ├── common/
│   │   └── controller/HealthController.java
│   ├── notification/
│   │   ├── event/TicketAssignedEvent.java
│   │   ├── event/TicketCreatedEvent.java
│   │   ├── event/TicketStatusChangedEvent.java
│   │   └── service/ResendEmailService.java
│   ├── security/
│   │   ├── config/SecurityConfig.java
│   │   ├── controller/AuthController.java
│   │   ├── dto/AuthResponse.java
│   │   ├── dto/LoginRequest.java
│   │   ├── dto/RegisterRequest.java
│   │   ├── filter/JwtAuthenticationFilter.java
│   │   ├── service/AuthService.java
│   │   ├── service/CustomUserDetailsService.java
│   │   └── util/JwtUtil.java
│   ├── ticket/
│   │   ├── controller/TicketController.java
│   │   ├── dto/*.java
│   │   ├── entity/TicketEntity.java
│   │   ├── entity/TicketStatus.java
│   │   ├── entity/TicketPriority.java
│   │   ├── repository/TicketRepository.java
│   │   ├── repository/TicketSpecification.java
│   │   └── service/TicketService.java
│   ├── ticketactivity/
│   │   ├── controller/TicketActivityController.java
│   │   ├── entity/TicketActivityEntity.java
│   │   ├── repository/TicketActivityRepository.java
│   │   └── service/TicketActivityService.java
│   └── user/
│       ├── controller/UserController.java
│       ├── controller/AdminUserController.java
│       ├── dto/UserResponse.java
│       ├── dto/AgentStatsResponse.java
│       ├── entity/UserEntity.java
│       ├── entity/UserRole.java
│       ├── repository/UserRepository.java
│       └── service/UserService.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── db/migration/
│       ├── V1__core_schema.sql
│       ├── V2__add_password_field.sql
│       ├── V3__fix_enum_handling.sql
│       ├── V4__convert_enums_to_varchar.sql
│       ├── V5__create_ticket_comments.sql
│       ├── V6__create_ticket_activity.sql
│       ├── V7__create_ticket_attachments.sql
│       ├── V8__add_user_profile_picture.sql
│       └── V9__migrate_closed_to_resolved.sql
└── pom.xml
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx (Landing Page)
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── schema.ts
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx (AppShell)
│   │       ├── page.tsx (Dashboard)
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       ├── tickets/
│   │       │   ├── page.tsx (My Tickets)
│   │       │   └── [id]/
│   │       │       └── page.tsx (Ticket Detail)
│   │       ├── agent/
│   │       │   └── tickets/
│   │       │       └── page.tsx (Assigned Tickets)
│   │       └── admin/
│   │           ├── page.tsx (Admin Dashboard)
│   │           ├── tickets/
│   │           │   └── page.tsx (All Tickets)
│   │           └── users/
│   │               └── page.tsx (User Management)
│   ├── components/
│   │   ├── Providers.tsx
│   │   ├── dashboard/
│   │   │   └── AnalyticsCharts.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── ticket/
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── RateTicketDialog.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── data-table.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       └── ...
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── useMe.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── navigation.ts
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   └── types/
│       └── user.ts
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Running the Application

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+ (or Neon cloud account)

### Backend Setup
```bash
cd backend

# Configure environment variables in .env file
# DATABASE_URL=your_postgres_connection_string
# JWT_SECRET=your_jwt_secret

# Run with Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# NEXT_PUBLIC_API_URL=http://localhost:8080

# Run development server
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/actuator/health

---

## 📈 Performance Considerations

1. **Database Indexing**: Indexes on frequently queried columns
2. **Pagination**: Server-side pagination for large datasets
3. **Lazy Loading**: JPA lazy loading for relationships
4. **Connection Pooling**: HikariCP for database connections
5. **Query Optimization**: Spring Data JPA Specifications
6. **Caching**: React Query client-side caching

---

## 🔒 Security Measures

1. **Password Hashing**: BCrypt encryption
2. **JWT Tokens**: HS512 algorithm, 24-hour expiry
3. **HttpOnly Cookies**: Protection against XSS
4. **CORS Policy**: Restricted to allowed origins
5. **Input Validation**: Bean Validation (JSR-380)
6. **SQL Injection Prevention**: JPA parameterized queries
7. **Rate Limiting**: Configurable via Spring Security

---

## 📋 Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **SLA Management**: Ticket response time tracking
3. **Knowledge Base**: Self-service articles
4. **Multi-tenancy**: Organization-based isolation
5. **Reporting**: Advanced analytics and exports
6. **Mobile App**: React Native companion app
7. **AI Integration**: Ticket categorization and routing

---

## 👥 User Roles Summary

### Regular User
- Create and track personal tickets
- Add comments and attachments
- Rate resolved tickets
- View personal dashboard

### Support Agent
- View and manage assigned tickets
- Update ticket status
- View performance metrics
- Comment on tickets

### Administrator
- Full system access
- User management
- View all tickets
- Access audit logs
- Dashboard analytics

---

**Document Version**: 1.0
