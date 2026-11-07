export interface Voluntario {
  id: string;
  nome_completo: string;
  profissao_formacao?: string | null;
  cpf?: string | null;
  rg?: string | null;
  data_nascimento?: string | null;
  telefone?: string | null;
  celular?: string | null;
  email?: string | null;
  endereco?: string | null;

  projeto_atividade?: string | null;
  dias_semana?: string[] | null;
  turno_horario?: string | null;
  data_admissao?: string | null;

  habilidades?: string[] | null;
  observacoes?: string | null;
  status?: 'ativo' | 'inativo' | string | null;

  created_at?: string | null;
  updated_at?: string | null;
  criado_por?: string | null;
  atualizado_por?: string | null;
}

export const HABILIDADES_PREDEFINIDAS = [
  'Artes Manuais',
  'Crochê',
  'Culinária',
  'Papelaria',
  'Corte e Costura',
  'Informática',
  'Oratória',
  'Enfermagem',
  'Psicologia',
  'Barbearia / Cabeleireiro',
  'Recreação Infantil',
  'Odontologia',
  'Reforço Escolar',
  'Música / Canto',
  'Administração / Recepção'
] as const;

export const PROJETOS_PREDEFINIDOS = [
  'Oficina de Costura e Modelagem',
  'Oficina de Informática e Inclusão Digital',
  'Ambulatório de Saúde FLH',
  'Atendimento e Apoio Psicológico',
  'Cozinha Comunitária e Confeitaria',
  'Bazar Solidário e Artesanato',
  'Recreação e Reforço Escolar Infantil',
  'Acolhimento e Apoio Administrativo'
] as const;

export const DIAS_SEMANA_SIGLAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

export const TURNOS_VOLUNTARIO = ['Manhã', 'Tarde', 'Noite', 'Integral', 'Flexível'] as const;
