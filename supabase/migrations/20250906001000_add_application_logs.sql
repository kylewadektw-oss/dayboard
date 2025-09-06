-- Create enum for log levels
create type log_level as enum ('debug', 'info', 'warn', 'error');

-- Create application_logs table
create table application_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  session_id text, -- Browser session identifier
  level log_level not null,
  message text not null,
  component text, -- Which component/page generated the log
  data jsonb, -- Additional structured data
  stack_trace text, -- Error stack trace if applicable
  user_agent text, -- Browser user agent
  url text, -- Current page URL
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for performance
create index idx_application_logs_user_id on application_logs(user_id);
create index idx_application_logs_level on application_logs(level);
create index idx_application_logs_timestamp on application_logs(timestamp desc);
create index idx_application_logs_session_id on application_logs(session_id);
create index idx_application_logs_component on application_logs(component);

-- Enable RLS
alter table application_logs enable row level security;

-- Policies: Users can only see their own logs, or logs without a user_id (anonymous)
create policy "Users can view own logs" on application_logs 
  for select using (
    auth.uid() = user_id 
    or user_id is null
  );

-- Users can insert their own logs
create policy "Users can insert own logs" on application_logs 
  for insert with check (
    auth.uid() = user_id 
    or user_id is null
  );

-- Admin users can view all logs (we'll add this later when we have admin roles)
-- create policy "Admins can view all logs" on application_logs 
--   for select using (
--     exists (
--       select 1 from user_roles 
--       where user_id = auth.uid() 
--       and role = 'admin'
--     )
--   );

-- Add to realtime publication for live updates
alter publication supabase_realtime add table application_logs;
