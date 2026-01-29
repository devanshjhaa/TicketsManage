create table ticket_attachments (
    id uuid primary key,

    ticket_id uuid not null,
    uploaded_by uuid not null,

    file_name varchar(255) not null,
    content_type varchar(150),
    file_size bigint not null,

    storage_path text not null,

    deleted boolean not null default false,

    created_at timestamptz not null default now(),

    constraint fk_ticket_attachment_ticket
        foreign key (ticket_id)
        references tickets(id),

    constraint fk_ticket_attachment_user
        foreign key (uploaded_by)
        references users(id)
);
