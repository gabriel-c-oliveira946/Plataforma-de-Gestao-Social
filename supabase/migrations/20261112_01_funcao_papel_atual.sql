-- =====================================================================
-- Lar Harmonia — Políticas de segurança (RLS) revisadas
-- =====================================================================
-- ETAPA 1 de 2 — rode este arquivo e, em seguida, 20261112_02_politicas_rls.sql
--
-- O que os dois scripts fazem:
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
--   select u.email, p.role, p.status, p.cargo
--   from auth.users u left join public.profiles p on p.id = u.id;
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
-- recriadas na etapa 2.
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

commit;

-- Conferência: deve retornar uma linha com valor vazio (null), sem erro:
--   select public.papel_atual();
