# 📋 TicketsManage - Enterprise Ticketing System

## 🎯 Project Overview

**TicketsManage** is a comprehensive enterprise-grade ticketing and support management system built with modern technologies. This full-stack application demonstrates proficiency in building scalable, secure, and maintainable web applications.

| Project Info | Details |
|-------------|---------|
| **Author** | Devansh Jha |
| **Duration** | January 2026 |
| **Type** | Full-Stack Web Application |
| **Status** | ✅ Production Ready |

---

## 🎯 Project Objectives

1. **Build a scalable ticket management system** that handles support requests efficiently
2. **Implement secure authentication** with JWT and OAuth 2.0 (Google)
3. **Design role-based access control** for Admin, Agent, and Customer users
4. **Create intuitive dashboards** for different user roles
5. **Deploy to cloud platforms** demonstrating DevOps capabilities
6. **Follow industry best practices** for code quality and architecture

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              🌐 CLIENT LAYER                                   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                    📱 Next.js 14 Frontend (Vercel)                      │  ║
║  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │  ║
║  │  │  React 18 +   │ │  TanStack     │ │  Tailwind +   │ │ TypeScript  │ │  ║
║  │  │  App Router   │ │  Query v5     │ │  shadcn/ui    │ │ Strict Mode │ │  ║
║  │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
                                      │
                                      │ 🔐 HTTPS / REST API
                                      ▼
╔═══════════════════════════════════════════════════════════════════════════════╗
║                            ⚙️ APPLICATION LAYER                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                ☕ Spring Boot 3.5 Backend (Render/Docker)               │  ║
║  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │  ║
║  │  │ Spring        │ │ Spring Data   │ │ JWT + OAuth   │ │   Flyway    │ │  ║
║  │  │ Security 6    │ │ JPA/Hibernate │ │ 2.0 (Google)  │ │ Migrations  │ │  ║
║  │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
                                      │
                                      │ 🔗 JDBC Connection Pool (HikariCP)
                                      ▼
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              💾 DATA LAYER                                     ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                    🐘 PostgreSQL 17 (Neon Cloud)                        │  ║
║  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │  ║
║  │  │    Users      │ │   Tickets     │ │   Comments    │ │  Activity   │ │  ║
║  │  │    Table      │ │    Table      │ │    Table      │ │    Logs     │ │  ║
║  │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Backend Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        🎮 CONTROLLER LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │    Auth     │ │   Ticket    │ │   Comment   │ │    Admin    │   │
│  │ Controller  │ │ Controller  │ │ Controller  │ │ Controller  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                        💼 SERVICE LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │    Auth     │ │   Ticket    │ │   Comment   │ │  Activity   │   │
│  │   Service   │ │   Service   │ │   Service   │ │   Service   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                       📦 REPOSITORY LAYER                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │    User     │ │   Ticket    │ │   Comment   │ │  Activity   │   │
│  │ Repository  │ │ Repository  │ │ Repository  │ │ Repository  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                        📋 ENTITY LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │    User     │ │   Ticket    │ │   Comment   │ │  Activity   │   │
│  │   Entity    │ │   Entity    │ │   Entity    │ │   Entity    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                        🔐 SECURITY LAYER                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐   │
│  │  JwtAuthFilter  │ │  SecurityConfig │ │      JwtUtil        │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|:-----------|:-------:|:--------|
| ☕ Java | 17 LTS | Core programming language |
| 🍃 Spring Boot | 3.5.10 | Application framework |
| 🔐 Spring Security | 6.x | Authentication & Authorization |
| 📊 Spring Data JPA | 3.x | ORM and data access layer |
| 🗄️ Hibernate | 6.x | JPA implementation |
| 🐘 PostgreSQL | 17 | Relational database |
| 🔄 Flyway | 10.x | Database migrations |
| 🎫 JWT (jjwt) | 0.12.6 | Token-based authentication |
| 🔑 OAuth 2.0 | - | Google social login |
| 📦 Maven | 3.9+ | Build automation |
| 🐳 Docker | - | Containerization |

