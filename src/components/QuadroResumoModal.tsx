import { useMemo, useState } from 'react';
import { Assistido } from './VerFichaModal';
import { X, Printer, Download, FileSpreadsheet, Users, Home, AlertTriangle, Info, Calendar } from 'lucide-react';
import {
  FAIXAS_QUADRO,
  SEM_PROGRAMA,
  calcularQuadroResumo,
  colunasVisiveis,
  rotuloLinha
} from '../utils/quadroResumo';
import { lerData } from '../utils/familia';

interface QuadroResumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistidos: Assistido[];
}

/**
 * Idade a partir da data de nascimento (YYYY-MM-DD). Usada pelo filtro de
 * faixa etária do painel de assistidos.
 */
export function calculateExactAge(dataNascimento?: string | null, idadeFallback?: number | string | null): number {
  if (dataNascimento && dataNascimento.trim()) {
    try {
      const birthDate = new Date(dataNascimento.trim());
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age >= 0 && age < 130) return age;
      }
    } catch {
      // fallback abaixo
    }
  }

  if (idadeFallback !== undefined && idadeFallback !== null) {
    const num = typeof idadeFallback === 'number' ? idadeFallback : parseInt(String(idadeFallback), 10);
    if (!isNaN(num) && num >= 0 && num < 130) return num;
  }

  // Idade média de adulto assistido como fallback quando não informada
  return 38;
}

