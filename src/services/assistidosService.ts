import { supabase, MODO_LOCAL } from '../lib/supabase/client';
import { autorizacaoImagem } from '../utils/familia';
import { Assistido } from '../components/VerFichaModal';

const LOCAL_STORAGE_KEY = 'lar_harmonia_assistidos_store';

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
export const INITIAL_ASSISTIDOS: Assistido[] = [
  {
    id: 'ass-001',
    nome_completo: 'Maria Aparecida Santos de Jesus',
    sexo: 'Feminino',
    programas: ['Famílias Assistidas', 'Creche'],
    rg: '12.345.678-90',
    cpf: '123.456.789-01',
    data_nascimento: '1985-04-12',
    idade: 41,
    raca_cor: 'Parda',
    telefone: '(71) 98765-4321',
    endereco: 'Rua das Mangueiras, 45, Casa B',
    bairro: 'Pituaçu',
    escolaridade: 'Ensino Fundamental Incompleto',
    estado_civil: 'Solteira',
    possui_cadastro_flh: true,
    possui_cras: true,
    bairro_cras: 'CRAS Boca do Rio',
    composicao_familiar: 4,
    quantidade_filhos: 3,
    membros_familia: [
      {
        id: 'mem-001-1',
        nome_membro: 'Lucas Santos',
        data_nasc_idade: '2016-03-14',
        sexo: 'Masculino',
        vinculo: 'Filho(a)',
        projeto_oficina: 'Crescer Preciso'
      },
      {
        id: 'mem-001-2',
        nome_membro: 'Mariana Santos',
        data_nasc_idade: '2012-07-02',
        sexo: 'Feminino',
        vinculo: 'Filho(a)',
        projeto_oficina: 'Balé'
      },
      {
        id: 'mem-001-3',
        nome_membro: 'Pedro Henrique Santos',
        data_nasc_idade: '2020-01-25',
        sexo: 'Masculino',
        vinculo: 'Filho(a)',
        projeto_oficina: 'Capoeira'
      }
    ],
    atividade_remunerada: 'Sim',
    profissao: 'Diarista autônoma (3x por semana)',
    acesso_internet: 'Sim, dados móveis no celular',
    tipo_moradia: 'Alugada',
    servicos_basicos_regulares: true,
    dificuldades_enfrentadas: ['Instabilidade de renda'],
    rede_apoio: 'Igreja / Vizinhos',
    fatores_risco_evasao: ['Nenhum'],
    possui_deficiencia: false,
    tipos_deficiencia: ['Nenhuma'],
    doencas_cronicas_familia: ['Hipertensão'],
    servicos_acompanhamento: ['Ambulatório', 'Psicologia'],
    beneficios_sociais: ['Bolsa Família'],
    renda_familiar_aproximada: 1350,
    motivo_busca: 'Capacitação profissional para geração de renda própria e autonomia financeira',
    expectativa_curso: 'Aprender técnicas de modelagem e costura para abrir pequeno ateliê em casa',
    objetivo_profissional_3_meses: 'Comprar máquina de costura e aceitar encomendas no bairro',
    curso_pretendido: 'Costura e Modelagem Criativa',
    cursos_anteriores: ['Não participou de cursos anteriores'],
    status_curso: 'Ativo / Em Acompanhamento',
    data_ingresso: new Date(Date.now() - 135 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 135 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ass-002',
    nome_completo: 'Carlos Eduardo Oliveira dos Santos',
    sexo: 'Masculino',
    programas: ['Integração ao M. do Trabalho'],
    rg: '23.456.789-01',
    cpf: '234.567.890-12',
    data_nascimento: '1998-08-23',
    idade: 27,
    raca_cor: 'Preta',
    telefone: '(71) 99123-4567',
    endereco: 'Travessa Santa Luzia, 12',
    bairro: 'Bairro da Paz',
    escolaridade: 'Ensino Médio Completo',
    estado_civil: 'Solteiro',
    possui_cadastro_flh: false,
    possui_cras: false,
    bairro_cras: null,
    composicao_familiar: 3,
    quantidade_filhos: 0,
    atividade_remunerada: 'Não',
    profissao: 'Desempregado',
    acesso_internet: 'Sim, banda larga residencial',
    tipo_moradia: 'Própria',
    servicos_basicos_regulares: true,
    dificuldades_enfrentadas: ['Desemprego'],
    rede_apoio: 'Família',
    fatores_risco_evasao: ['Transporte'],
    possui_deficiencia: false,
    tipos_deficiencia: ['Nenhuma'],
    doencas_cronicas_familia: ['Nenhuma condição registrada'],
    servicos_acompanhamento: ['SAC'],
    beneficios_sociais: ['Nenhum'],
    renda_familiar_aproximada: 800,
    motivo_busca: 'Inserção no mercado formal de trabalho através de tecnologia',
    expectativa_curso: 'Dominar ferramentas de informática, planilhas e atendimento ao cliente',
    objetivo_profissional_3_meses: 'Conseguir vaga de jovem aprendiz ou assistente administrativo',
    curso_pretendido: 'Informática Básica e Administrativa',
    cursos_anteriores: ['Não participou de cursos anteriores'],
    status_curso: 'Ativo / Em Acompanhamento',
    data_ingresso: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ass-003',
    nome_completo: 'Francisca Pereira de Lima',
    sexo: 'Feminino',
    programas: ['Famílias Assistidas'],
    rg: '34.567.890-12',
    cpf: '345.678.901-23',
    data_nascimento: '1979-11-05',
    idade: 46,
    raca_cor: 'Parda',
    telefone: '(71) 98888-7766',
    endereco: 'Avenida São Jorge, 102',
    bairro: 'São Cristóvão',
    escolaridade: 'Ensino Fundamental Completo',
    estado_civil: 'Casada',
    possui_cadastro_flh: true,
    possui_cras: true,
    bairro_cras: 'CRAS Itapuã',
    composicao_familiar: 5,
    quantidade_filhos: 3,
    membros_familia: [
      {
        id: 'mem-003-1',
        nome_membro: 'Kauã Pereira de Lima',
        data_nasc_idade: '2014-05-09',
        sexo: 'Masculino',
        vinculo: 'Filho(a)',
        projeto_oficina: 'Informática'
      },
      {
        id: 'mem-003-2',
        nome_membro: 'Beatriz Pereira de Lima',
        data_nasc_idade: '2018-02-11',
        sexo: 'Feminino',
        vinculo: 'Filho(a)',
        projeto_oficina: 'Capoeira'
      },
      {
        id: 'mem-003-3',
        nome_membro: 'Matheus Pereira de Lima',
        data_nasc_idade: '2021-06-30',
        sexo: 'Masculino',
        vinculo: 'Filho(a)',
        projeto_oficina: 'Crescer Preciso'
      },
      {
        id: 'mem-003-4',
        nome_membro: 'José Roberto de Lima',
        data_nasc_idade: '1976-04-03',
        sexo: 'Masculino',
        vinculo: 'Cônjuge',
        projeto_oficina: 'Nenhuma / Não Participa'
      }
    ],
    atividade_remunerada: 'Sim',
    profissao: 'Vendedora de bolos caseiros',
    acesso_internet: 'Sim, Wi-Fi comunitário',
    tipo_moradia: 'Cedida',
    servicos_basicos_regulares: true,
    dificuldades_enfrentadas: ['Cuidado com dependentes'],
    rede_apoio: 'Família e Vizinhos',
    fatores_risco_evasao: ['Nenhum'],
    possui_deficiencia: false,
    tipos_deficiencia: ['Nenhuma'],
    doencas_cronicas_familia: ['Diabetes tipo 2'],
    servicos_acompanhamento: ['Ambulatório', 'Programas Sociais'],
    beneficios_sociais: ['Bolsa Família'],
    renda_familiar_aproximada: 1900,
    motivo_busca: 'Aperfeiçoamento na área de panificação e confeitaria',
    expectativa_curso: 'Aprender técnicas profissionais de massas e decoração para aumentar vendas | [Avaliação 4 Meses - 2026-08-15] Status: Concluiu Oficina | Impacto: Aumentou Renda em Casa | Depoimento: Conseguiu triplicar as encomendas de doces e salgados para festas no bairro.',
    objetivo_profissional_3_meses: 'Formalizar como MEI e criar catálogo digital',
    curso_pretendido: 'Confeitaria e Panificação Artesanal',
    cursos_anteriores: ['Confeitaria Básica'],
    status_curso: 'Concluído',
    data_ingresso: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ass-004',
    nome_completo: 'Antônio Marcos Ferreira',
    sexo: 'Masculino',
    programas: ['Integração ao M. do Trabalho'],
    rg: '45.678.901-23',
    cpf: '456.789.012-34',
    data_nascimento: '1992-02-18',
    idade: 34,
    raca_cor: 'Preta',
    telefone: '(71) 99444-3322',
    endereco: 'Rua da Paz, 88',
    bairro: 'Itapuã',
    escolaridade: 'Ensino Médio Incompleto',
    estado_civil: 'Divorciado',
    possui_cadastro_flh: true,
    possui_cras: false,
    bairro_cras: null,
    composicao_familiar: 2,
    quantidade_filhos: 1,
    atividade_remunerada: 'Sim',
    profissao: 'Ajudante geral',
    acesso_internet: 'Sim, dados móveis',
    tipo_moradia: 'Alugada',
    servicos_basicos_regulares: true,
    dificuldades_enfrentadas: ['Instabilidade financeira'],
    rede_apoio: 'Amigos',
    fatores_risco_evasao: ['Horário flexível'],
    possui_deficiencia: false,
    tipos_deficiencia: ['Nenhuma'],
    doencas_cronicas_familia: ['Nenhuma condição registrada'],
    servicos_acompanhamento: ['Psicologia'],
    beneficios_sociais: ['Nenhum'],
    renda_familiar_aproximada: 1100,
    motivo_busca: 'Aprender profissão de barbeiro para atuar profissionalmente',
    expectativa_curso: 'Adquirir prática em cortes modernos e atendimento ao cliente',
    objetivo_profissional_3_meses: 'Alugar cadeira em barbearia ou atender em domicílio',
    curso_pretendido: 'Barbearia e Corte Masculino',
    cursos_anteriores: ['Não participou de cursos anteriores'],
    status_curso: 'Ativo / Em Acompanhamento',
    data_ingresso: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ass-005',
    nome_completo: 'Luciana Barbosa da Silva',
    sexo: 'Feminino',
    programas: ['Gestantes'],
    rg: '56.789.012-34',
    cpf: '567.890.123-45',
    data_nascimento: '1990-09-14',
    idade: 35,
    raca_cor: 'Branca',
    telefone: '(71) 98111-2233',
    endereco: 'Rua Direta de Nova Brasília, 340',
    bairro: 'Nova Brasília',
    escolaridade: 'Ensino Médio Completo',
    estado_civil: 'Casada',
    possui_cadastro_flh: false,
    possui_cras: true,
    bairro_cras: 'CRAS Pau da Lima',
    composicao_familiar: 4,
    quantidade_filhos: 2,
    atividade_remunerada: 'Não',
    profissao: 'Dona de casa',
    acesso_internet: 'Sim, Wi-Fi',
    tipo_moradia: 'Própria',
    servicos_basicos_regulares: true,
    dificuldades_enfrentadas: ['Cuidados com a família'],
    rede_apoio: 'Família',
    fatores_risco_evasao: ['Nenhum'],
    possui_deficiencia: false,
    tipos_deficiencia: ['Nenhuma'],
    doencas_cronicas_familia: ['Nenhuma condição registrada'],
    servicos_acompanhamento: ['Jurídico', 'Ambulatório'],
    beneficios_sociais: ['Bolsa Família'],
    renda_familiar_aproximada: 2100,
    motivo_busca: 'Capacitação na área de cuidados e saúde preventiva',
    expectativa_curso: 'Tornar-se cuidadora de idosos profissional certificada',
    objetivo_profissional_3_meses: 'Conseguir contratação com carteira assinada ou plantões',
    curso_pretendido: 'Cuidador de Idosos e Primeiros Socorros',
    cursos_anteriores: ['Primeiros Socorros Básico'],
    status_curso: 'Ativo / Em Acompanhamento',
    data_ingresso: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function getStoredAssistidos(): Assistido[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          const normalized = normalizeAssistido(item);
          if (!normalized.membros_familia || normalized.membros_familia.length === 0) {
            const initial = INITIAL_ASSISTIDOS.find((init) => init.id === normalized.id);
            if (initial?.membros_familia && initial.membros_familia.length > 0) {
              normalized.membros_familia = initial.membros_familia;
            }
          }
          return normalized;
        });
      }
    }
  } catch (err) {
    console.warn('Erro ao ler localStorage de assistidos:', err);
  }
  const initialNormalized = INITIAL_ASSISTIDOS.map(normalizeAssistido);
  saveStoredAssistidos(initialNormalized);
  return initialNormalized;
}

