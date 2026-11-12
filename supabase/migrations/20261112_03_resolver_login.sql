-- =====================================================================
-- ETAPA 3 — Login por nome de usuário sem expor a tabela profiles
-- =====================================================================
-- Depois das etapas 1 e 2, a tabela profiles não pode mais ser lida por
-- quem não fez login. Esta função permite o login digitando o nome em vez
-- do e-mail, devolvendo SOMENTE o e-mail e apenas quando houver uma única
-- correspondência EXATA com:
--   - o prefixo do e-mail (ex.: "maria.silva" para maria.silva@...), ou
--   - o nome completo cadastrado (sem diferenciar maiúsculas e acentos).
-- Não devolve cargo, status nem lista de pessoas.
-- =====================================================================

create or replace function public.resolver_login(identificador text)
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  alvo text;
  resultado text;
  total int;
begin
  alvo := lower(translate(trim(coalesce(identificador, '')),
    'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç',
    'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'));
  if length(alvo) < 3 then
    return null;
  end if;

  select count(*), min(u.email::text) into total, resultado
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(split_part(u.email, '@', 1)) in (alvo, replace(alvo, ' ', '.'), replace(alvo, ' ', ''))
     or lower(translate(trim(coalesce(p.nome, '')),
          'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç',
          'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc')) = alvo;

  if total = 1 then
    return resultado;
  end if;
  return null;
end;
$$;

revoke all on function public.resolver_login(text) from public;
grant execute on function public.resolver_login(text) to anon, authenticated;
