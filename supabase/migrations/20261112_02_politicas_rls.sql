-- ETAPA 2 de 2 — rode depois de 20261112_01_funcao_papel_atual.sql
-- (Se a etapa 1 for rodada de novo, rode esta logo em seguida: a etapa 1
--  remove as políticas que dependem da função.)

begin;

-- 2) Remove todas as políticas atuais ---------------------------------
do $$
declare r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('assistidos', 'profiles', 'voluntarios')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.assistidos  enable row level security;
alter table public.profiles    enable row level security;
alter table public.voluntarios enable row level security;

-- 3) assistidos --------------------------------------------------------
create policy assistidos_select on public.assistidos
  for select to authenticated
  using (public.papel_atual() is not null);

create policy assistidos_insert on public.assistidos
  for insert to authenticated
  with check (public.papel_atual() is not null);

create policy assistidos_update on public.assistidos
  for update to authenticated
  using (public.papel_atual() in ('admin', 'servico_social'))
  with check (public.papel_atual() in ('admin', 'servico_social'));

create policy assistidos_delete on public.assistidos
  for delete to authenticated
  using (public.papel_atual() = 'admin');

-- 4) voluntarios -------------------------------------------------------
create policy voluntarios_select on public.voluntarios
  for select to authenticated
  using (public.papel_atual() is not null);

create policy voluntarios_insert on public.voluntarios
  for insert to authenticated
  with check (public.papel_atual() is not null);

create policy voluntarios_update on public.voluntarios
  for update to authenticated
  using (public.papel_atual() is not null)
  with check (public.papel_atual() is not null);

create policy voluntarios_delete on public.voluntarios
  for delete to authenticated
  using (public.papel_atual() = 'admin');

-- 5) profiles ----------------------------------------------------------
-- O próprio perfil continua legível mesmo inativo, para o app conseguir
-- detectar a desativação e encerrar a sessão.
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.papel_atual() is not null);

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (public.papel_atual() = 'admin');

create policy profiles_update on public.profiles
  for update to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');

create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.papel_atual() = 'admin');

commit;

-- =====================================================================
-- Conferência depois de rodar:
--   select tablename, policyname, cmd, roles, qual, with_check
--   from pg_policies where schemaname = 'public' order by tablename;
--
-- Auditoria de contas (procure e-mails que você não reconhece):
--   select id, email, created_at, last_sign_in_at
--   from auth.users order by created_at desc;
-- =====================================================================