### Frontend Technologies

| Technology | Version | Purpose |
|:-----------|:-------:|:--------|
| ⚛️ Next.js | 14.2.35 | React framework with SSR/SSG |
| ⚛️ React | 18 | UI component library |
| 📘 TypeScript | 5.x | Type-safe JavaScript |
| 🔄 TanStack Query | 5.x | Server state management |
| 🎨 Tailwind CSS | 3.4 | Utility-first CSS framework |
| 🧩 shadcn/ui | Latest | UI component library |
| 🌐 Axios | 1.9 | HTTP client |
| 📊 Recharts | 2.15 | Data visualization |
| 🎯 Lucide React | Latest | Icon library |

### DevOps & Infrastructure

| Service | Purpose |
|:--------|:--------|
| ▲ Vercel | Frontend hosting with CI/CD |
| 🚀 Render | Backend hosting with Docker |
| 🐘 Neon | Serverless PostgreSQL |
| 🐙 GitHub | Version control & CI/CD triggers |

---

## 📊 Database Design

### Entity Relationship Diagram

```
┌──────────────────────┐          ┌──────────────────────┐
│       👤 USERS       │          │      🎫 TICKETS      │
├──────────────────────┤          ├──────────────────────┤
│ 🔑 id (PK)           │────┐     │ 🔑 id (PK)           │
│ 📧 email (UNIQUE)    │    │     │ 📝 title             │
│ 🔒 password          │    │     │ 📄 description       │
│ 👤 name              │    ├────▶│ 👤 creator_id (FK)   │
│ 🎭 role              │    │     │ 👨‍💼 assignee_id (FK)  │◀──┐
│ 📅 created_at        │    │     │ 📊 status            │   │
│ 📅 updated_at        │    │     │ ⚡ priority          │   │
└──────────────────────┘    │     │ 🏷️ category          │   │
                            │     │ ⭐ rating            │   │
                            │     │ 📅 created_at        │   │
                            │     │ 📅 updated_at        │   │
                            │     └──────────────────────┘   │
                            │               │                │
                            │               ▼                │
                            │     ┌──────────────────────┐   │
                            │     │   💬 TICKET_COMMENTS │   │
                            │     ├──────────────────────┤   │
                            │     │ 🔑 id (PK)           │   │
                            │     │ 🎫 ticket_id (FK)    │   │
                            └────▶│ 👤 author_id (FK)    │   │
                                  │ 📝 content           │   │
                                  │ 📅 created_at        │   │
                                  └──────────────────────┘   │
                                                             │
                                  ┌──────────────────────┐   │
                                  │  📋 TICKET_ACTIVITY  │   │
                                  ├──────────────────────┤   │
                                  │ 🔑 id (PK)           │   │
                                  │ 🎫 ticket_id (FK)    │   │
                                  │ 👤 user_id (FK)      │───┘
                                  │ ⚡ action            │
                                  │ 📤 old_value         │
                                  │ 📥 new_value         │
                                  │ 📅 created_at        │
                                  └──────────────────────┘
```

### Database Schema (DDL)

```sql
-- 👤 Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎫 Tickets Table
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    category VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    creator_id BIGINT REFERENCES users(id),
    assignee_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💬 Comments Table
CREATE TABLE ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
    author_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📋 Activity Log Table
CREATE TABLE ticket_activity (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📇 Indexes for Performance
CREATE INDEX idx_tickets_creator ON tickets(creator_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_activity_ticket ON ticket_activity(ticket_id);
```

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  👤 User │      │ 📱 Frontend│     │ ⚙️ Backend │     │ 💾 Database│
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ 1. Login Form   │                 │                 │
     │────────────────▶│                 │                 │
     │                 │                 │                 │
     │                 │ 2. POST /auth/login               │
     │                 │────────────────▶│                 │
     │                 │                 │                 │
     │                 │                 │ 3. Validate     │
     │                 │                 │────────────────▶│
     │                 │                 │                 │
     │                 │                 │ 4. User Data    │
     │                 │                 │◀────────────────│
     │                 │                 │                 │
     │                 │ 5. JWT Token    │                 │
     │                 │◀────────────────│                 │
     │                 │                 │                 │
     │ 6. Store Token  │                 │                 │
     │◀────────────────│                 │                 │
     │                 │                 │                 │
     │ 7. API Request  │                 │                 │
     │────────────────▶│                 │                 │
     │                 │ 8. + Bearer JWT │                 │
     │                 │────────────────▶│                 │
     │                 │                 │ 9. Validate JWT │
     │                 │                 │────────┐        │
     │                 │                 │◀───────┘        │
     │                 │ 10. Response    │                 │
     │                 │◀────────────────│                 │
     │ 11. Display     │                 │                 │
     │◀────────────────│                 │                 │
