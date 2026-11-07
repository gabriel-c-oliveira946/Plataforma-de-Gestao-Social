import React, { useState, useMemo } from 'react';
import { Assistido } from './VerFichaModal';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  Users,
  Briefcase,
  Baby,
  Heart,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface QuadroResumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistidos: Assistido[];
}

export interface FaixaEtariaDef {
  key: string;
  label: string;
  sublabel: string;
  minAge: number;
  maxAge: number;
}

export const FAIXAS_ETARIAS: FaixaEtariaDef[] = [
  { key: '0_6', label: '0 a 6 anos', sublabel: 'Crianças 1ª Infância', minAge: 0, maxAge: 6 },
  { key: '7_11', label: '7 a 11 anos', sublabel: 'Crianças 2ª Infância', minAge: 7, maxAge: 11 },
  { key: '12_17', label: '12 a 17 anos', sublabel: 'Adolescentes', minAge: 12, maxAge: 17 },
  { key: '18_29', label: '18 a 29 anos', sublabel: 'Jovens', minAge: 18, maxAge: 29 },
  { key: '30_59', label: '30 a 59 anos', sublabel: 'Adultos', minAge: 30, maxAge: 59 },
  { key: '60_plus', label: '60 anos ou mais', sublabel: 'Idosos', minAge: 60, maxAge: 150 }
];

export interface LinhaQuadroResumo {
  faixaKey: string;
  faixaLabel: string;
  faixaSublabel: string;
  sexo: 'Masculino' | 'Feminino';
  totalPessoas: number;
  imtCount: number;
  crecheCount: number;
  gestantesCount: number;
  totalLinha: number;
}

export interface SubtotalFaixa {
  faixaKey: string;
  faixaLabel: string;
  totalPessoas: number;
  imtCount: number;
  crecheCount: number;
  gestantesCount: number;
  totalLinha: number;
}

/**
 * Helper para calcular a idade exata a partir da data de nascimento (YYYY-MM-DD)
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

/**
 * Helper para inferir ou obter o sexo do assistido ('Masculino' | 'Feminino')
 */
export function getAssistidoSexo(assistido: any): 'Masculino' | 'Feminino' {
  if (assistido.sexo) {
    const s = String(assistido.sexo).trim().toLowerCase();
    if (s.startsWith('m') || s === 'homem' || s === 'masculino') return 'Masculino';
    if (s.startsWith('f') || s === 'mulher' || s === 'feminino') return 'Feminino';
  }

  if (assistido.estado_civil) {
    const ec = String(assistido.estado_civil).toLowerCase();
    if (ec.includes('solteira') || ec.includes('casada') || ec.includes('viúva') || ec.includes('divorciada')) {
      return 'Feminino';
    }
    if (ec.includes('solteiro') || ec.includes('casado') || ec.includes('viúvo') || ec.includes('divorciado')) {
      return 'Masculino';
    }
  }

  // Análise heurística pelo primeiro nome caso sexo não conste explicitamente
  const nome = (assistido.nome_completo || assistido.nome || '').trim();
  const primeiroNome = nome.split(' ')[0]?.toLowerCase() || '';

  if (primeiroNome.endsWith('a') || primeiroNome.endsWith('e') || ['maria', 'ana', 'patricia', 'juliana', 'camila', 'beatriz', 'raquel', 'carla', 'fernanda', 'luciana', 'vanessa'].includes(primeiroNome)) {
    return 'Feminino';
  }
  if (primeiroNome.endsWith('o') || ['carlos', 'joao', 'pedro', 'lucas', 'marcos', 'paulo', 'gabriel', 'bruno', 'diego', 'felipe', 'mateus', 'rafael'].includes(primeiroNome)) {
    return 'Masculino';
  }

  // Maioria dos titulares cadastrados na FLH é do sexo feminino
  return 'Feminino';
}

/**
 * Helper para verificar se o assistido se enquadra na Integração ao Mercado de Trabalho (IMT)
 */
export function isAssistidoIMT(item: Assistido): boolean {
  if (item.atividade_remunerada === 'Sim') return true;

  const oc = (item.profissao || '').toLowerCase();
  if (oc && !oc.includes('desempregad') && !oc.includes('nenhum') && !oc.includes('sem ocup')) {
    return true;
  }
  return false;
}

/**
 * Helper para verificar se a pessoa/família possui criança em creche
 */
