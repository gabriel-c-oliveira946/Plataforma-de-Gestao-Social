import { Link } from 'react-router-dom';
import { Assistido } from '../../components/VerFichaModal';
import { RotateCcw, Plus, Users } from 'lucide-react';
import type { DashboardCtx } from './useDashboard';

/** Estados de carregamento e de lista vazia. */
export function EstadosLista({ ctx }: { ctx: DashboardCtx }) {
  const {
    loading,
    handleResetFilters,
    filteredAssistidos
  } = ctx;

  return (
    <>
        {/* ESTADO DE CARREGAMENTO */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LISTA VAZIA */}
        {!loading && filteredAssistidos.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-xs transition-colors">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
              Nenhum assistido encontrado com os filtros selecionados
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto mt-1 mb-6">
              Tente redefinir os filtros de pesquisa ou cadastre um novo assistido na plataforma.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Filtros
              </button>
              <Link
                to="/cadastrar"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Assistido
              </Link>
            </div>
          </div>
        )}
    </>
  );
}
