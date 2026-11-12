import { MembroFamilia } from '../../types/cadastro';

export interface Avaliacao4MesesParsed {
  data_avaliacao: string;
  status_final_curso: 'Concluiu Oficina' | 'Desistiu (Evasão)' | 'Continua em Acompanhamento';
  motivo_evasao?: string;
  impacto_gerado:
    | 'Conseguiu Emprego'
    | 'Abriu Pequeno Negócio'
    | 'Aumentou Renda em Casa'
    | 'Sem Alteração Renda'
    | 'Outro';
  mudanca_autonomia_qualidade_vida: string;
}

// Interface Assistido
export interface Assistido {
  id: string;
  nome_completo: string;
  rg?: string | null;
  cpf?: string | null;
  cartao_sus?: string | null;
  autoriza_imagem?: 'Sim' | 'Não' | boolean | string | null;
  data_nascimento?: string | null;
  idade?: number | null;
  raca_cor?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  escolaridade?: string | null;
  estado_civil?: string | null;
  possui_cadastro_flh?: boolean | null;
  possui_cras?: boolean | null;
  bairro_cras?: string | null;
  composicao_familiar?: number | null;
  quantidade_filhos?: number | null;
  membros_familia?: MembroFamilia[] | null;
  atividade_remunerada?: string | null;
  profissao?: string | null;
  acesso_internet?: string | null;
  renda_familiar_aproximada?: number | null;
  beneficios_sociais?: string[] | null;
  tipo_moradia?: string | null;
  servicos_basicos_regulares?: boolean | null;
  dificuldades_enfrentadas?: string[] | null;
  rede_apoio?: string | null;
  fatores_risco_evasao?: string[] | null;
  possui_deficiencia?: boolean | null;
  tipos_deficiencia?: string[] | null;
  doencas_cronicas_familia?: string[] | string | null;
  servicos_acompanhamento?: string[] | null;
  motivo_busca?: string | null;
  expectativa_curso?: string | null;
  objetivo_profissional_3_meses?: string | null;
  curso_pretendido?: string | null;
  cursos_anteriores?: string[] | string | null;
  status_curso?: string | null;
  data_ingresso?: string | null;
  foto_url?: string | null;
  created_at?: string | null;
  criado_por?: string | null;
  atualizado_por?: string | null;
  updated_at?: string | null;
}
