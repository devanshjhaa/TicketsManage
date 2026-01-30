-- Migrate all CLOSED tickets to RESOLVED since we removed the CLOSED status
UPDATE tickets SET status = 'RESOLVED' WHERE status = 'CLOSED';
