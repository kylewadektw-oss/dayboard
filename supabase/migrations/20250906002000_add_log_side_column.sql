-- Add side column to distinguish client vs server logs
create type log_side as enum ('client', 'server');

-- Add the side column to application_logs table
alter table application_logs 
add column side log_side default 'client';

-- Add index for the side column for better filtering performance
create index idx_application_logs_side on application_logs(side);

-- Update existing logs to be marked as 'client' (default behavior)
update application_logs set side = 'client' where side is null;

-- Make the column non-nullable now that all existing rows have a value
alter table application_logs alter column side set not null;
