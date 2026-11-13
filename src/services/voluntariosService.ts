import { supabase, MODO_LOCAL } from '../lib/supabase/client';
import { Voluntario } from '../types/voluntario';

const LOCAL_STORAGE_KEY = 'lar_harmonia_voluntarios_store';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isValidUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Dados iniciais representativos e realistas da Fundação Lar Harmonia
export const INITIAL_VOLUNTARIOS: Voluntario[] = [
  {
    id: 'vol-001',
    nome_completo: 'Dra. Elena Vasconcelos de Souza',
    profissao_formacao: 'Enfermeira e Educadora em Saúde',
    cpf: '321.654.987-10',
    rg: '14.589.632-11',
    data_nascimento: '1982-06-15',
    telefone: '(71) 3344-5566',
    celular: '(71) 99876-5432',
    email: 'elena.souza@larharmonia.org',
    endereco: 'Avenida Professor Magalhães Neto, 1500, Pituba, Salvador - BA',
    projeto_atividade: 'Ambulatório de Saúde FLH',
    dias_semana: ['Ter', 'Qui'],
    turno_horario: 'Manhã',
    data_admissao: '2024-02-10',
    habilidades: ['Enfermagem', 'Oratória', 'Psicologia'],
    observacoes: 'Responsável pela triagem de saúde dos assistidos e palestras de higiene preventiva.',
    status: 'ativo',
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'vol-002',
    nome_completo: 'Cláudio Roberto Mota',
    profissao_formacao: 'Analista de Sistemas / Desenvolvedor',
    cpf: '654.987.321-45',
    rg: '25.698.741-22',
    data_nascimento: '1990-11-20',
    telefone: '(71) 3232-1100',
    celular: '(71) 99123-8899',
    email: 'claudio.mota@email.com',
    endereco: 'Rua das Hortênsias, 320, Itaigara, Salvador - BA',
    projeto_atividade: 'Oficina de Informática e Inclusão Digital',
    dias_semana: ['Seg', 'Qua', 'Sex'],
    turno_horario: 'Tarde',
    data_admissao: '2024-05-18',
    habilidades: ['Informática', 'Oratória', 'Administração / Recepção'],
    observacoes: 'Ministra aulas práticas de navegação, planilhas e digitação para turmas de jovens e adultos.',
    status: 'ativo',
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'vol-003',
    nome_completo: 'Luciana Maria Galvão',
    profissao_formacao: 'Estilista e Artesã Tradicional',
    cpf: '987.123.456-78',
    rg: '36.985.214-33',
    data_nascimento: '1975-03-08',
    telefone: '(71) 3456-7890',
    celular: '(71) 98877-6655',
    email: 'luciana.galvao@arte.com.br',
    endereco: 'Rua do Cururupe, 45, Itapuã, Salvador - BA',
    projeto_atividade: 'Oficina de Costura e Modelagem Criativa',
    dias_semana: ['Ter', 'Qua', 'Qui'],
    turno_horario: 'Integral',
    data_admissao: '2023-09-01',
    habilidades: ['Corte e Costura', 'Artes Manuais', 'Crochê', 'Papelaria'],
    observacoes: 'Orienta confecção de peças sustentáveis e peças do Bazar Solidário da Fundação.',
    status: 'ativo',
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'vol-004',
    nome_completo: 'Dr. Paulo Ricardo Siqueira',
    profissao_formacao: 'Cirurgião-Dentista',
    cpf: '456.123.789-99',
    rg: '18.963.254-88',
    data_nascimento: '1987-09-29',
    telefone: '(71) 3111-2233',
    celular: '(71) 99444-5566',
    email: 'paulo.siqueira@odonto.com',
    endereco: 'Rua Almirante Barroso, 88, Rio Vermelho, Salvador - BA',
    projeto_atividade: 'Ambulatório de Saúde FLH',
    dias_semana: ['Sáb'],
    turno_horario: 'Manhã',
    data_admissao: '2025-01-15',
    habilidades: ['Odontologia', 'Recreação Infantil'],
    observacoes: 'Realiza mutirões de aplicação de flúor e atendimento odontológico preventivo.',
    status: 'ativo',
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function getStoredVoluntarios(): Voluntario[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao ler voluntários do localStorage:', err);
  }
  // Se não existir, salva as sementes iniciais
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_VOLUNTARIOS));
  } catch {}
  return INITIAL_VOLUNTARIOS;
}