const isAtivo = (a: Assistido) => {
  const st = (a.status_curso || 'Ativo').toLowerCase();
  return st.includes('ativo') || st.includes('acompanhamento') || !st;
};

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function QuadroResumoModal({ isOpen, onClose, assistidos }: QuadroResumoModalProps) {
  const [escopo, setEscopo] = useState<'ativos' | 'todos'>('ativos');
  const [dataReferencia, setDataReferencia] = useState<string>(hojeISO);

  const familias = useMemo(
    () => (escopo === 'todos' ? assistidos : assistidos.filter(isAtivo)),
    [assistidos, escopo]
  );
  const referencia = lerData(dataReferencia) || new Date();
  const quadro = useMemo(
    () => calcularQuadroResumo(familias as any[], referencia),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [familias, dataReferencia]
  );
  const colunas = colunasVisiveis(quadro);
  const dataRefBR = referencia.toLocaleDateString('pt-BR');

  if (!isOpen) return null;

  const handlePrint = () => window.print();

  // Exportação para Excel (CSV com BOM UTF-8 e separador ";"), no layout da aba RESUMO
  const handleExportCSV = () => {
    const cel = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const linhasCsv: string[] = [];
    linhasCsv.push(cel('FUNDAÇÃO LAR HARMONIA'));
    linhasCsv.push(cel('CADASTRO DE FAMÍLIAS - QUADRO RESUMO'));
    linhasCsv.push(`${cel('Idade calculada em')};${cel(dataRefBR)}`);
    linhasCsv.push(`${cel('Escopo')};${cel(escopo === 'ativos' ? 'Famílias ativas' : 'Todas as famílias cadastradas')}`);
    linhasCsv.push(`${cel('Emitido em')};${cel(new Date().toLocaleString('pt-BR'))}`);
    linhasCsv.push('');
    linhasCsv.push([cel('Faixa etária'), ...colunas.map(cel), cel('Total de pessoas')].join(';'));
    for (const l of quadro.linhas) {
      linhasCsv.push([cel(rotuloLinha(l)), ...colunas.map((c) => l.porColuna[c]), l.total].join(';'));
    }
    if (quadro.pessoasNaoClassificadas > 0) {
      linhasCsv.push(
        [
          cel('Sexo ou idade não informados'),
          ...colunas.map((c) => quadro.naoClassificadasPorColuna[c]),
          quadro.pessoasNaoClassificadas
        ].join(';')
      );
    }
    linhasCsv.push([cel('Total geral de pessoas'), ...colunas.map((c) => quadro.totalPorColuna[c]), quadro.totalPessoas].join(';'));
    linhasCsv.push([cel('Número de famílias'), ...colunas.map((c) => quadro.familiasPorColuna[c]), quadro.totalFamilias].join(';'));
    linhasCsv.push('');
    linhasCsv.push(cel('Conta a pessoa de referência e todos os membros cadastrados na Composição Familiar.'));
    if (quadro.familiasEmMaisDeUmPrograma > 0) {
      linhasCsv.push(
        cel(
          `${quadro.familiasEmMaisDeUmPrograma} família(s) participam de mais de um programa: aparecem em cada coluna, mas o Total conta cada pessoa uma vez.`
        )
      );
    }

    const blob = new Blob(['﻿' + linhasCsv.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quadro_Resumo_FLH_${dataReferencia}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const thBase = 'py-2.5 px-3 text-center font-bold';
  const tdNum = 'py-2 px-3 text-center tabular-nums';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 no-print-backdrop">
      {/* Impressão A4 limpa: só a área do quadro aparece no papel */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .no-print, .no-print-backdrop > .no-print { display: none !important; }
          #quadro-resumo-print-area, #quadro-resumo-print-area * { visibility: visible !important; }
          #quadro-resumo-print-area {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 100% !important; max-height: none !important; overflow: visible !important;
            margin: 0 !important; padding: 0 !important; background: #fff !important; color: #000 !important;
            box-shadow: none !important; border: none !important; border-radius: 0 !important;
          }
          #quadro-resumo-print-area .quadro-scroll { overflow: visible !important; max-height: none !important; }
          @page { size: A4 portrait; margin: 12mm; }
          .print-header { display: block !important; margin-bottom: 10px !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 9.5pt !important; }
          th, td { border: 1px solid #64748b !important; padding: 4px 6px !important; color: #000 !important; background: #fff !important; }
          thead th { background: #e2e8f0 !important; }
          .total-row td { background: #e2e8f0 !important; font-weight: bold !important; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      <div
        id="quadro-resumo-print-area"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Cabeçalho (tela) */}
        <div className="relative p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight font-heading">
                Quadro Resumo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pessoas por faixa etária e sexo em cada programa (formato da aba RESUMO)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute sm:static top-3 right-3 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Fechar"
            aria-label="Fechar Quadro Resumo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controles (tela) */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs no-print">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 font-semibold">
            <button
              type="button"
              onClick={() => setEscopo('ativos')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                escopo === 'ativos' ? 'bg-emerald-700 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Famílias ativas ({assistidos.filter(isAtivo).length})
            </button>
            <button
              type="button"
              onClick={() => setEscopo('todos')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                escopo === 'todos' ? 'bg-emerald-700 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todas ({assistidos.length})
            </button>
          </div>
          <label className="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            Idade calculada em
            <input
              type="date"
              value={dataReferencia}
              onChange={(e) => setDataReferencia(e.target.value || hojeISO())}
              className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </label>
        </div>

        <div className="quadro-scroll p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Cabeçalho da impressão */}
          <div className="hidden print-header">
            <p className="text-sm font-bold">FUNDAÇÃO LAR HARMONIA</p>
            <p className="text-sm font-bold">CADASTRO DE FAMÍLIAS — QUADRO RESUMO</p>
            <p className="text-[10pt]">
              Idade calculada em {dataRefBR} • {escopo === 'ativos' ? 'Famílias ativas' : 'Todas as famílias cadastradas'} •
              Emitido em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Indicadores (tela) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <span>Pessoas</span>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-emerald-950 dark:text-emerald-100 tabular-nums">{quadro.totalPessoas}</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <span>Famílias</span>
                <Home className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold tabular-nums">{quadro.totalFamilias}</p>
            </div>
            <div className="col-span-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Famílias por programa
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {colunas.map((c) => (
                  <div key={c} className="flex justify-between gap-2">
                    <span className={c === SEM_PROGRAMA ? 'text-amber-700 dark:text-amber-400' : ''}>{c}</span>
                    <span className="font-bold tabular-nums">{quadro.familiasPorColuna[c]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pendências de cadastro (tela) */}
          {(quadro.familiasComPendencia.length > 0 || quadro.usaColunaSemPrograma) && (
            <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-1.5 no-print">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Cadastros incompletos afetam o quadro
              </p>
              {quadro.usaColunaSemPrograma && (
                <p>
                  {quadro.familiasPorColuna[SEM_PROGRAMA]} família(s) sem programa definido aparecem na coluna
                  "{SEM_PROGRAMA}". Edite a ficha (Aba 1) e marque o programa.
                </p>
              )}
              {quadro.familiasComPendencia.length > 0 && (
                <p>
                  {quadro.pessoasNaoClassificadas} pessoa(s) sem sexo ou data de nascimento ficaram na linha "Sexo ou idade
                  não informados". Fichas para completar:{' '}
                  {quadro.familiasComPendencia
                    .slice(0, 12)
                    .map((f) => f.nome)
                    .join(', ')}
                  {quadro.familiasComPendencia.length > 12 ? ` e mais ${quadro.familiasComPendencia.length - 12}` : ''}.
                </p>
              )}
            </div>
          )}

          {/* Tabela oficial */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-emerald-800 dark:bg-slate-800 text-white text-[11px] uppercase tracking-wide">
                    <th className="py-2.5 px-3 text-left font-bold min-w-[150px]">Faixa etária</th>
                    {colunas.map((c) => (
                      <th key={c} className={`${thBase} min-w-[90px]`}>
                        {c}
                      </th>
                    ))}
                    <th className={`${thBase} bg-emerald-950 dark:bg-slate-950 min-w-[80px]`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {FAIXAS_QUADRO.map((f) =>
                    quadro.linhas
                      .filter((l) => l.faixa.key === f.key)
                      .map((l) => (
                        <tr
                          key={rotuloLinha(l)}
                          className={l.sexo === 'Feminino' ? 'border-b-2 border-slate-200 dark:border-slate-700' : ''}
                        >
                          <td className="py-2 px-3 font-semibold">{rotuloLinha(l)}</td>
                          {colunas.map((c) => (
                            <td key={c} className={tdNum}>
                              {l.porColuna[c]}
                            </td>
                          ))}
                          <td className={`${tdNum} font-bold bg-slate-50 dark:bg-slate-800/60`}>{l.total}</td>
                        </tr>
                      ))
                  )}
                  {quadro.pessoasNaoClassificadas > 0 && (
                    <tr className="text-amber-800 dark:text-amber-300">
                      <td className="py-2 px-3 font-semibold">Sexo ou idade não informados</td>
                      {colunas.map((c) => (
                        <td key={c} className={tdNum}>
                          {quadro.naoClassificadasPorColuna[c]}
                        </td>
                      ))}
                      <td className={`${tdNum} font-bold`}>{quadro.pessoasNaoClassificadas}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="total-row bg-emerald-800 dark:bg-slate-950 text-white font-bold">
                    <td className="py-2.5 px-3">Total geral de pessoas</td>
                    {colunas.map((c) => (
                      <td key={c} className={tdNum}>
                        {quadro.totalPorColuna[c]}
                      </td>
                    ))}
                    <td className={`${tdNum} text-amber-300`}>{quadro.totalPessoas}</td>
                  </tr>
                  <tr className="total-row bg-emerald-50 dark:bg-slate-900 text-emerald-950 dark:text-slate-200 font-bold">
                    <td className="py-2 px-3">Número de famílias</td>
                    {colunas.map((c) => (
                      <td key={c} className={tdNum}>
                        {quadro.familiasPorColuna[c]}
                      </td>
                    ))}
                    <td className={tdNum}>{quadro.totalFamilias}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Metodologia (aparece também na impressão) */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 space-y-1 text-[11px] leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 no-print" />
              Como o quadro é calculado
            </p>
            <p>
              Conta a pessoa de referência e todos os membros cadastrados na Composição Familiar, pela idade em {dataRefBR}{' '}
              e pelo sexo registrado na ficha. Cada coluna soma as pessoas das famílias inscritas naquele programa.
            </p>
            {quadro.familiasEmMaisDeUmPrograma > 0 && (
              <p>
                {quadro.familiasEmMaisDeUmPrograma} família(s) participam de mais de um programa: aparecem em cada coluna,
                mas o Total conta cada pessoa uma única vez.
              </p>
            )}
          </div>
        </div>

        {/* Ações (tela) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2.5 no-print">
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            title="Baixar planilha para abrir no Excel"
          >
            <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Exportar para Excel</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            title="Imprimir em A4 ou salvar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir (A4 / PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
