import {
  User,
  Trash2,
  Edit3,
  Save,
  Printer
} from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Rodapé: auditoria do operador e botões de ação. */
export function RodapeFicha({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    onClose,
    canUserDelete,
    operadorCadastro,
    operadorAtualizacao,
    isEditingData,
    savingEdit,
    handleCancelEdit,
    formatDateTime,
    handleSaveFullEdit,
    deletingFicha,
    handleDeleteAction
  } = ctx;

  return (
    <>
        {/* RODAPÉ DO MODAL: AUDITORIA AMIGÁVEL DO OPERADOR E AÇÕES (Requisito 3) */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-800/90 border-t border-gray-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full text-xs text-gray-500 dark:text-slate-400">
          
          {/* Seção Obrigatória de Auditoria e Operador */}
          <div className="space-y-1.5 py-0.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
              <span className="font-semibold text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" /> Cadastrado por:
              </span>
              <strong className="text-gray-900 dark:text-slate-100 font-bold">
                {operadorCadastro.nome}
              </strong>
              <span className="text-gray-600 dark:text-slate-400 font-medium">
                ({operadorCadastro.cargo})
              </span>
              <span className="text-gray-400 dark:text-slate-500">•</span>
              <span className="text-gray-600 dark:text-slate-400">em {formatDateTime(assistido.created_at)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
              <span className="font-semibold text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" /> Última alteração por:
              </span>
              <strong className="text-gray-900 dark:text-slate-100 font-bold">
                {operadorAtualizacao.nome}
              </strong>
              <span className="text-gray-600 dark:text-slate-400 font-medium">
                ({operadorAtualizacao.cargo})
              </span>
              <span className="text-gray-400 dark:text-slate-500">•</span>
              <span className="text-gray-600 dark:text-slate-400">em {formatDateTime(assistido.updated_at || assistido.created_at)}</span>
            </div>
          </div>

          {/* Botões de Ação no Rodapé (Compactos e em linha no mobile) */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {canUserDelete && !isEditingData && (
              <button
                type="button"
                onClick={handleDeleteAction}
                disabled={deletingFicha}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50 border border-red-200 dark:border-red-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingFicha ? 'Excluindo...' : 'Excluir'}</span>
              </button>
            )}

            {isEditingData ? (
              <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingEdit}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition text-center cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveFullEdit}
                  disabled={savingEdit}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
                  title="Imprimir Ficha Completa A4"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Imprimir Ficha</span>
                  <span className="sm:hidden">Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 sm:px-5 py-2 bg-gray-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer text-center"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
