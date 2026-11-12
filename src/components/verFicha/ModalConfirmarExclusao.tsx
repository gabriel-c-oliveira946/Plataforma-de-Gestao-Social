import { Trash2, Loader2 } from 'lucide-react';
import { formatCPF } from '../../utils/masks';
import type { FichaCtx } from './useVerFicha';

/** Confirmação de exclusão da ficha. */
export function ModalConfirmarExclusao({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    showDirectConfirmModal,
    setShowDirectConfirmModal,
    deletingFicha,
    handleExecuteDirectDelete
  } = ctx;

  return (
    <>
    {/* Mini-Modal de Confirmação Estilizado (Fora da área de impressão para não ficar oculto) */}
    {showDirectConfirmModal && (
      <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
              Confirmar Exclusão de Ficha
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta ação é irreversível e excluirá permanentemente o cadastro de:
            </p>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/50">
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                {assistido.nome_completo}
              </p>
              {assistido.cpf && (
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-mono mt-0.5">
                  CPF: {formatCPF(assistido.cpf)}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDirectConfirmModal(false)}
              disabled={deletingFicha}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExecuteDirectDelete}
              disabled={deletingFicha}
              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {deletingFicha ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Sim, Excluir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
