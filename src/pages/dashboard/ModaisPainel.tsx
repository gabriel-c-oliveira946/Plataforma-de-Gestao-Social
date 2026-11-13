import { VerFichaModal, Assistido } from '../../components/VerFichaModal';
import QuadroResumoModal from '../../components/QuadroResumoModal';
import { Trash2 } from 'lucide-react';
import type { DashboardCtx } from './useDashboard';

/** Ficha completa, confirmação de exclusão e quadro resumo. */
export function ModaisPainel({ ctx }: { ctx: DashboardCtx }) {
  const {
    assistidos,
    setAssistidos,
    selectedAssistido,
    setSelectedAssistido,
    isQuadroResumoOpen,
    setIsQuadroResumoOpen,
    assistidoToDelete,
    setAssistidoToDelete,
    deleting,
    isAdmin,
    filteredAssistidos,
    handleConfirmDelete
  } = ctx;

  return (
    <>
      {/* ========================================================================= */}
      {/* MODAL DETALHES / VISUALIZAÇÃO COMPLETA DA FICHA (VerFichaModal)           */}
      {/* ========================================================================= */}
      {selectedAssistido && (
        <VerFichaModal
          assistido={selectedAssistido}
          isAdmin={isAdmin}
          onClose={() => setSelectedAssistido(null)}
          onDelete={(assistido) => {
            setSelectedAssistido(null);
            setAssistidoToDelete(assistido);
          }}
          onAssistidoUpdated={(updated) => {
            setSelectedAssistido(updated);
            setAssistidos((prev) =>
              prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
            );
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (APENAS ADMIN)                           */}
      {/* ========================================================================= */}
      {assistidoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                Confirmar Exclusão de Assistido
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Esta ação é irreversível e excluirá permanentemente o cadastro de:
              </p>
              <p className="text-sm font-bold text-red-700 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-950/40 rounded-lg">
                {assistidoToDelete.nome_completo}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssistidoToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE QUADRO RESUMO ESTATÍSTICO (RELAÇÕES SOCIOECONÔMICAS E DEMOGRÁFICAS) */}
      {/* ========================================================================= */}
      <QuadroResumoModal
        isOpen={isQuadroResumoOpen}
        onClose={() => setIsQuadroResumoOpen(false)}
        assistidos={filteredAssistidos.length > 0 ? filteredAssistidos : assistidos}
      />
    </>
  );
}
