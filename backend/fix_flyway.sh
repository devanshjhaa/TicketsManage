#!/bin/bash
echo "DELETE FROM flyway_schema_history WHERE version = '11';" > /tmp/fix.sql
docker run --rm -v /tmp/fix.sql:/tmp/fix.sql -e PGPASSWORD=learnitup postgres:17-alpine psql 'postgresql://postgres@ticketsmanage-db.cngeqga6wi79.ap-south-1.rds.amazonaws.com:5432/postgres?sslmode=require' -f /tmp/fix.sql
