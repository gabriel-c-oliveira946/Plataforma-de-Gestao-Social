-- =====================================================================
-- SOMENTE PARA O PROJETO DEMO — tabela de voluntários com dados fictícios
-- =====================================================================
-- Rode DEPOIS de protecao_demo.sql. Este script:
--   1. cria a tabela public.voluntarios (se não existir);
--   2. aplica as mesmas regras de acesso do projeto oficial;
--   3. insere os voluntários fictícios (se a tabela estiver vazia);
--   4. atualiza a cópia usada pelo reset diário da demo.
-- Todos os nomes, CPFs e RGs abaixo são fictícios.
-- =====================================================================

begin;

create table if not exists public.voluntarios (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  profissao_formacao text,
  cpf text,
  rg text,
  data_nascimento text,
  telefone text,
  celular text,
  email text,
  endereco text,
  projeto_atividade text,
  dias_semana text[],
  turno_horario text,
  data_admissao text,
  habilidades text[],
  observacoes text,
  status text default 'ativo',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  criado_por text,
  atualizado_por text
);

alter table public.voluntarios enable row level security;

drop policy if exists voluntarios_select on public.voluntarios;
drop policy if exists voluntarios_insert on public.voluntarios;
drop policy if exists voluntarios_update on public.voluntarios;
drop policy if exists voluntarios_delete on public.voluntarios;

create policy voluntarios_select on public.voluntarios
  for select to authenticated using (public.papel_atual() is not null);
create policy voluntarios_insert on public.voluntarios
  for insert to authenticated with check (public.papel_atual() is not null);
create policy voluntarios_update on public.voluntarios
  for update to authenticated
  using (public.papel_atual() in ('admin', 'servico_social'))
  with check (public.papel_atual() in ('admin', 'servico_social'));
create policy voluntarios_delete on public.voluntarios
  for delete to authenticated using (public.papel_atual() = 'admin');

-- Dados fictícios (somente se a tabela estiver vazia)
do $seed$
begin
  if exists (select 1 from public.voluntarios) then
    raise notice 'Tabela já possui voluntários; dados fictícios não inseridos.';
    return;
  end if;
  insert into public.voluntarios (nome_completo, profissao_formacao, cpf, rg, data_nascimento, telefone, celular, email, endereco, projeto_atividade, dias_semana, turno_horario, data_admissao, habilidades, observacoes, status) values
    ('Dra. Elena Vasconcelos de Souza', 'Enfermeira e Educadora em Saúde', '321.654.987-10', '14.589.632-11', '1982-06-15', '(71) 3344-5566', '(71) 99876-5432', 'elena.souza@larharmonia.org', 'Avenida Professor Magalhães Neto, 1500, Pituba, Salvador - BA', 'Ambulatório de Saúde FLH', array['Ter', 'Qui']::text[], 'Manhã', '2024-02-10', array['Enfermagem', 'Oratória', 'Psicologia']::text[], 'Responsável pela triagem de saúde dos assistidos e palestras de higiene preventiva.', 'ativo'),
    ('Cláudio Roberto Mota', 'Analista de Sistemas / Desenvolvedor', '654.987.321-45', '25.698.741-22', '1990-11-20', '(71) 3232-1100', '(71) 99123-8899', 'claudio.mota@email.com', 'Rua das Hortênsias, 320, Itaigara, Salvador - BA', 'Oficina de Informática e Inclusão Digital', array['Seg', 'Qua', 'Sex']::text[], 'Tarde', '2024-05-18', array['Informática', 'Oratória', 'Administração / Recepção']::text[], 'Ministra aulas práticas de navegação, planilhas e digitação para turmas de jovens e adultos.', 'ativo'),
    ('Luciana Maria Galvão', 'Estilista e Artesã Tradicional', '987.123.456-78', '36.985.214-33', '1975-03-08', '(71) 3456-7890', '(71) 98877-6655', 'luciana.galvao@arte.com.br', 'Rua do Cururupe, 45, Itapuã, Salvador - BA', 'Oficina de Costura e Modelagem Criativa', array['Ter', 'Qua', 'Qui']::text[], 'Integral', '2023-09-01', array['Corte e Costura', 'Artes Manuais', 'Crochê', 'Papelaria']::text[], 'Orienta confecção de peças sustentáveis e peças do Bazar Solidário da Fundação.', 'ativo'),
    ('Dr. Paulo Ricardo Siqueira', 'Cirurgião-Dentista', '456.123.789-99', '18.963.254-88', '1987-09-29', '(71) 3111-2233', '(71) 99444-5566', 'paulo.siqueira@odonto.com', 'Rua Almirante Barroso, 88, Rio Vermelho, Salvador - BA', 'Ambulatório de Saúde FLH', array['Sáb']::text[], 'Manhã', '2025-01-15', array['Odontologia', 'Recreação Infantil']::text[], 'Realiza mutirões de aplicação de flúor e atendimento odontológico preventivo.', 'ativo');
end $seed$;

-- Atualiza a cópia usada pelo reset diário (demo_seed.restaurar)
drop table if exists demo_seed.voluntarios;
create table demo_seed.voluntarios as table public.voluntarios;
alter table demo_seed.voluntarios enable row level security;

commit;
