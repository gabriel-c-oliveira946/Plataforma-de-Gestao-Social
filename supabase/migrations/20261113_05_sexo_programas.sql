-- =====================================================================
-- ETAPA 5 — Sexo e programas da família (Quadro Resumo)
-- =====================================================================
-- O Quadro Resumo (prestação de contas ao Ministério Público e ao
-- Conselho Municipal) conta as pessoas por faixa etária, sexo e programa.
-- Este script cria as colunas que guardam essas informações:
--   sexo       : sexo da pessoa de referência ('Feminino' / 'Masculino')
--   programas  : programas da FLH em que a família está inserida
--                (Famílias Assistidas, Integração ao M. do Trabalho,
--                 Creche, Gestantes)
-- O sexo e a data de nascimento de cada membro da família ficam dentro
-- de membros_familia (JSON), que também é garantida aqui.
-- Pode ser rodado mais de uma vez sem problema. Rode no projeto oficial
-- e no projeto demo.
-- =====================================================================

alter table public.assistidos add column if not exists sexo text;
alter table public.assistidos add column if not exists programas text[] not null default '{}';
alter table public.assistidos add column if not exists membros_familia jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'assistidos_sexo_valido') then
    alter table public.assistidos
      add constraint assistidos_sexo_valido check (sexo is null or sexo in ('Feminino', 'Masculino'));
  end if;
end $$;

-- Projeto demo: a cópia usada pelo reset diário precisa das mesmas colunas
do $$
begin
  if to_regclass('demo_seed.assistidos') is not null then
    alter table demo_seed.assistidos add column if not exists sexo text;
    alter table demo_seed.assistidos add column if not exists programas text[] not null default '{}';
    alter table demo_seed.assistidos add column if not exists membros_familia jsonb not null default '[]'::jsonb;
  end if;
end $$;

-- Atualiza o cache de colunas da API (evita o erro "Could not find the column")
notify pgrst, 'reload schema';
