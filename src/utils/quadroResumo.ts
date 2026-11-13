import type { MembroFamilia } from '../types/cadastro';
import { PROGRAMAS_FLH, ProgramaFLH, Sexo, normalizarProgramas, pessoasDaFamilia } from './familia';

/**
 * Cálculo do Quadro Resumo no mesmo formato da aba "RESUMO" da planilha de
 * Cadastro de Famílias da FLH: pessoas por faixa etária e sexo, cruzadas com
 * os programas da Fundação.
 *
 * Regras:
 * - Conta TODAS as pessoas da família: a pessoa de referência e cada membro
 *   cadastrado na Composição Familiar (como a planilha faz).
 * - A coluna de cada programa conta as pessoas das famílias inscritas nele.
 *   Uma família em mais de um programa aparece em cada coluna, mas o "Total"
 *   conta cada pessoa uma única vez.
 * - Nada é deduzido: pessoa sem sexo ou sem idade fica em "não informado".
 */

export interface FaixaQuadro {
  key: string;
  label: string;
  min: number;
  max: number;
}

export const FAIXAS_QUADRO: FaixaQuadro[] = [
  { key: '0_6', label: '0 a 6 anos', min: 0, max: 6 },
  { key: '7_11', label: '7 a 11 anos', min: 7, max: 11 },
  { key: '12_17', label: '12 a 17 anos', min: 12, max: 17 },
  { key: '18_29', label: '18 a 29 anos', min: 18, max: 29 },
  { key: '30_59', label: '30 a 59 anos', min: 30, max: 59 },
  { key: '60_mais', label: '60 anos ou mais', min: 60, max: 200 }
];

export const SEM_PROGRAMA = 'Sem programa definido';
export type ColunaQuadro = ProgramaFLH | typeof SEM_PROGRAMA;

export interface LinhaQuadro {
  faixa: FaixaQuadro;
  sexo: Sexo;
  porColuna: Record<ColunaQuadro, number>;
  total: number;
}

export interface FamiliaComPendencia {
  nome: string;
  pessoasSemSexo: number;
  pessoasSemIdade: number;
}

export interface QuadroResumo {
  linhas: LinhaQuadro[];
  totalPorColuna: Record<ColunaQuadro, number>;
  totalPessoas: number;
  familiasPorColuna: Record<ColunaQuadro, number>;
  totalFamilias: number;
  familiasEmMaisDeUmPrograma: number;
  pessoasNaoClassificadas: number; // sem sexo ou sem idade: fora da tabela por faixa
  naoClassificadasPorColuna: Record<ColunaQuadro, number>;
  familiasComPendencia: FamiliaComPendencia[];
  usaColunaSemPrograma: boolean;
}

interface AssistidoQuadro {
  nome_completo?: string | null;
  sexo?: unknown;
  data_nascimento?: string | null;
  idade?: number | string | null;
  membros_familia?: MembroFamilia[] | null;
  programas?: unknown;
}

const COLUNAS: ColunaQuadro[] = [...PROGRAMAS_FLH, SEM_PROGRAMA];
const zeros = (): Record<ColunaQuadro, number> =>
  Object.fromEntries(COLUNAS.map((c) => [c, 0])) as Record<ColunaQuadro, number>;

export function calcularQuadroResumo(assistidos: AssistidoQuadro[], referencia: Date = new Date()): QuadroResumo {
  const linhas: LinhaQuadro[] = [];
  for (const faixa of FAIXAS_QUADRO) {
    for (const sexo of ['Masculino', 'Feminino'] as Sexo[]) {
      linhas.push({ faixa, sexo, porColuna: zeros(), total: 0 });
    }
  }
  const totalPorColuna = zeros();
  const familiasPorColuna = zeros();
  const naoClassificadasPorColuna = zeros();
  let totalPessoas = 0;
  let pessoasNaoClassificadas = 0;
  let familiasEmMaisDeUmPrograma = 0;
  const familiasComPendencia: FamiliaComPendencia[] = [];

  for (const a of assistidos) {
    const programas = normalizarProgramas(a.programas);
    const colunas: ColunaQuadro[] = programas.length > 0 ? programas : [SEM_PROGRAMA];
    if (programas.length > 1) familiasEmMaisDeUmPrograma++;
    colunas.forEach((c) => familiasPorColuna[c]++);

    let semSexo = 0;
    let semIdade = 0;
    for (const p of pessoasDaFamilia(a, referencia)) {
      totalPessoas++;
      colunas.forEach((c) => totalPorColuna[c]++);
      if (!p.sexo) semSexo++;
      if (p.idade === null) semIdade++;
      const faixa = p.idade === null ? undefined : FAIXAS_QUADRO.find((f) => p.idade! >= f.min && p.idade! <= f.max);
      if (!p.sexo || !faixa) {
        pessoasNaoClassificadas++;
        colunas.forEach((c) => naoClassificadasPorColuna[c]++);
        continue;
      }
      const linha = linhas.find((l) => l.faixa.key === faixa.key && l.sexo === p.sexo)!;
      linha.total++;
      colunas.forEach((c) => linha.porColuna[c]++);
    }
    if (semSexo || semIdade) {
      familiasComPendencia.push({ nome: a.nome_completo || 'Sem nome', pessoasSemSexo: semSexo, pessoasSemIdade: semIdade });
    }
  }

  return {
    linhas,
    totalPorColuna,
    totalPessoas,
    familiasPorColuna,
    totalFamilias: assistidos.length,
    familiasEmMaisDeUmPrograma,
    pessoasNaoClassificadas,
    naoClassificadasPorColuna,
    familiasComPendencia,
    usaColunaSemPrograma: familiasPorColuna[SEM_PROGRAMA] > 0
  };
}

/** Rótulo da linha no formato da planilha, ex.: "0 a 6 anos (M)". */
export function rotuloLinha(l: LinhaQuadro): string {
  return `${l.faixa.label} (${l.sexo === 'Masculino' ? 'M' : 'F'})`;
}

export function colunasVisiveis(q: QuadroResumo): ColunaQuadro[] {
  return q.usaColunaSemPrograma ? COLUNAS : [...PROGRAMAS_FLH];
}