export function isAssistidoCreche(item: Assistido, age: number): boolean {
  if (age > 11) return false;

  const rawStr = [
    item.curso_pretendido || '',
    item.motivo_busca || '',
    item.servicos_acompanhamento ? item.servicos_acompanhamento.join(' ') : '',
    item.dificuldades_enfrentadas ? item.dificuldades_enfrentadas.join(' ') : ''
  ].join(' ').toLowerCase();

  if (rawStr.includes('creche') || rawStr.includes('infantil') || rawStr.includes('criança')) {
    return true;
  }

  // Se for criança de 0 a 6 anos cadastrada como dependente/assistido, considerar em faixa de creche/pré-escola
  if (age <= 6) return true;

  return false;
}

/**
 * Helper para verificar se é gestante atendida
 */
export function isAssistidoGestante(item: Assistido, sexo: 'Masculino' | 'Feminino'): boolean {
  if (sexo !== 'Feminino') return false;

  const rawStr = [
    item.motivo_busca || '',
    item.doencas_cronicas_familia ? String(item.doencas_cronicas_familia) : '',
    item.dificuldades_enfrentadas ? item.dificuldades_enfrentadas.join(' ') : '',
    item.servicos_acompanhamento ? item.servicos_acompanhamento.join(' ') : ''
  ].join(' ').toLowerCase();

  if (rawStr.includes('gestant') || rawStr.includes('gravid') || rawStr.includes('pré-natal') || rawStr.includes('maternidade')) {
    return true;
  }

  return false;
}

