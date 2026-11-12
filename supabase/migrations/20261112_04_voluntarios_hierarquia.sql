-- =====================================================================
-- ETAPA 4 — Voluntários seguem a mesma hierarquia das fichas
-- =====================================================================
--   ver e cadastrar : toda a equipe ativa (inclui Recepção)
--   editar          : Diretoria (admin) e Serviço Social
--   excluir         : somente Diretoria
-- (Na etapa 2, a edição de voluntários estava liberada também para a
--  Recepção. Este script corrige isso.)
-- =====================================================================

do $$
begin
  if to_regclass('public.voluntarios') is null then
    raise notice 'Tabela public.voluntarios não existe; nada a fazer.';
    return;
  end if;

  execute 'drop policy if exists voluntarios_update on public.voluntarios';
  execute $p$create policy voluntarios_update on public.voluntarios
    for update to authenticated
    using (public.papel_atual() in ('admin', 'servico_social'))
    with check (public.papel_atual() in ('admin', 'servico_social'))$p$;
end $$;