```

### Role-Based Access Control (RBAC)

| Role | 🎯 Permissions |
|:----:|:---------------|
| 👑 **ADMIN** | Full system access, user management, view all tickets, assign agents, analytics dashboard |
| 👨‍💼 **AGENT** | View assigned tickets, update status, add comments, resolve tickets |
| 👤 **CUSTOMER** | Create tickets, view own tickets, add comments, rate resolved tickets |

### Ticket Lifecycle State Machine

```
                    ┌─────────────────┐
                    │     📝 OPEN     │
                    │  (New Ticket)   │
                    └────────┬────────┘
                             │
                             │ 👑 Admin assigns to Agent
                             ▼
                    ┌─────────────────┐
                    │ 🔄 IN_PROGRESS  │
                    │ (Agent Working) │
                    └────────┬────────┘
                             │
                             │ 👨‍💼 Agent resolves issue
                             ▼
                    ┌─────────────────┐
                    │  ✅ RESOLVED    │
                    │(Pending Review) │
                    └────────┬────────┘
                             │
                             │ 👤 Customer confirms & rates
                             ▼
                    ┌─────────────────┐
                    │   🔒 CLOSED     │
                    │  (Archived)     │
                    └─────────────────┘
```

---

## 🌐 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|:------:|:---------|:------------|:----:|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | User login, returns JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user info | ✅ |
| `GET` | `/api/auth/oauth2/google` | Google OAuth login | ❌ |

### 🎫 Ticket Endpoints

| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:------:|
| `GET` | `/api/tickets` | List tickets (filtered by role) | All |
| `POST` | `/api/tickets` | Create new ticket | Customer |
| `GET` | `/api/tickets/{id}` | Get ticket details | Owner/Agent/Admin |
| `PATCH` | `/api/tickets/{id}/status` | Update ticket status | Agent/Admin |
| `PATCH` | `/api/tickets/{id}/assign` | Assign agent to ticket | Admin |
| `PATCH` | `/api/tickets/{id}/rate` | Rate resolved ticket | Customer |

### 💬 Comment Endpoints

| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:------:|
| `GET` | `/api/tickets/{id}/comments` | Get ticket comments | Ticket Access |
| `POST` | `/api/tickets/{id}/comments` | Add new comment | Ticket Access |

### 👑 Admin Endpoints

| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:------:|
| `GET` | `/api/admin/users` | List all users | Admin |
| `GET` | `/api/admin/agents` | List all agents | Admin |
| `GET` | `/api/admin/analytics` | Dashboard statistics | Admin |
| `PATCH` | `/api/admin/users/{id}/role` | Update user role | Admin |

---

## 📱 Frontend Structure

```
frontend/src/
├── 📁 app/                      # Next.js App Router
│   ├── 📄 layout.tsx            # Root layout with providers
│   ├── 📄 page.tsx              # Landing page
│   ├── 📁 login/                # Login page
│   ├── 📁 register/             # Registration page
│   └── 📁 dashboard/
│       ├── 📄 layout.tsx        # Dashboard shell (AppShell)
│       ├── 📄 page.tsx          # Dashboard home
│       ├── 📁 tickets/          # Ticket management
│       │   ├── 📄 page.tsx      # Ticket list
│       │   └── 📁 [id]/         # Ticket details
│       ├── 📁 admin/            # Admin panel
│       ├── 📁 agent/            # Agent workspace
│       └── 📁 profile/          # User profile
├── 📁 components/
│   ├── 📁 ui/                   # Reusable UI (shadcn/ui)
│   ├── 📁 layout/               # AppShell, Sidebar, Topbar
│   ├── 📁 ticket/               # Ticket-specific components
│   └── 📁 dashboard/            # Dashboard widgets
├── 📁 hooks/                    # Custom React hooks
├── 📁 lib/                      # Utilities & configs
└── 📁 types/                    # TypeScript definitions
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           🌍 INTERNET                                   │
└─────────────────────────────────────────────────────────────────────────┘
                         │                    │
                         ▼                    ▼
          ┌──────────────────────┐  ┌──────────────────────┐
          │   ▲ Vercel (CDN)     │  │   🚀 Render          │
          │   ╔════════════════╗ │  │   ╔════════════════╗ │
          │   ║  📱 Frontend   ║ │  │   ║  ⚙️ Backend    ║ │
          │   ║  Next.js 14    ║ │  │   ║  Spring Boot   ║ │
          │   ╚════════════════╝ │  │   ╚════════════════╝ │
          │   • Global Edge CDN  │  │   • Docker Container │
          │   • Auto SSL/TLS     │  │   • Auto-deploy      │
          │   • CI/CD Pipeline   │  │   • Health Checks    │
          └──────────────────────┘  └──────────────────────┘
                                              │
                                              ▼
                              ┌──────────────────────┐
                              │   🐘 Neon Cloud      │
                              │   ╔════════════════╗ │
                              │   ║  PostgreSQL 17 ║ │
                              │   ╚════════════════╝ │
                              │   • Serverless       │
                              │   • Auto-scaling     │
                              │   • Connection Pool  │
                              └──────────────────────┘
