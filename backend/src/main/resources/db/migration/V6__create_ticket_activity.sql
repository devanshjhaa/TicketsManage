CREATE TABLE ticket_activity (

    id UUID PRIMARY KEY,

    ticket_id UUID NOT NULL,

    actor_id UUID NOT NULL,

    action VARCHAR(50) NOT NULL,

    old_value TEXT,

    new_value TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_activity_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id),

    CONSTRAINT fk_activity_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id)

);