export default function QuadroResumoModal({ isOpen, onClose, assistidos }: QuadroResumoModalProps) {
  const [filterStatusOnly, setFilterStatusOnly] = useState<'ativos' | 'todos'>('ativos');

  // Filtrar assistidos conforme status selecionado
  const assistidosFiltrados = useMemo(() => {
    if (filterStatusOnly === 'todos') return assistidos;
    return assistidos.filter((a) => {
      const st = (a.status_curso || 'Ativo').toLowerCase();
      return st.includes('ativo') || st.includes('acompanhamento') || !st;
    });
  }, [assistidos, filterStatusOnly]);

  // Cálculo de dados para a Tabela de Quadro Resumo
  const { linhas, subtotaisPorFaixa, totalGeral } = useMemo(() => {
    const matrix: Record<string, { Masculino: LinhaQuadroResumo; Feminino: LinhaQuadroResumo }> = {};

    FAIXAS_ETARIAS.forEach((f) => {
      matrix[f.key] = {
        Masculino: {
          faixaKey: f.key,
          faixaLabel: f.label,
          faixaSublabel: f.sublabel,
          sexo: 'Masculino',
          totalPessoas: 0,
          imtCount: 0,
          crecheCount: 0,
          gestantesCount: 0,
          totalLinha: 0
        },
        Feminino: {
          faixaKey: f.key,
          faixaLabel: f.label,
          faixaSublabel: f.sublabel,
          sexo: 'Feminino',
          totalPessoas: 0,
          imtCount: 0,
          crecheCount: 0,
          gestantesCount: 0,
          totalLinha: 0
        }
      };
    });

    assistidosFiltrados.forEach((item) => {
      const age = calculateExactAge(item.data_nascimento, item.idade);
      const sexo = getAssistidoSexo(item);
      const isIMT = isAssistidoIMT(item);
      const isCreche = isAssistidoCreche(item, age);
      const isGestante = isAssistidoGestante(item, sexo);

      // Encontrar faixa etária
      const faixa = FAIXAS_ETARIAS.find((f) => age >= f.minAge && age <= f.maxAge) || FAIXAS_ETARIAS[4]; // default 30-59

      const cell = matrix[faixa.key][sexo];
      cell.totalPessoas += 1;
      if (isIMT) cell.imtCount += 1;
      if (isCreche) cell.crecheCount += 1;
      if (isGestante) cell.gestantesCount += 1;
      cell.totalLinha = cell.totalPessoas + cell.imtCount + cell.crecheCount + cell.gestantesCount;
    });

    const linhasCalculadas: LinhaQuadroResumo[] = [];
    const subtotais: Record<string, SubtotalFaixa> = {};

    let gPessoas = 0;
    let gIMT = 0;
    let gCreche = 0;
    let gGestantes = 0;
    let gTotal = 0;

    FAIXAS_ETARIAS.forEach((f) => {
      const masc = matrix[f.key].Masculino;
      const fem = matrix[f.key].Feminino;

      linhasCalculadas.push(masc);
      linhasCalculadas.push(fem);

      const subPessoas = masc.totalPessoas + fem.totalPessoas;
      const subIMT = masc.imtCount + fem.imtCount;
      const subCreche = masc.crecheCount + fem.crecheCount;
      const subGestantes = masc.gestantesCount + fem.gestantesCount;
      const subTotal = masc.totalLinha + fem.totalLinha;

      subtotais[f.key] = {
        faixaKey: f.key,
        faixaLabel: f.label,
        totalPessoas: subPessoas,
        imtCount: subIMT,
        crecheCount: subCreche,
        gestantesCount: subGestantes,
        totalLinha: subTotal
      };

      gPessoas += subPessoas;
      gIMT += subIMT;
      gCreche += subCreche;
      gGestantes += subGestantes;
      gTotal += subTotal;
    });

    return {
      linhas: linhasCalculadas,
      subtotaisPorFaixa: subtotais,
      totalGeral: {
        totalPessoas: gPessoas,
        imtCount: gIMT,
        crecheCount: gCreche,
        gestantesCount: gGestantes,
        totalLinha: gTotal
      }
    };
  }, [assistidosFiltrados]);

  if (!isOpen) return null;

  // Ação 1: Impressão A4 / PDF via browser
  const handlePrint = () => {
    window.print();
  };

  // Ação 2: Exportação CSV formatado em UTF-8 com BOM (\uFEFF)
  const handleExportCSV = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Quadro_Resumo_Estatistico_FLH_${dateStr}.csv`;

    let csvContent = '\uFEFF'; // BOM UTF-8 para Excel reconhecer acentuação perfeitamente

    // Cabeçalho da Planilha Resumo
    csvContent += 'QUADRO RESUMO ESTATÍSTICO DA POPULAÇÃO ATENDIDA - FUNDAÇÃO LAR HARMONIA\n';
    csvContent += `Data de Geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n`;
    csvContent += `Escopo: ${filterStatusOnly === 'ativos' ? 'Apenas Assistidos Ativos' : 'Todos os Assistidos Cadastrados'}\n\n`;

    // Colunas da Tabela
    csvContent += 'Faixa Etária;Subcategoria;Sexo;Total de Pessoas Assistidas;Integração Mercado de Trabalho (IMT);Crianças na Creche;Gestantes Atendidas;Total Geral da Linha\n';

    FAIXAS_ETARIAS.forEach((f) => {
      const masc = linhas.find((l) => l.faixaKey === f.key && l.sexo === 'Masculino')!;
      const fem = linhas.find((l) => l.faixaKey === f.key && l.sexo === 'Feminino')!;
      const sub = subtotaisPorFaixa[f.key];

      csvContent += `"${f.label}";"${f.sublabel}";"Masculino";${masc.totalPessoas};${masc.imtCount};${masc.crecheCount};${masc.gestantesCount};${masc.totalLinha}\n`;
      csvContent += `"${f.label}";"${f.sublabel}";"Feminino";${fem.totalPessoas};${fem.imtCount};${fem.crecheCount};${fem.gestantesCount};${fem.totalLinha}\n`;
      csvContent += `"SUBTOTAL (${f.label})";"${f.sublabel}";"Ambos os Sexos";${sub.totalPessoas};${sub.imtCount};${sub.crecheCount};${sub.gestantesCount};${sub.totalLinha}\n\n`;
    });

    // Total Geral no Rodapé
    csvContent += `"TOTAL GERAL DA FUNDAÇÃO";"Todas as Faixas";"Ambos os Sexos";${totalGeral.totalPessoas};${totalGeral.imtCount};${totalGeral.crecheCount};${totalGeral.gestantesCount};${totalGeral.totalLinha}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 no-print-backdrop">
      {/* Estilos CSS específicos para Impressão limpa A4 sem cabeçalhos da Web */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print, .no-print-backdrop {
            display: none !important;
          }
          #quadro-resumo-print-area, #quadro-resumo-print-area * {
            visibility: visible !important;
          }
          #quadro-resumo-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          .print-header {
            display: block !important;
            margin-bottom: 12px !important;
            border-bottom: 2px solid #047857 !important;
            padding-bottom: 8px !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10pt !important;
          }
          th, td {
            border: 1px solid #94a3b8 !important;
            padding: 6px 8px !important;
          }
          th {
            background-color: #ecfdf5 !important;
            color: #064e3b !important;
            font-weight: bold !important;
          }
          .subtotal-row {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
          }
          .total-row {
            background-color: #d1fae5 !important;
            font-weight: bold !important;
          }
        }
      `}</style>

      {/* Conteúdo do Modal */}
      <div
        id="quadro-resumo-print-area"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200 transition-colors"
      >
        {/* Cabeçalho do Modal (Modo Tela) */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight font-heading flex items-center gap-2">
                <span>Quadro Resumo Estatístico</span>
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800 uppercase tracking-wider">
                  FLH
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Relatório demográfico por faixas etárias, sexo e indicadores socioeconômicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Seletor de Escopo de Status */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setFilterStatusOnly('ativos')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  filterStatusOnly === 'ativos'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Considerar apenas assistidos com status ativo/em acompanhamento"
              >
                Apenas Ativos ({assistidos.filter((a) => (a.status_curso || 'Ativo').toLowerCase().includes('ativo')).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatusOnly('todos')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  filterStatusOnly === 'todos'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Considerar todo o histórico de assistidos da base"
              >
                Todos ({assistidos.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cabeçalho Exclusivo para Impressão A4 */}
        <div className="hidden print-header">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold text-emerald-900 font-heading">
                FUNDAÇÃO LAR HARMONIA • SERVIÇO SOCIAL
              </h1>
              <h2 className="text-sm font-semibold text-slate-800">
                Quadro Resumo Estatístico da População Assistida
              </h2>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
              <p>Filtro Aplicado: {filterStatusOnly === 'ativos' ? 'Assistidos Ativos em Acompanhamento' : 'Total Geral Cadastrado'}</p>
            </div>
          </div>
        </div>

        {/* Corpo com Scroll do Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* CARDS DE DESTAQUE DOS INDICADORES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] uppercase tracking-wider">
                <span>Total Assistidos</span>
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-950 dark:text-emerald-100 font-heading">
                {totalGeral.totalPessoas}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                Individual / Famílias ativas
              </p>
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-1">
              <div className="flex items-center justify-between text-blue-800 dark:text-blue-300 font-semibold text-[11px] uppercase tracking-wider">
                <span>Mercado Trabalho (IMT)</span>
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-blue-950 dark:text-blue-100 font-heading">
                {totalGeral.imtCount}
              </p>
              <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">
                Com atividade remunerada
              </p>
            </div>

            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-1">
              <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 font-semibold text-[11px] uppercase tracking-wider">
                <span>Crianças em Creche</span>
                <Baby className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xl font-bold text-purple-950 dark:text-purple-100 font-heading">
                {totalGeral.crecheCount}
              </p>
              <p className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">
                0 a 11 anos atendidas
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/60 space-y-1">
              <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-semibold text-[11px] uppercase tracking-wider">
                <span>Gestantes Atendidas</span>
                <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-xl font-bold text-rose-950 dark:text-rose-100 font-heading">
                {totalGeral.gestantesCount}
              </p>
              <p className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">
                Em acompanhamento social
              </p>
            </div>
          </div>

          {/* TABELA OFICIAL QUADRO RESUMO ESTATÍSTICO */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-800 dark:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider border-b border-emerald-900 dark:border-slate-700">
                    <th className="py-3 px-3.5 min-w-[160px]">Faixa Etária (Idade)</th>
                    <th className="py-3 px-3.5 min-w-[130px]">Subcategoria</th>
                    <th className="py-3 px-2.5 min-w-[90px] text-center">Sexo</th>
                    <th className="py-3 px-3 text-center bg-emerald-900/40 dark:bg-slate-700/50 min-w-[120px]">
                      Total de Assistidos
                    </th>
                    <th className="py-3 px-3 text-center min-w-[140px]" title="Integração ao Mercado de Trabalho">
                      Integração Trabalho (IMT)
                    </th>
                    <th className="py-3 px-3 text-center min-w-[120px]">
                      Crianças em Creche
                    </th>
                    <th className="py-3 px-3 text-center min-w-[120px]">
                      Gestantes Atendidas
                    </th>
                    <th className="py-3 px-3.5 text-center bg-emerald-950 dark:bg-slate-900 min-w-[120px]">
                      Total da Linha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {FAIXAS_ETARIAS.map((f) => {
                    const masc = linhas.find((l) => l.faixaKey === f.key && l.sexo === 'Masculino')!;
                    const fem = linhas.find((l) => l.faixaKey === f.key && l.sexo === 'Feminino')!;
                    const sub = subtotaisPorFaixa[f.key];

                    return (
                      <React.Fragment key={f.key}>
                        {/* Linha Masculino */}
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white" rowSpan={3}>
                            <div>
                              <p className="text-xs font-bold font-heading">{f.label}</p>
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{f.sublabel}</p>
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400">{f.sublabel}</td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                              Masculino
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                            {masc.totalPessoas}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-blue-700 dark:text-blue-300">
                            {masc.imtCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-purple-700 dark:text-purple-300">
                            {masc.crecheCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-400 dark:text-slate-600">
                            -
                          </td>
                          <td className="py-2.5 px-3.5 text-center font-bold text-slate-900 dark:text-white bg-slate-100/70 dark:bg-slate-800/70">
                            {masc.totalLinha}
                          </td>
                        </tr>

                        {/* Linha Feminino */}
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400">{f.sublabel}</td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-100 text-pink-900 dark:bg-pink-950/60 dark:text-pink-300">
                              Feminino
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                            {fem.totalPessoas}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-blue-700 dark:text-blue-300">
                            {fem.imtCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-purple-700 dark:text-purple-300">
                            {fem.crecheCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-rose-700 dark:text-rose-300">
                            {fem.gestantesCount}
                          </td>
                          <td className="py-2.5 px-3.5 text-center font-bold text-slate-900 dark:text-white bg-slate-100/70 dark:bg-slate-800/70">
                            {fem.totalLinha}
                          </td>
                        </tr>

                        {/* Linha Subtotal da Faixa */}
                        <tr className="subtotal-row bg-emerald-50/70 dark:bg-emerald-950/30 border-b-2 border-slate-200 dark:border-slate-700 font-bold">
                          <td className="py-2.5 px-3.5 text-emerald-950 dark:text-emerald-300 font-heading">
                            SUBTOTAL ({f.label})
                          </td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200/80 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-200">
                              Ambos os Sexos
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-950 dark:text-emerald-200 bg-emerald-100/50 dark:bg-emerald-900/40">
                            {sub.totalPessoas}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-blue-900 dark:text-blue-200">
                            {sub.imtCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-purple-900 dark:text-purple-200">
                            {sub.crecheCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-rose-900 dark:text-rose-200">
                            {sub.gestantesCount}
                          </td>
                          <td className="py-2.5 px-3.5 text-center font-bold text-emerald-950 dark:text-emerald-100 bg-emerald-200/70 dark:bg-emerald-900/70">
                            {sub.totalLinha}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
                {/* Rodapé Total Geral */}
                <tfoot>
                  <tr className="total-row bg-emerald-800 dark:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider">
                    <td colSpan={3} className="py-3.5 px-4 font-heading border-t-2 border-emerald-900">
                      TOTAL GERAL DA FUNDAÇÃO LAR HARMONIA
                    </td>
                    <td className="py-3.5 px-3 text-center text-sm font-heading bg-emerald-900/60 dark:bg-slate-900">
                      {totalGeral.totalPessoas}
                    </td>
                    <td className="py-3.5 px-3 text-center text-sm font-heading">
                      {totalGeral.imtCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-sm font-heading">
                      {totalGeral.crecheCount}
                    </td>
                    <td className="py-3.5 px-3 text-center text-sm font-heading">
                      {totalGeral.gestantesCount}
                    </td>
                    <td className="py-3.5 px-3.5 text-center text-sm font-heading bg-emerald-950 dark:bg-slate-900 text-amber-300 dark:text-amber-400">
                      {totalGeral.totalLinha}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* NOTA METODOLÓGICA / ORIENTAÇÕES TÉCNICAS */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-1.5 no-print">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] font-heading">
              <Info className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Nota Técnica & Metodologia do Quadro Resumo</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              O Quadro Resumo Estatístico consolida a população atendida pelo Serviço Social da Fundação Lar Harmonia segundo as faixas etárias padronizadas e indicadores de autonomia socioeconômica. Os valores são recalculados dinamicamente com base nas datas de nascimento registradas nas fichas oficiais dos assistidos.
            </p>
          </div>
        </div>

        {/* Rodapé do Modal com Ações principais (Modo Tela) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Relatório atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Botão Exportar Resumo (.xlsx / CSV) */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs transition cursor-pointer"
              title="Exportar tabela resumo para planilha Excel (.csv UTF-8 com BOM)"
            >
              <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Exportar Resumo (.xlsx / CSV)</span>
            </button>

            {/* Botão Imprimir Quadro (A4 / PDF) */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              title="Abrir diálogo de impressão limpo para papel A4 ou salvar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Quadro (A4/PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