function saveStoredAssistidos(items: Assistido[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Erro ao salvar no localStorage de assistidos:', err);
  }
}

/**
 * Reconstrói propriedades virtuais (cartao_sus, autoriza_imagem, em_situacao_rua) a partir da expectativa_curso
 * e tipo_moradia quando o PostgREST não as possui como colunas nativas no PostgreSQL do Supabase.
 */
export function normalizeAssistido(item: Assistido): Assistido {
  if (!item) return item;
  const result: Assistido = { ...item };

  if (!result.cartao_sus && result.expectativa_curso) {
    const match = result.expectativa_curso.match(/Cart[ãa]o SUS:\s*([^|]+)/i);
    if (match && match[1]?.trim()) {
      result.cartao_sus = match[1].trim();
    }
  }

  result.autoriza_imagem = autorizacaoImagem(result);

  if ((result as any).em_situacao_rua === undefined || (result as any).em_situacao_rua === null) {
    const tipoMor = (result.tipo_moradia || '').toLowerCase();
    const ender = (result.endereco || '').toLowerCase();
    (result as any).em_situacao_rua =
      tipoMor.includes('rua') || ender.includes('situação de rua') || ender.includes('situacao de rua');
  }

  if (!result.membros_familia || !Array.isArray(result.membros_familia) || result.membros_familia.length === 0) {
    if (result.expectativa_curso) {
      const match = result.expectativa_curso.match(/\[Membros da Fam[íi]lia:\s*(\[.*?\])\]/i);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            result.membros_familia = parsed;
          }
        } catch {
          // ignore json parse error
        }
      }
    }
  }

  return result;
}

