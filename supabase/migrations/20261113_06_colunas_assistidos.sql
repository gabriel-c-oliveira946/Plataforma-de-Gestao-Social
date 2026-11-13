-- =====================================================================
-- ETAPA 6 — Garante todas as colunas que o sistema grava em assistidos
-- =====================================================================
-- O banco foi criado com uma versão anterior do formulário e algumas
-- colunas usadas pelo cadastro não existem (ex.: quantidade_filhos),
-- o que causa o erro "Could not find the '...' column of 'assistidos'".
-- Este script cria SOMENTE as colunas que faltam; as existentes e os
-- dados não são alterados. Pode ser rodado mais de uma vez.
-- Rode no projeto oficial e no projeto demo.
-- =====================================================================

do $$
declare
  c record;
  alvo text;
begin
  for c in
    select * from (values
      -- Aba 1 — Identificação
      ('nome_completo', 'text'),
      ('rg', 'text'),
      ('cpf', 'text'),
      ('data_nascimento', 'date'),
      ('idade', 'integer'),
      ('raca_cor', 'text'),
      ('telefone', 'text'),
      ('endereco', 'text'),
      ('bairro', 'text'),
      ('escolaridade', 'text'),
      ('estado_civil', 'text'),
      ('possui_cadastro_flh', 'boolean'),
      ('possui_cras', 'boolean'),
      ('bairro_cras', 'text'),
      ('data_ingresso', 'date'),
      ('foto_url', 'text'),
      ('sexo', 'text'),
      ('programas', 'text[] not null default ''{}'''),
      -- Aba 2 — Trabalho e renda
      ('atividade_remunerada', 'text'),
      ('profissao', 'text'),
      ('renda_familiar_aproximada', 'numeric'),
      ('beneficios_sociais', 'text[]'),
      -- Aba 3 — Moradia e família
      ('composicao_familiar', 'integer'),
      ('quantidade_filhos', 'integer'),
      ('membros_familia', 'jsonb not null default ''[]''::jsonb'),
      ('acesso_internet', 'text'),
      ('tipo_moradia', 'text'),
      ('servicos_basicos_regulares', 'boolean'),
      -- Aba 4 — Vulnerabilidades e saúde
      ('dificuldades_enfrentadas', 'text[]'),
      ('rede_apoio', 'text'),
      ('fatores_risco_evasao', 'text[]'),
      ('possui_deficiencia', 'boolean'),
      ('tipos_deficiencia', 'text[]'),
      ('doencas_cronicas_familia', 'text[]'),
      ('servicos_acompanhamento', 'text[]'),
      -- Aba 5 — Motivações, acompanhamento e avaliações
      ('motivo_busca', 'text'),
      ('expectativa_curso', 'text'),
      ('objetivo_profissional_3_meses', 'text'),
      ('curso_pretendido', 'text'),
      ('cursos_anteriores', 'text[]'),
      ('status_curso', 'text'),
      -- Auditoria
      ('created_at', 'timestamptz not null default now()'),
      ('updated_at', 'timestamptz default now()'),
      ('criado_por', 'uuid'),
      ('atualizado_por', 'uuid')
    ) as t(coluna, tipo)
  loop
    foreach alvo in array array['public.assistidos', 'demo_seed.assistidos'] loop
      if to_regclass(alvo) is not null and not exists (
        select 1 from information_schema.columns
        where table_schema || '.' || table_name = alvo and column_name = c.coluna
      ) then
        execute format('alter table %s add column %I %s', alvo, c.coluna, c.tipo);
        raise notice 'Coluna criada: %.%', alvo, c.coluna;
      end if;
    end loop;
  end loop;
end $$;

-- Atualiza o cache de colunas da API
notify pgrst, 'reload schema';

-- Conferência (opcional): lista colunas e tipos da tabela
-- select column_name, data_type from information_schema.columns
-- where table_schema = 'public' and table_name = 'assistidos' order by ordinal_position;
