import {
  LayoutGrid,
  List,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import type { DashboardCtx } from './useDashboard';

/** Contagem de resultados, quadro resumo, exportação e modo de exibição. */
export function ResumoResultados({ ctx }: { ctx: DashboardCtx }) {
  const {
    assistidos,
    viewMode,
    setViewMode,
    setIsQuadroResumoOpen,
    filteredAssistidos,
    handleExportCSV
  } = ctx;

  return (
    <>
        {/* BARRA DE CONTAGEM E RESUMO DE RESULTADOS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 px-1">
          <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Exibindo <span className="font-bold text-slate-900 dark:text-slate-100">{filteredAssistidos.length}</span> assistidos encontrados
            {assistidos.length !== filteredAssistidos.length && (
              <span className="text-slate-500 dark:text-slate-400 text-xs ml-1.5">
                (de um total de {assistidos.length} cadastrados)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botão para Quadro Resumo Estatístico */}
            <button
              type="button"
              onClick={() => setIsQuadroResumoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer"
              title="Abrir Quadro Resumo Estatístico por Faixa Etária, Sexo e Indicadores (A4 / Excel)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>Quadro Resumo</span>
            </button>

            {/* Botão de Destaque para Exportação CSV / Excel */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredAssistidos.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              title="Exportar assistidos da listagem filtrada para planilha CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Exportar Planilha</span>
              {filteredAssistidos.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-800 text-emerald-100 rounded-full text-[10px] font-semibold">
                  {filteredAssistidos.length}
                </span>
              )}
            </button>

            {/* Alternar Visualização: Cards ou Tabela */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-lg shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>
          </div>
        </div>
    </>
  );
}
