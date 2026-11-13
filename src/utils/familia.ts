import type { MembroFamilia } from '../types/cadastro';

/**
 * Regras compartilhadas sobre o núcleo familiar: sexo, idade dos membros e
 * programas da Fundação. Usadas pelo cadastro, pela ficha, pelo Quadro
 * Resumo e pela exportação, para que todos contem as pessoas do mesmo jeito.
 */

export type Sexo = 'Feminino' | 'Masculino';
export const SEXOS: Sexo[] = ['Feminino', 'Masculino'];

/** Programas da FLH, com os mesmos nomes das abas da planilha de Cadastro de Famílias. */
export const PROGRAMAS_FLH = [
  'Famílias Assistidas',
  'Integração ao M. do Trabalho',
  'Creche',
  'Gestantes'
] as const;
export type ProgramaFLH = (typeof PROGRAMAS_FLH)[number];

export function normalizarSexo(valor?: unknown): Sexo | null {
  const s = String(valor ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s === 'f' || s.startsWith('fem') || s === 'mulher') return 'Feminino';
  if (s === 'm' || s.startsWith('masc') || s === 'homem') return 'Masculino';
  return null;
}

export function normalizarProgramas(valor?: unknown): ProgramaFLH[] {
  const lista = Array.isArray(valor)
    ? valor
    : typeof valor === 'string' && valor.trim()
    ? valor.replace(/^\{|\}$/g, '').split(',')
    : [];
  const out: ProgramaFLH[] = [];
  for (const item of lista) {
    const t = String(item).replace(/"/g, '').trim().toLowerCase();
    const p = PROGRAMAS_FLH.find((x) => x.toLowerCase() === t);
    if (p && !out.includes(p)) out.push(p);
  }
  return out;
}

/** Converte "AAAA-MM-DD" ou "DD/MM/AAAA" em Date (meio-dia local, sem fuso). */
export function lerData(valor?: string | null): Date | null {
  const v = (valor || '').trim();
  let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12);
  return null;
}

export function idadeEm(nascimento: Date, referencia: Date): number {
  let idade = referencia.getFullYear() - nascimento.getFullYear();
  const m = referencia.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && referencia.getDate() < nascimento.getDate())) idade--;
  return idade;
}

/**
 * Idade a partir de uma data de nascimento e/ou de uma idade informada.
 * Retorna null quando não há informação (nunca inventa uma idade).
 */
export function calcularIdade(
  dataNascimento?: string | null,
  idadeInformada?: number | string | null,
  referencia: Date = new Date()
): number | null {
  const nasc = lerData(dataNascimento);
  if (nasc) {
    const idade = idadeEm(nasc, referencia);
    if (idade >= 0 && idade < 130) return idade;
  }
  if (idadeInformada !== undefined && idadeInformada !== null && String(idadeInformada).trim() !== '') {
    const n = parseInt(String(idadeInformada), 10);
    if (!isNaN(n) && n >= 0 && n < 130) return n;
  }
  return null;
}

/**
 * Idade de um membro da família. O campo `data_nasc_idade` guarda a data de
 * nascimento (AAAA-MM-DD); cadastros antigos podem ter texto livre como
 * "10 anos" ou "15/03/2014", que também são aceitos.
 */
export function idadeDoMembro(valor?: string | null, referencia: Date = new Date()): number | null {
  const v = (valor || '').trim();
  if (!v) return null;
  if (lerData(v)) return calcularIdade(v, null, referencia);
  const m = v.match(/^(\d{1,3})\s*(anos?)?$/i);
  return m ? calcularIdade(null, m[1], referencia) : null;
}

/** Texto amigável para exibir o nascimento/idade de um membro. */
export function descreverNascimentoMembro(valor?: string | null): string {
  const v = (valor || '').trim();
  if (!v) return 'Não informada';
  const nasc = lerData(v);
  if (nasc) {
    const idade = idadeDoMembro(v);
    const data = nasc.toLocaleDateString('pt-BR');
    return idade === null ? data : `${data} (${idade} ${idade === 1 ? 'ano' : 'anos'})`;
  }
  return v;
}

