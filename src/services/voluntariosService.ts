import { supabase } from '../lib/supabase/client';
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

export const voluntariosService = {
  // 1. Buscar todos os voluntários (com fallback Supabase -> localStorage)
  async getAll(): Promise<Voluntario[]> {
    try {
      const hasUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
      if (hasUrl) {
        const { data, error } = await supabase
          .from('voluntarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          saveStoredVoluntarios(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Supabase não acessível para voluntários, usando cache local:', err);
    }
    return getStoredVoluntarios();
  },

  // 2. Inserir novo voluntário
  async insert(item: Record<string, any>): Promise<Voluntario> {
    const isProvidedIdValid = isValidUUID(item.id);
    const generatedId = generateUUID();
    const newId = isProvidedIdValid ? item.id : generatedId;
    const nowIso = new Date().toISOString();

    const fullRecord: Voluntario = {
      ...(item as Voluntario),
      id: newId,
      status: item.status || 'ativo',
      created_at: item.created_at || nowIso,
      updated_at: item.updated_at || nowIso,
      nome_completo: item.nome_completo || ''
    };

    const hasUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
    if (hasUrl) {
      const supabasePayload: Record<string, any> = { ...fullRecord };
      if (!isProvidedIdValid) {
        delete supabasePayload.id;
      }

      const { data, error } = await supabase.from('voluntarios').insert([supabasePayload]).select();
      if (!error && data && data[0]) {
        const current = getStoredVoluntarios();
        saveStoredVoluntarios([data[0], ...current.filter((v) => v.id !== data[0].id)]);
        return data[0];
      } else if (error) {
        console.warn('Alerta Supabase ao inserir voluntário (utilizando fallback local):', error.message);
      }
    }

    const current = getStoredVoluntarios();
    const updated = [fullRecord, ...current.filter((v) => v.id !== fullRecord.id)];
    saveStoredVoluntarios(updated);
    return fullRecord;
  },

  // 3. Atualizar voluntário existente
  async update(id: string, updates: Record<string, any>): Promise<Voluntario> {
    const nowIso = new Date().toISOString();
    let updatedRecord: Voluntario | null = null;

    try {
      const hasUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
      if (hasUrl && isValidUUID(id)) {
        const { data, error } = await supabase
          .from('voluntarios')
          .update({ ...updates, updated_at: nowIso })
          .eq('id', id)
          .select();

        if (!error && data && data[0]) {
          updatedRecord = data[0];
        }
      }
    } catch (err) {
      console.warn('Supabase indisponível no update de voluntário, atualizando localmente:', err);
    }

    const current = getStoredVoluntarios();
    const existing = current.find((v) => v.id === id);
    if (!updatedRecord) {
      updatedRecord = {
        ...(existing || ({} as Voluntario)),
        ...updates,
        id,
        updated_at: nowIso
      } as Voluntario;
    }

    const newStore = current.map((v) => (v.id === id ? updatedRecord! : v));
    saveStoredVoluntarios(newStore);
    return updatedRecord;
  },

  // 4. Excluir voluntário
  async delete(id: string): Promise<void> {
    const hasUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
    if (hasUrl && isValidUUID(id)) {
      try {
        await supabase.from('voluntarios').delete().eq('id', id);
      } catch (err) {
        console.warn('Erro ao excluir no Supabase:', err);
      }
    }

    const current = getStoredVoluntarios();
    saveStoredVoluntarios(current.filter((v) => v.id !== id));
  }
};
