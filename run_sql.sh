#!/bin/bash

# Set database connection details
DB_HOST="aws-1-us-east-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.csbwewirwzeitavhvykr"
DB_PASSWORD="dzQQQk8yGM6A1mtq"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

echo "Running setup_database.sql..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f setup_database.sql

echo "Running setup_household_invitations.sql..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f setup_household_invitations.sql

echo "Database setup complete!"
