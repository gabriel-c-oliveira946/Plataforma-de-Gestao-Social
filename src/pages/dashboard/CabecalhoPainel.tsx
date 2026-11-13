import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import type { DashboardCtx } from './useDashboard';

/** Título da página e botões de atualizar/cadastrar. */
export function CabecalhoPainel({ ctx }: { ctx: DashboardCtx }) {
  const {
    assistidos,
    loading,
    fetchAssistidos
  } = ctx;

  return (
    <>
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-heading">
              Assistidos Lar Harmonia
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Consulte, acompanhe e gerencie as fichas sociais dos assistidos e suas oficinas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAssistidos(true)}
              disabled={loading}
              title="Atualizar lista"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <Link
              to="/cadastrar"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Cadastro
            </Link>
          </div>
        </div>
    </>
  );
}
