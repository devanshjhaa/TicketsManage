--Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM TYPES

CREATE TYPE user_role AS ENUM (
    'USER',
    'SUPPORT_AGENT',
    'ADMIN'
);

CREATE TYPE ticket_status AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);

CREATE TYPE ticket_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

-- USERS

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       email VARCHAR(255) NOT NULL UNIQUE,
                       google_id VARCHAR(255) UNIQUE,

                       first_name VARCHAR(100),
                       last_name VARCHAR(100),

                       role user_role NOT NULL DEFAULT 'USER',

                       is_active BOOLEAN NOT NULL DEFAULT TRUE,

                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TICKETS

CREATE TABLE tickets (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                         title VARCHAR(255) NOT NULL,
                         description TEXT,

                         status ticket_status NOT NULL DEFAULT 'OPEN',
                         priority ticket_priority NOT NULL DEFAULT 'MEDIUM',

                         owner_id UUID NOT NULL,
                         assignee_id UUID,

                         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                         updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                         resolved_at TIMESTAMPTZ,

                         rating INT CHECK (rating BETWEEN 1 AND 5),
                         rating_comment TEXT,

                         is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

                         CONSTRAINT fk_ticket_owner
                             FOREIGN KEY (owner_id)
                                 REFERENCES users(id),

                         CONSTRAINT fk_ticket_assignee
                             FOREIGN KEY (assignee_id)
                                 REFERENCES users(id)
);

-- TICKET COMMENTS

CREATE TABLE ticket_comments (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                 ticket_id UUID NOT NULL,
                                 author_id UUID NOT NULL,

                                 content TEXT NOT NULL,

                                 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                 CONSTRAINT fk_comment_ticket
                                     FOREIGN KEY (ticket_id)
                                         REFERENCES tickets(id)
                                         ON DELETE CASCADE,

                                 CONSTRAINT fk_comment_author
                                     FOREIGN KEY (author_id)
                                         REFERENCES users(id)
);

-- ATTACHMENTS

CREATE TABLE attachments (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                             ticket_id UUID NOT NULL,
                             uploaded_by UUID NOT NULL,

                             file_name VARCHAR(255) NOT NULL,
                             mime_type VARCHAR(100) NOT NULL,
                             storage_key TEXT NOT NULL,

                             size_bytes BIGINT NOT NULL,

                             uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                             CONSTRAINT fk_attachment_ticket
                                 FOREIGN KEY (ticket_id)
                                     REFERENCES tickets(id)
                                     ON DELETE CASCADE,

                             CONSTRAINT fk_attachment_user
                                 FOREIGN KEY (uploaded_by)
                                     REFERENCES users(id)
);

-- AUDIT LOGS

CREATE TABLE audit_logs (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                            ticket_id UUID,
                            actor_id UUID NOT NULL,

                            action VARCHAR(100) NOT NULL,

                            old_value JSONB,
                            new_value JSONB,

                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                            CONSTRAINT fk_audit_ticket
                                FOREIGN KEY (ticket_id)
                                    REFERENCES tickets(id),

                            CONSTRAINT fk_audit_actor
                                FOREIGN KEY (actor_id)
                                    REFERENCES users(id)
);

-- REFRESH TOKENS

CREATE TABLE refresh_tokens (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                user_id UUID NOT NULL,

                                token_hash TEXT NOT NULL,

                                expires_at TIMESTAMPTZ NOT NULL,

                                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                CONSTRAINT fk_refresh_user
                                    FOREIGN KEY (user_id)
                                        REFERENCES users(id)
                                        ON DELETE CASCADE
);

-- INDEXES

CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_tickets_owner ON tickets(owner_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);

CREATE INDEX idx_tickets_status_priority
    ON tickets(status, priority);

CREATE INDEX idx_comments_ticket ON ticket_comments(ticket_id);

CREATE INDEX idx_attachments_ticket ON attachments(ticket_id);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
