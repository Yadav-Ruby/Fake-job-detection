-- Graphura Job Scam & Fraud Detection Platform - Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up the database tables, relationships, and triggers.

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. USER PROFILES TABLE
create table if not exists public.user_profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    email text,
    avatar_url text,
    role text default 'user' check (role in ('user', 'admin', 'super_admin')),
    account_status text default 'active' check (account_status in ('active', 'suspended', 'deactivated')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- 2. COMPANIES TABLE
create table if not exists public.companies (
    id uuid default gen_random_uuid() primary key,
    name text unique not null,
    domain text,
    website_active boolean default false,
    company_trust_score numeric default 50.0,
    trust_factors jsonb default '[]'::jsonb,
    verification_status text default 'Pending' check (verification_status in ('Pending', 'Under Review', 'Verified', 'Rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.companies enable row level security;

-- 3. RECRUITERS TABLE
create table if not exists public.recruiters (
    id uuid default gen_random_uuid() primary key,
    name text default '',
    title text default '',
    email_hash text default '',
    email_domain text default '',
    linkedin_url text default '',
    recruiter_verification_score numeric default 50.0,
    verification_flags jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.recruiters enable row level security;

-- 4. JOBS TABLE
create table if not exists public.jobs (
    id uuid default gen_random_uuid() primary key,
    job_title text not null,
    job_description text not null,
    company_id uuid references public.companies(id) on delete set null,
    recruiter_id uuid references public.recruiters(id) on delete set null,
    location_raw text default '',
    location_city text default '',
    location_state text default '',
    salary_raw text default '',
    salary_min_annual_inr numeric default 0.0,
    salary_max_annual_inr numeric default 0.0,
    skills text[] default '{}'::text[],
    source_url text unique not null,
    job_hash text unique not null,
    is_government boolean default false,
    platform_name text default 'Unknown',
    scam_risk_score numeric default 0.0,
    scam_risk_level text default 'Safe' check (scam_risk_level in ('Safe', 'Low Risk', 'Medium Risk', 'High Risk', 'Scam Likely')),
    scam_explanations jsonb default '[]'::jsonb,
    application_deadline date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.jobs enable row level security;

-- 5. USER REPORTS TABLE (Crowdsourced flag warnings)
create table if not exists public.user_reports (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.user_profiles(id) on delete set null,
    job_url text default '',
    job_description text default '',
    company_name text default '',
    contact_method text default '',
    experience text default '',
    contact text default '',
    status text default 'pending' check (status in ('pending', 'reviewed', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_reports enable row level security;

-- 6. KEYWORD DICTIONARY TABLE
create table if not exists public.keyword_dictionary (
    id serial primary key,
    keyword text unique not null,
    weight numeric default 10.0,
    category text default 'generic'
);

alter table public.keyword_dictionary enable row level security;

-- 7. SAVED JOBS TABLE (Favorites)
create table if not exists public.saved_jobs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    job_id uuid references public.jobs(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, job_id)
);

alter table public.saved_jobs enable row level security;

-- 8. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    actor_id uuid references public.user_profiles(id) on delete set null,
    action text not null,
    target_type text not null,
    target_id text not null,
    details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

-- 9. MODEL TRAINING DATA TABLE
create table if not exists public.model_training_data (
    id uuid default gen_random_uuid() primary key,
    job_title text not null,
    job_description text not null,
    salary_raw text default '',
    skills text[] default '{}'::text[],
    is_scam boolean not null,
    verified_by uuid references public.user_profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.model_training_data enable row level security;



-- =====================================================================
-- RLS POLICIES (Row Level Security)
-- =====================================================================

-- Profiles Policies
create policy "Allow public read access to profiles" on public.user_profiles
    for select using (true);

create policy "Allow users to update their own profiles" on public.user_profiles
    for update using (auth.uid() = id);

-- Companies Policies
create policy "Allow public read access to companies" on public.companies
    for select using (true);

create policy "Allow auth insertions to companies" on public.companies
    for insert with check (auth.role() = 'authenticated');

create policy "Allow admins to modify companies" on public.companies
    for all using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );

-- Jobs Policies
create policy "Allow public read access to jobs" on public.jobs
    for select using (true);

create policy "Allow inserts to jobs" on public.jobs
    for insert with check (true);

create policy "Allow admins to delete/update jobs" on public.jobs
    for all using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );

-- User Reports Policies
create policy "Allow users to read their own reports" on public.user_reports
    for select using (auth.uid() = user_id);

create policy "Allow public to file scam reports" on public.user_reports
    for insert with check (true);

-- Saved Jobs Policies
create policy "Allow users to manage saved jobs" on public.saved_jobs
    for all using (auth.uid() = user_id);

-- Keyword Dictionary Policies
create policy "Allow read access to keyword dictionary" on public.keyword_dictionary
    for select using (true);

-- Audit Logs Policies
create policy "Allow admins to read audit logs" on public.audit_logs
    for select using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );

-- Model Training Data Policies
create policy "Allow admins full access to training data" on public.model_training_data
    for all using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role in ('admin', 'super_admin')
        )
    );



-- =====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, email, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
create index if not exists jobs_job_hash_idx on public.jobs(job_hash);
create index if not exists jobs_source_url_idx on public.jobs(source_url);
create index if not exists jobs_scam_risk_level_idx on public.jobs(scam_risk_level);
create index if not exists companies_name_idx on public.companies(name);
create index if not exists recruiters_email_domain_idx on public.recruiters(email_domain);


-- =====================================================================
-- SCHEDULED DAILY AUTO-DELETION OF EXPIRED JOBS (pg_cron)
-- =====================================================================
create extension if not exists pg_cron;

select cron.schedule(
  'clean-expired-jobs-daily',
  '0 0 * * *', -- Runs every night at midnight UTC
  $$
  delete from public.jobs 
  where application_deadline < current_date 
    and scam_risk_level not in ('High Risk', 'Scam Likely')
  $$
);