export interface PessoaDaFamilia {
  nome: string;
  papel: 'titular' | 'membro';
  sexo: Sexo | null;
  idade: number | null;
}

/** Todas as pessoas do núcleo familiar: a pessoa de referência e os membros cadastrados. */
export function pessoasDaFamilia(
  assistido: {
    nome_completo?: string | null;
    sexo?: unknown;
    data_nascimento?: string | null;
    idade?: number | string | null;
    membros_familia?: MembroFamilia[] | null;
  },
  referencia: Date = new Date()
): PessoaDaFamilia[] {
  const pessoas: PessoaDaFamilia[] = [
    {
      nome: assistido.nome_completo || 'Pessoa de referência',
      papel: 'titular',
      sexo: normalizarSexo(assistido.sexo),
      idade: calcularIdade(assistido.data_nascimento, assistido.idade, referencia)
    }
  ];
  for (const m of assistido.membros_familia || []) {
    pessoas.push({
      nome: m.nome_membro || 'Membro sem nome',
      papel: 'membro',
      sexo: normalizarSexo(m.sexo),
      idade: idadeDoMembro(m.data_nasc_idade, referencia)
    });
  }
  return pessoas;
}

/**
 * Autorização de uso de imagem: 'Sim', 'Não' ou '' (não informado).
 * O valor fica gravado em `expectativa_curso` ("Autorização de Imagem: ...");
 * nunca se presume "Sim" quando a resposta não foi registrada.
 */
export function autorizacaoImagem(a: {
  autoriza_imagem?: unknown;
  expectativa_curso?: string | null;
}): 'Sim' | 'Não' | '' {
  const v = a.autoriza_imagem;
  if (v === true || v === 'Sim') return 'Sim';
  if (v === false || v === 'Não') return 'Não';
  const m = (a.expectativa_curso || '').match(/(?:Autoriza[çc][ãa]o de Imagem|Uso de Imagem):\s*([^|]+)/i);
  const t = m?.[1]?.trim().toLowerCase() || '';
  if (!t || t.includes('informad')) return '';
  return t.startsWith('n') ? 'Não' : 'Sim';
}

export function rotuloAutorizacaoImagem(valor: 'Sim' | 'Não' | ''): string {
  return valor === 'Sim' ? 'Autorizado' : valor === 'Não' ? 'Não autorizado' : 'Não informado';
}

/**
 * Campos exigidos para que a família entre corretamente no Quadro Resumo.
 * Retorna a primeira pendência (com a aba do formulário onde corrigir) ou null.
 */
export function pendenciaQuadroResumo(form: {
  sexo?: string;
  programas?: string[];
  autoriza_imagem?: string;
  membros_familia?: MembroFamilia[];
}): { aba: number; mensagem: string } | null {
  if (!normalizarSexo(form.sexo)) {
    return { aba: 1, mensagem: 'Informe o sexo da pessoa de referência (Aba 1).' };
  }
  if (normalizarProgramas(form.programas).length === 0) {
    return { aba: 1, mensagem: 'Marque ao menos um programa da FLH em que a família está inserida (Aba 1).' };
  }
  if (form.autoriza_imagem !== 'Sim' && form.autoriza_imagem !== 'Não') {
    return { aba: 1, mensagem: 'Registre a autorização de uso de imagem: Sim ou Não (Aba 1).' };
  }
  const incompletos = (form.membros_familia || [])
    .filter((m) => !normalizarSexo(m.sexo) || idadeDoMembro(m.data_nasc_idade) === null)
    .map((m) => m.nome_membro || 'membro sem nome');
  if (incompletos.length > 0) {
    return {
      aba: 3,
      mensagem: `Complete o sexo e a data de nascimento de: ${incompletos.join(', ')} (Aba 3, Composição Familiar).`
    };
  }
  return null;
}