/**
 * Sanitiza o payload antes de enviar ao Supabase para garantir compatibilidade estrita
 * com o esquema de colunas do PostgreSQL (ex: converte booleans e omite campos virtuais/customizados
 * que não são colunas diretas na tabela 'assistidos' do Supabase).
 */
function sanitizePayloadForSupabase(payload: Record<string, any>): Record<string, any> {
  const clean = { ...payload };

  // Garantir booleans para colunas reais da tabela assistidos
  if ('possui_cadastro_flh' in clean) {
    if (typeof clean.possui_cadastro_flh === 'string') {
      const val = clean.possui_cadastro_flh.trim().toLowerCase();
      clean.possui_cadastro_flh = val === 'sim' || val === 'true' || val === '1';
    } else {
      clean.possui_cadastro_flh = Boolean(clean.possui_cadastro_flh);
    }
  }

  if ('possui_cras' in clean) {
    if (typeof clean.possui_cras === 'string') {
      const val = clean.possui_cras.trim().toLowerCase();
      clean.possui_cras = val === 'sim' || val === 'true' || val === '1';
    } else {
      clean.possui_cras = Boolean(clean.possui_cras);
    }
  }

  if ('servicos_basicos_regulares' in clean) {
    if (typeof clean.servicos_basicos_regulares === 'string') {
      const val = clean.servicos_basicos_regulares.trim().toLowerCase();
      clean.servicos_basicos_regulares = val === 'sim' || val === 'true' || val === '1' || val === 'regular';
    } else {
      clean.servicos_basicos_regulares = Boolean(clean.servicos_basicos_regulares);
    }
  }

  if ('possui_deficiencia' in clean) {
    if (typeof clean.possui_deficiencia === 'string') {
      const val = clean.possui_deficiencia.trim().toLowerCase();
      clean.possui_deficiencia = val === 'sim' || val === 'true' || val === '1';
    } else {
      clean.possui_deficiencia = Boolean(clean.possui_deficiencia);
    }
  }

  // Omitir campos estendidos/virtuais que não existem como colunas diretas na tabela assistidos no Supabase
  // para evitar erro PGRST204 ("Could not find column in schema cache")
  delete clean.em_situacao_rua;
  delete clean.cartao_sus;
  delete clean.autoriza_imagem;

  return clean;
}