```

### Environment Configuration

**Backend (Render):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
FRONTEND_URL=https://your-app.vercel.app
```

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

---

## ✨ Key Features

| Feature | Description |
|:--------|:------------|
| 🔐 **Secure Authentication** | JWT tokens + Google OAuth 2.0 |
| 👥 **Role-Based Access** | Admin, Agent, Customer permissions |
| 🎫 **Ticket Management** | Full CRUD with status workflow |
| 💬 **Comments System** | Threaded discussions on tickets |
| 📋 **Activity Logging** | Complete audit trail |
| ⭐ **Rating System** | Customer satisfaction tracking |
| 📊 **Analytics Dashboard** | Statistics for admins |
| 🌙 **Dark/Light Theme** | User preference support |
| 📱 **Responsive Design** | Mobile-first approach |

---

## 🔮 Future Enhancements

| Feature | Priority | Status |
|:--------|:--------:|:------:|
| 📧 Email Notifications | High | 🔜 Planned |
| 📎 File Attachments | High | 🔜 Planned |
| ⚡ Real-time Updates (WebSocket) | Medium | 📋 Backlog |
| ⏱️ SLA Management | Medium | 📋 Backlog |
| 📚 Knowledge Base | Low | 📋 Backlog |
| 📱 Mobile App | Low | 📋 Backlog |

---

## 📚 Lessons Learned

1. **Spring Security 6** - Modern SecurityFilterChain configuration
2. **Next.js App Router** - Server components and streaming
3. **TypeScript Strict Mode** - Type safety benefits
4. **Flyway Migrations** - Version-controlled schema changes
5. **JWT Best Practices** - Secure token handling
6. **Docker Containerization** - Consistent deployment environments

---

## 🔗 Links

| Resource | Link |
|:---------|:-----|
| 🐙 **GitHub Repository** | [github.com/devanshjhaa/TicketsManage](https://github.com/devanshjhaa/TicketsManage) |
| 🌐 **Live Frontend** | [tickets-manage.vercel.app](https://tickets-manage.vercel.app) |
| ⚙️ **Backend API** | [ticketsmanage.onrender.com](https://ticketsmanage.onrender.com) |

---

**Built with ❤️ by Devansh Jha**
