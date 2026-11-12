import {
  X,
  Home,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Registro da entrevista domiciliar de 1 ano. */
export function ModalEntrevista({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    isEntrevistaModalOpen,
    setIsEntrevistaModalOpen,
    dataVisita,
    setDataVisita,
    tecnicoResponsavel,
    setTecnicoResponsavel,
    evolucaoSituacao,
    setEvolucaoSituacao,
    observacoesEvolucaoLar,
    setObservacoesEvolucaoLar,
    statusPosVisita,
    setStatusPosVisita,
    savingEntrevista,
    handleSaveEntrevista
  } = ctx;

  return (
    <>
    {/* Modal de Entrevista Domiciliar (1 Ano) */}
    {isEntrevistaModalOpen && (
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 rounded-2xl">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Registrar Entrevista Domiciliar (1 Ano)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {assistido.nome_completo}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEntrevistaModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Data da Visita Domiciliar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Data da Visita Domiciliar <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dataVisita}
                  onChange={(e) => setDataVisita(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Assistente Social / Técnico Responsável */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Assistente Social / Técnico <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tecnicoResponsavel}
                  onChange={(e) => setTecnicoResponsavel(e.target.value)}
                  placeholder="Ex: Dra. Maria Silva - CRESS 1234"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Confirmação dos Dados Atuais (Situação da Família) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confirmação dos Dados Atuais (Situação da Família) <span className="text-red-500">*</span>
              </label>
              <select
                value={evolucaoSituacao}
                onChange={(e) => setEvolucaoSituacao(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="Mantém / Sem alterações significativas">
                  Mantém / Sem alterações significativas
                </option>
                <option value="Melhorou / Avanço socioeconômico">
                  Melhorou / Avanço socioeconômico
                </option>
                <option value="Piorou / Maior vulnerabilidade">
                  Piorou / Maior vulnerabilidade
                </option>
              </select>
            </div>

            {/* Status Pós-Visita */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Status Pós-Visita Domiciliar <span className="text-red-500">*</span>
              </label>
              <select
                value={statusPosVisita}
                onChange={(e) => setStatusPosVisita(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="Manter em Acompanhamento">Manter em Acompanhamento</option>
                <option value="Pausado">Pausado</option>
                <option value="Desligado">Desligado</option>
              </select>
            </div>

            {/* Campo de Texto: Observações da Evolução do Lar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Observações da Evolução do Lar <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={observacoesEvolucaoLar}
                onChange={(e) => setObservacoesEvolucaoLar(e.target.value)}
                placeholder="Registre alterações na estrutura física da moradia, saúde mental, perda/ganho de familiares, variação na renda ou novas vulnerabilidades identificadas..."
                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEntrevistaModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={savingEntrevista}
              onClick={handleSaveEntrevista}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {savingEntrevista ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Salvar Registro de Entrevista</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
