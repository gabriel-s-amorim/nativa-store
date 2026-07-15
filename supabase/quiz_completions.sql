-- Execute no SQL Editor do Supabase (ou via migration)
-- Conclusões do quiz: raridade + resultId para "Chama uma amiga"

create table if not exists public.quiz_completions (
  id uuid primary key default gen_random_uuid(),
  result_profile_id text not null references public.quiz_results (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists quiz_completions_profile_idx
  on public.quiz_completions (result_profile_id);

create index if not exists quiz_completions_created_at_idx
  on public.quiz_completions (created_at desc);

alter table public.quiz_completions enable row level security;
