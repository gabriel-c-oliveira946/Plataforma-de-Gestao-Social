-- =====================================================================
-- Lar Harmonia — Políticas de segurança (RLS) revisadas
-- =====================================================================
-- O que este script faz:
--   1. Remove TODAS as políticas atuais de assistidos, profiles e voluntarios.
--      (No Postgres, políticas permissivas se somam com OR: uma política
--       "true" anulava as restrições das outras.)
--   2. Cria a função papel_atual(): devolve o papel (role) do usuário logado
--      SOMENTE se ele tiver um registro ATIVO em profiles. Quem criou conta
--      sozinho pelo signup não tem perfil criado pelo admin => papel nulo
--      => nenhum acesso.
--   3. Recria as políticas:
--        assistidos : ler/cadastrar = equipe ativa
--                     editar        = admin e servico_social
--                     excluir       = admin
--        voluntarios: ler/cadastrar/editar = equipe ativa | excluir = admin
--        profiles   : ler = o próprio perfil ou equipe ativa
--                     criar/editar/excluir = somente admin
--                     (ninguém consegue alterar o próprio cargo)
--      Nada é liberado para o papel "anon" (visitante sem login).
--
-- ANTES DE RODAR, confira que seu usuário admin está correto
-- (senão você pode se trancar para fora):
--
--   select id, email, role, status, cargo from public.profiles
--   where role = 'admin';
--
-- Efeito colateral conhecido até o código ser ajustado:
--   - login por "nome de usuário" (sem @) deixa de funcionar, porque a tela
--     de login lia a tabela profiles sem estar logada. Login por e-mail e o
--     atalho "visitante" continuam funcionando.
-- =====================================================================

begin;

-- 1) Papel do usuário logado, apenas se ativo -------------------------
-- Retorna texto (e não o enum user_role) para funcionar tanto em bancos
-- onde profiles.role é enum quanto onde é texto. O drop ... cascade
-- remove também as políticas que dependem da função; todas são
-- recriadas logo abaixo, então o script pode ser rodado de novo.
drop function if exists public.papel_atual() cascade;

create function public.papel_atual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role::text
  from public.profiles p
  where p.id = auth.uid()
    and coalesce(p.status::text, 'ativo') <> 'inativo'
    and coalesce(p.cargo, '') <> 'Inativo'
$$;

revoke all on function public.papel_atual() from public;
grant execute on function public.papel_atual() to authenticated;

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