function saveStoredVoluntarios(items: Voluntario[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Erro ao salvar no localStorage de voluntários:', err);
  }
}

function erroSupabase(acao: string, error: { message?: string } | null): Error {
  console.error(`Erro ao ${acao} no Supabase:`, error);
  return new Error(error?.message || `Não foi possível ${acao}. Verifique sua conexão e tente novamente.`);
}

/**
 * Com o Supabase configurado, todas as operações vão direto ao banco e
 * qualquer falha é repassada para a tela. O armazenamento local (com dados
 * de exemplo) é usado apenas em MODO_LOCAL (desenvolvimento).
 */
export const voluntariosService = {
  // 1. Buscar todos os voluntários
  async getAll(): Promise<Voluntario[]> {
    if (MODO_LOCAL) return getStoredVoluntarios();

    const { data, error } = await supabase
      .from('voluntarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw erroSupabase('carregar os voluntários', error);
    return data || [];
  },

  // 1b. Resumo leve para cruzar pessoas por CPF
  async listarResumos(): Promise<
    { id: string; nome_completo: string; cpf?: string | null; data_nascimento?: string | null; telefone?: string | null; celular?: string | null; email?: string | null; endereco?: string | null }[]
  > {
    if (MODO_LOCAL) return getStoredVoluntarios();
    const { data, error } = await supabase
      .from('voluntarios')
      .select('id, nome_completo, cpf, data_nascimento, telefone, celular, email, endereco');
    if (error) throw erroSupabase('consultar os voluntários', error);
    return data || [];
  },

  // 2. Inserir novo voluntário
  async insert(item: Record<string, any>): Promise<Voluntario> {
    const isProvidedIdValid = isValidUUID(item.id);
    const nowIso = new Date().toISOString();

    const fullRecord: Voluntario = {
      ...(item as Voluntario),
      id: isProvidedIdValid ? item.id : generateUUID(),
      status: item.status || 'ativo',
      created_at: item.created_at || nowIso,
      updated_at: item.updated_at || nowIso,
      nome_completo: item.nome_completo || ''
    };

    if (MODO_LOCAL) {
      const current = getStoredVoluntarios();
      saveStoredVoluntarios([fullRecord, ...current.filter((v) => v.id !== fullRecord.id)]);
      return fullRecord;
    }

    const supabasePayload: Record<string, any> = { ...fullRecord };
    if (!isProvidedIdValid) delete supabasePayload.id;

    const { data, error } = await supabase.from('voluntarios').insert([supabasePayload]).select();
    if (error) throw erroSupabase('cadastrar o voluntário', error);
    if (!data || !data[0]) {
      throw new Error('O cadastro não foi confirmado pelo banco de dados. Verifique se sua conta tem permissão.');
    }
    return data[0];
  },

  // 3. Atualizar voluntário existente
  async update(id: string, updates: Record<string, any>): Promise<Voluntario> {
    const nowIso = new Date().toISOString();

    if (MODO_LOCAL) {
      const current = getStoredVoluntarios();
      const existing = current.find((v) => v.id === id);
      const updatedRecord = {
        ...(existing || ({} as Voluntario)),
        ...updates,
        id,
        updated_at: nowIso
      } as Voluntario;
      saveStoredVoluntarios(current.map((v) => (v.id === id ? updatedRecord : v)));
      return updatedRecord;
    }

    const { data, error } = await supabase
      .from('voluntarios')
      .update({ ...updates, updated_at: nowIso })
      .eq('id', id)
      .select();

    if (error) throw erroSupabase('salvar o voluntário', error);
    if (!data || !data[0]) {
      throw new Error('As alterações não foram salvas: seu perfil não tem permissão para editar este voluntário.');
    }
    return data[0];
  },

  // 4. Excluir voluntário
  async delete(id: string): Promise<void> {
    if (MODO_LOCAL) {
      saveStoredVoluntarios(getStoredVoluntarios().filter((v) => v.id !== id));
      return;
    }

    const { data, error } = await supabase.from('voluntarios').delete().eq('id', id).select('id');
    if (error) throw erroSupabase('excluir o voluntário', error);
    if (!data || data.length === 0) {
      throw new Error('O voluntário não foi excluído: apenas a Diretoria pode excluir voluntários.');
    }
  }
};
