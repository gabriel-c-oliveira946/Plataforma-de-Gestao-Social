-- =====================================================================
-- SOMENTE PARA O PROJETO DEMO (credenciais públicas no README)
-- Rode DEPOIS de supabase/migrations/20261112_rls_seguranca.sql
-- =====================================================================
-- Parte A: o visitante continua admin (para mostrar todas as funções),
--          mas ninguém consegue desativar, rebaixar ou excluir o perfil
--          dele. Assim a demo não fica trancada para quem vier depois.
-- Parte B: reset automático diário das fichas e voluntários de exemplo
--          (às 03:00 de Brasília), desfazendo qualquer estrago.
-- =====================================================================

begin;

-- ---------- Parte A: perfil do visitante protegido -------------------
create or replace function public.id_visitante()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select id from auth.users where lower(email) = 'visitante@larharmonia.org' limit 1
$$;

revoke all on function public.id_visitante() from public;
grant execute on function public.id_visitante() to authenticated;

drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_delete on public.profiles;

create policy profiles_update on public.profiles
  for update to authenticated
  using (public.papel_atual() = 'admin' and id is distinct from public.id_visitante())
  with check (public.papel_atual() = 'admin' and id is distinct from public.id_visitante());

create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.papel_atual() = 'admin' and id is distinct from public.id_visitante());

-- ---------- Parte B: cópia das fichas atuais como "estado padrão" -----
-- IMPORTANTE: rode quando os dados da demo estiverem do jeito que você
-- quer mostrar. Essa cópia é o que será restaurado todo dia.
-- O schema demo_seed não é exposto pela API do Supabase.
create schema if not exists demo_seed;

drop table if exists demo_seed.assistidos;
drop table if exists demo_seed.voluntarios;
create table demo_seed.assistidos as table public.assistidos;
alter table demo_seed.assistidos enable row level security;

-- voluntarios só é copiada se existir neste projeto
do $$
begin
  if to_regclass('public.voluntarios') is not null then
    execute 'create table demo_seed.voluntarios as table public.voluntarios';
    execute 'alter table demo_seed.voluntarios enable row level security';
  end if;
end $$;

create or replace function demo_seed.restaurar()
returns void
language plpgsql
as $$
begin
  delete from public.assistidos;
  insert into public.assistidos select * from demo_seed.assistidos;
  if to_regclass('public.voluntarios') is not null
     and to_regclass('demo_seed.voluntarios') is not null then
    execute 'delete from public.voluntarios';
    execute 'insert into public.voluntarios select * from demo_seed.voluntarios';
  end if;
end;
$$;

revoke all on function demo_seed.restaurar() from public;

commit;

-- ---------- Agendamento diário (06:00 UTC = 03:00 Brasília) ----------
-- Se der erro aqui, ative a extensão em Database > Extensions > pg_cron
-- e rode só este trecho novamente.
create extension if not exists pg_cron;
select cron.schedule('reset-demo-lar-harmonia', '0 6 * * *', $$select demo_seed.restaurar()$$);

-- Para testar o reset na hora:      select demo_seed.restaurar();
-- Para ver o agendamento:           select * from cron.job;
-- Se mudar colunas das tabelas no futuro, rode a Parte B de novo para
-- atualizar a cópia (senão o insert do reset falha).
