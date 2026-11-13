import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Mensagens de sucesso/erro e barra de abas (leitura e edição). */
export function NavegacaoFicha({ ctx }: { ctx: FichaCtx }) {
  const {
    isEditingData,
    activeTab,
    setActiveTab,
    editActiveTab,
    setEditActiveTab,
    avaliacaoSuccessMsg,
    avaliacaoErrorMsg,
    saveSuccessMsg,
    saveErrorMsg,
    editTabsList
  } = ctx;

  return (
    <>
        {/* Notificações no Topo */}
        {(saveSuccessMsg || avaliacaoSuccessMsg) && (
          <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-100 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            {saveSuccessMsg || avaliacaoSuccessMsg}
          </div>
        )}
        {(saveErrorMsg || avaliacaoErrorMsg) && (
          <div className="px-6 py-2.5 bg-red-50 dark:bg-red-950/60 border-b border-red-100 dark:border-red-800 text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            {saveErrorMsg || avaliacaoErrorMsg}
          </div>
        )}

        {/* BARRA DE NAVEGAÇÃO DE ABAS */}
        {!isEditingData ? (
          /* Abas do Modo de Visualização / Leitura */
          <div className="px-3 sm:px-6 pr-6 sm:pr-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800 overflow-x-auto whitespace-nowrap scroll-smooth flex items-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('geral')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'geral'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              Visão Geral 360°
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('identificacao')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'identificacao'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              1. Identificação Civil
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trabalho')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'trabalho'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              2. Trabalho & Renda
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('moradia')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'moradia'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              3. Moradia & Composição Familiar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saude')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'saude'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              4. Saúde & Vulnerabilidades
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('oficina')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'oficina'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              5. Oficinas & Percepção FLH
            </button>
          </div>
        ) : (
          /* Abas do Modo de Edição Completa (5 Abas Oficiais) */
          <div className="px-3 sm:px-6 border-b border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center justify-between gap-2 py-1.5 sm:py-2 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              {editTabsList.map((tab) => {
                const Icon = tab.icon;
                const isCurrent = editActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEditActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-amber-900 dark:text-amber-200 hover:bg-amber-100/70 dark:hover:bg-amber-900/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 pr-2">
              <span>Etapa {editActiveTab} de 5</span>
            </div>
          </div>
        )}
    </>
  );
}