function erroSupabase(acao: string, error: { message?: string; code?: string } | null): Error {
  console.error(`Erro ao ${acao} no Supabase:`, error);
  const coluna = (error?.message || '').match(/Could not find the '([^']+)' column/)?.[1];
  if (error?.code === 'PGRST204' && coluna) {
    return new Error(
      `O banco de dados não tem a coluna "${coluna}". Rode o script supabase/migrations/20261113_06_colunas_assistidos.sql no SQL Editor do Supabase.`
    );
  }
  return new Error(error?.message || `Não foi possível ${acao}. Verifique sua conexão e tente novamente.`);
}

/**
 * Com o Supabase configurado, todas as operações vão direto ao banco e
 * qualquer falha é repassada para a tela (nada é salvo "só no navegador").
 * O armazenamento local é usado apenas em MODO_LOCAL (desenvolvimento).
 */
export const assistidosService = {
  // 1. Obter todos os assistidos
  async getAll(): Promise<Assistido[]> {
    if (MODO_LOCAL) return getStoredAssistidos();

    const { data, error } = await supabase
      .from('assistidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw erroSupabase('carregar os assistidos', error);
    return (data || []).map(normalizeAssistido);
  },

  // 2. Inserir novo assistido
  async insert(item: Record<string, any>): Promise<Assistido> {
    const isProvidedIdValid = isValidUUID(item.id);
    const nowIso = new Date().toISOString();
    const fullRecord: Assistido = normalizeAssistido({
      ...(item as Assistido),
      id: isProvidedIdValid ? item.id : generateUUID(),
      created_at: item.created_at || nowIso,
      updated_at: item.updated_at || nowIso,
      nome_completo: item.nome_completo || ''
    });

    if (MODO_LOCAL) {
      const current = getStoredAssistidos();
      saveStoredAssistidos([fullRecord, ...current.filter((a) => a.id !== fullRecord.id)]);
      return fullRecord;
    }

    // Cria o payload limpo e sanitizado para o Supabase. Sem UUID válido
    // fornecido, o PostgreSQL gera o id via gen_random_uuid().
    const supabasePayload: Record<string, any> = sanitizePayloadForSupabase(fullRecord);
    if (!isProvidedIdValid) delete supabasePayload.id;

    let { data, error } = await supabase.from('assistidos').insert([supabasePayload]).select();
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache')) && supabasePayload.membros_familia) {
      const fallbackPayload = { ...supabasePayload };
      delete fallbackPayload.membros_familia;
      const retry = await supabase.from('assistidos').insert([fallbackPayload]).select();
      data = retry.data;
      error = retry.error;
    }
    if (error) throw erroSupabase('registrar o assistido', error);
    if (!data || !data[0]) {
      throw new Error('O cadastro não foi confirmado pelo banco de dados. Verifique se sua conta tem permissão.');
    }
    return normalizeAssistido({ ...fullRecord, ...data[0] });
  },

  // 3. Atualizar assistido existente
  async update(id: string, updates: Record<string, any>): Promise<Assistido> {
    const nowIso = new Date().toISOString();

    if (MODO_LOCAL) {
      const current = getStoredAssistidos();
      const existing = current.find((a) => a.id === id);
      const updatedRecord = normalizeAssistido({
        ...(existing || ({} as Assistido)),
        ...updates,
        id,
        updated_at: nowIso
      } as Assistido);
      saveStoredAssistidos(current.map((a) => (a.id === id ? updatedRecord : a)));
      return updatedRecord;
    }

    const supabaseUpdates = sanitizePayloadForSupabase(updates);
    let { data, error } = await supabase
      .from('assistidos')
      .update({ ...supabaseUpdates, updated_at: nowIso })
      .eq('id', id)
      .select();

    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache')) && supabaseUpdates.membros_familia) {
      const fallbackUpdates = { ...supabaseUpdates };
      delete fallbackUpdates.membros_familia;
      const retry = await supabase
        .from('assistidos')
        .update({ ...fallbackUpdates, updated_at: nowIso })
        .eq('id', id)
        .select();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw erroSupabase('salvar as alterações', error);
    // Sem erro e sem linhas: o RLS recusou a edição (ex.: perfil Recepção)
    if (!data || !data[0]) {
      throw new Error('As alterações não foram salvas: seu perfil não tem permissão para editar esta ficha.');
    }
    return normalizeAssistido({ ...updates, ...data[0] });
  },

  // 4. Excluir assistido
  async delete(id: string): Promise<void> {
    if (MODO_LOCAL) {
      saveStoredAssistidos(getStoredAssistidos().filter((a) => a.id !== id));
      return;
    }

    const { data, error } = await supabase.from('assistidos').delete().eq('id', id).select('id');
    if (error) throw erroSupabase('excluir o assistido', error);
    if (!data || data.length === 0) {
      throw new Error('A ficha não foi excluída: apenas a Diretoria pode excluir assistidos.');
    }
  }
};
