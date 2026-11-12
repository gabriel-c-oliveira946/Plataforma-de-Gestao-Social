import {
  Calendar,
  Home,
  Edit3,
  Save,
  Sparkles,
  AlertCircle,
  Award
} from 'lucide-react';
import type { Assistido } from './tipos';
import type { FichaCtx } from './useVerFicha';

/** Aba de avaliação de 4 meses e entrevista domiciliar de 1 ano. */
export function AbaAvaliacao({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    canEvaluate,
    activeTab,
    existingAvaliacao,
    isEditingAvaliacao,
    setIsEditingAvaliacao,
    dataAvaliacao,
    setDataAvaliacao,
    statusFinalCurso,
    setStatusFinalCurso,
    motivoEvasao,
    setMotivoEvasao,
    impactoGerado,
    setImpactoGerado,
    mudancaAutonomia,
    setMudancaAutonomia,
    savingAvaliacao,
    avaliacaoErrorMsg,
    isPendente1Ano,
    existingEntrevista1Ano,
    setIsEntrevistaModalOpen,
    formatDate,
    handleSaveAvaliacao
  } = ctx;

  return (
    <>
              {/* ABA 5: AVALIAÇÃO DE 4 MESES */}
              {activeTab === 'avaliacao' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Se já existe avaliação registrada e não está em modo de edição da avaliação */}
                  {existingAvaliacao && !isEditingAvaliacao ? (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Award className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-gray-900">
                              Avaliação de 4 Meses Concluída
                            </h4>
                            <p className="text-xs text-gray-500">
                              Realizada em {formatDate(existingAvaliacao.data_avaliacao)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsEditingAvaliacao(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition border border-emerald-200 cursor-pointer self-start sm:self-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Atualizar Avaliação</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">
                            Data da Avaliação
                          </span>
                          <span className="font-extrabold text-gray-900 text-sm block">
                            {formatDate(existingAvaliacao.data_avaliacao)}
                          </span>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">
                            Status Final do Curso / Oficina
                          </span>
                          <span className="font-extrabold text-emerald-800 text-sm block">
                            {existingAvaliacao.status_final_curso}
                            {existingAvaliacao.motivo_evasao && (
                              <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-800 block mt-1.5">
                                Motivo da Evasão: <strong className="font-bold underline decoration-amber-400">"{existingAvaliacao.motivo_evasao}"</strong>
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">
                            Impacto Social e Econômico
                          </span>
                          <span className="font-extrabold text-emerald-800 text-sm block">
                            {existingAvaliacao.impacto_gerado}
                          </span>
                        </div>

                        <div className="col-span-1 sm:col-span-2 md:col-span-3 p-5 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-100 space-y-2">
                          <span className="text-emerald-900 font-bold uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Mudança na Autonomia e Qualidade de Vida (Depoimento / Observações)
                          </span>
                          <p className="text-gray-800 text-sm italic whitespace-pre-wrap leading-relaxed">
                            "{existingAvaliacao.mudanca_autonomia_qualidade_vida}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Formulário de Registro / Atualização da Avaliação */
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <Award className="w-5 h-5 text-emerald-600" />
                          <div>
                            <h4 className="text-base font-bold text-gray-900">
                              {existingAvaliacao
                                ? 'Atualizar Avaliação de 4 Meses'
                                : 'Registrar Avaliação de 4 Meses (Acompanhamento FLH)'}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Ficha de acompanhamento pós-ingresso de 120 dias no Lar Harmonia
                            </p>
                          </div>
                        </div>
                        {existingAvaliacao && (
                          <button
                            type="button"
                            onClick={() => setIsEditingAvaliacao(false)}
                            className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2.5 py-1 rounded-lg hover:bg-gray-100"
                          >
                            Voltar para visualização
                          </button>
                        )}
                      </div>

                      {/* Notificações no Formulário de Avaliação */}
                      {avaliacaoErrorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          {avaliacaoErrorMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* 1. Data da Avaliação */}
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            Data da Avaliação <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={dataAvaliacao}
                            onChange={(e) => setDataAvaliacao(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <p className="text-[11px] text-gray-500 mt-1">
                            Padrão preenchido com a data atual.
                          </p>
                        </div>

                        {/* 2. Status Final do Curso */}
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Status Final do Curso / Oficina <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={statusFinalCurso}
                            onChange={(e) => setStatusFinalCurso(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="Concluiu Oficina">Concluiu Oficina</option>
                            <option value="Desistiu (Evasão)">Desistiu (Evasão)</option>
                            <option value="Continua em Acompanhamento">Continua em Acompanhamento</option>
                          </select>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Atualizará o status do assistido no sistema.
                          </p>
                        </div>

                        {/* 3. Impacto Gerado */}
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Impacto Gerado <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={impactoGerado}
                            onChange={(e) => setImpactoGerado(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="Conseguiu Emprego">Conseguiu Emprego</option>
                            <option value="Abriu Pequeno Negócio">Abriu Pequeno Negócio</option>
                            <option value="Aumentou Renda em Casa">Aumentou Renda em Casa</option>
                            <option value="Sem Alteração Renda">Sem Alteração Renda</option>
                            <option value="Outro">Outro</option>
                          </select>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Resultado socioeconômico direto.
                          </p>
                        </div>

                        {/* Campo condicional: Motivo da Evasão se Desistiu */}
                        {statusFinalCurso === 'Desistiu (Evasão)' && (
                          <div className="md:col-span-12 p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                            <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                              Motivo da Evasão / Desistência <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <select
                                value={
                                  [
                                    'Transporte / Distância',
                                    'Horário incompatível / Conseguiu Trabalho',
                                    'Cuidado infantil / Dependentes',
                                    'Saúde fragilizada',
                                    'Mudança de endereço / Território',
                                    'Falta de interesse'
                                  ].includes(motivoEvasao)
                                    ? motivoEvasao
                                    : 'Outro'
                                }
                                onChange={(e) => {
                                  if (e.target.value !== 'Outro') {
                                    setMotivoEvasao(e.target.value);
                                  } else {
                                    const opcoesPredefinidas = [
                                      'Transporte / Distância',
                                      'Horário incompatível / Conseguiu Trabalho',
                                      'Cuidado infantil / Dependentes',
                                      'Saúde fragilizada',
                                      'Mudança de endereço / Território',
                                      'Falta de interesse'
                                    ];
                                    if (opcoesPredefinidas.includes(motivoEvasao)) {
                                      setMotivoEvasao('');
                                    }
                                  }
                                }}
                                className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                              >
                                <option value="Transporte / Distância">Transporte / Distância</option>
                                <option value="Horário incompatível / Conseguiu Trabalho">Horário incompatível / Conseguiu Trabalho</option>
                                <option value="Cuidado infantil / Dependentes">Cuidado infantil / Dependentes</option>
                                <option value="Saúde fragilizada">Saúde fragilizada</option>
                                <option value="Mudança de endereço / Território">Mudança de endereço / Território</option>
                                <option value="Falta de interesse">Falta de interesse</option>
                                <option value="Outro">Outro motivo especificado...</option>
                              </select>

                              <input
                                type="text"
                                placeholder="Especifique ou detalhe o motivo da evasão..."
                                value={motivoEvasao}
                                onChange={(e) => setMotivoEvasao(e.target.value)}
                                className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {/* 4. Mudança na Autonomia e Qualidade de Vida (Texto livre de depoimento/observações) */}
                        <div className="md:col-span-12 space-y-1.5">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                            <span>
                              Mudança na Autonomia e Qualidade de Vida (Depoimento / Observações){' '}
                              <span className="text-red-500">*</span>
                            </span>
                            <span className="text-[11px] text-gray-400 font-normal lowercase">
                              (relato do assistido e da equipe)
                            </span>
                          </label>
                          <textarea
                            rows={4}
                            value={mudancaAutonomia}
                            onChange={(e) => setMudancaAutonomia(e.target.value)}
                            placeholder="Descreva detalhadamente o depoimento do assistido sobre seu progresso, melhorias em sua renda, relações familiares, saúde mental e autonomia após a participação no Lar Harmonia..."
                            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Botões do Formulário de Avaliação */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        {existingAvaliacao && (
                          <button
                            type="button"
                            onClick={() => setIsEditingAvaliacao(false)}
                            disabled={savingAvaliacao}
                            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveAvaliacao}
                          disabled={savingAvaliacao}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>
                            {savingAvaliacao ? 'Salvando Avaliação...' : 'Salvar Avaliação'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SEÇÃO DEDICADA: ENTREVISTA DOMICILIAR DE 1 ANO */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                          <Home className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                            <span>Entrevista Domiciliar de 1 Ano</span>
                            {existingEntrevista1Ano ? (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-300 dark:border-emerald-700 uppercase">
                                Concluída
                              </span>
                            ) : isPendente1Ano ? (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-bold rounded-md border border-amber-300 dark:border-amber-700 uppercase animate-pulse">
                                Pendente
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-600">
                                Em Acompanhamento (&lt; 365 dias)
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Acompanhamento anual das condições habitacionais, evolução do lar e vulnerabilidades familiares
                          </p>
                        </div>
                      </div>

                      {canEvaluate && (
                        <button
                          type="button"
                          onClick={() => setIsEntrevistaModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
                        >
                          <Home className="w-3.5 h-3.5" />
                          <span>{existingEntrevista1Ano ? 'Atualizar Entrevista' : 'Registrar Entrevista (1 Ano)'}</span>
                        </button>
                      )}
                    </div>

                    {existingEntrevista1Ano ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-100 dark:border-slate-600 space-y-1">
                          <span className="text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                            Data da Visita Domiciliar
                          </span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm block">
                            {formatDate(existingEntrevista1Ano.data_visita)}
                          </span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-100 dark:border-slate-600 space-y-1">
                          <span className="text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                            Técnico Responsável
                          </span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">
                            {existingEntrevista1Ano.tecnico_responsavel}
                          </span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-100 dark:border-slate-600 space-y-1">
                          <span className="text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                            Situação Familiar / Evolução
                          </span>
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-sm block">
                            {existingEntrevista1Ano.evolucao_situacao || 'Mantém / Sem alterações significativas'}
                          </span>
                        </div>

                        <div className="col-span-1 sm:col-span-2 md:col-span-3 p-5 bg-gradient-to-r from-amber-50/60 to-orange-50/40 dark:from-amber-950/40 dark:to-orange-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                          <span className="text-amber-950 dark:text-amber-200 font-bold uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                            <Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            Observações da Evolução do Lar
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 text-sm italic whitespace-pre-wrap leading-relaxed">
                            "{existingEntrevista1Ano.observacoes_evolucao_lar || existingEntrevista1Ano.parecer_observacoes}"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-2xl text-center space-y-2">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Nenhuma Entrevista Domiciliar de 1 Ano registrada até o momento.
                        </p>
                        {isPendente1Ano ? (
                          <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-700">
                            Atenção: Assistido possui 1 ano ou mais de acolhimento (&ge; 365 dias). Registro pendente!
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                            A visita de acompanhamento de 1 ano será solicitada automaticamente aos 365 dias de ingresso.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
    </>
  );
}
