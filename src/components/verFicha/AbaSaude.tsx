import { HeartPulse, AlertTriangle } from 'lucide-react';
import { parseCondicoesSaudeParaImpressao } from '../FichaAssistido';
import type { FichaCtx } from './useVerFicha';

/** Aba de saúde e vulnerabilidades. */
export function AbaSaude({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    activeTab,
    saudeFamiliaTabela
  } = ctx;

  return (
    <>
              {/* ABA 3: SAÚDE & VULNERABILIDADES */}
              {activeTab === 'saude' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Lista Detalhada de Condições Cadastradas */}
                  {(() => {
                    const condicoes = parseCondicoesSaudeParaImpressao(assistido.doencas_cronicas_familia);
                    return (
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <HeartPulse className="w-4 h-4 text-rose-600" />
                            Condições de Saúde Registradas na Família
                          </h4>
                          <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            {condicoes.length} registrada(s)
                          </span>
                        </div>

                        {condicoes.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {condicoes.map((cond, idx) => (
                              <div
                                key={cond.id || idx}
                                className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-2.5 text-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-gray-950 text-sm block">
                                      {cond.nomeDoenca}
                                    </span>
                                    <span className="text-[10px] font-semibold text-rose-700 block mt-0.5">
                                      {cond.categoria}
                                    </span>
                                  </div>
                                  <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold text-[10px] shrink-0">
                                    {cond.quemPossui}
                                  </span>
                                </div>

                                <div className="space-y-1 text-slate-700 bg-white/80 p-2.5 rounded-lg border border-rose-100/60">
                                  <div>
                                    <span className="font-semibold text-slate-500 text-[11px] block">
                                      Medicamento / Como Adquire / Tratamento:
                                    </span>
                                    <span className="font-medium text-slate-900">
                                      {cond.medicamento}
                                    </span>
                                  </div>

                                  {cond.observacoes && cond.observacoes !== 'Sem observações adicionais' && (
                                    <div className="pt-1 border-t border-slate-100 mt-1">
                                      <span className="font-semibold text-slate-500 text-[11px] block">
                                        Observações / Detalhes:
                                      </span>
                                      <span className="italic text-slate-800">
                                        {cond.observacoes}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
                            Nenhuma condição de saúde ou patologia crônica cadastrada para o assistido ou seus familiares.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Resumo por Categoria */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      Visão Geral por Categoria de Saúde
                    </h4>

                    <div className="space-y-3">
                      {saudeFamiliaTabela.map((row) => (
                        <div
                          key={row.id}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            row.registrada
                              ? 'bg-rose-50/60 border-rose-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm">
                                {row.titulo}
                              </span>
                              {row.registrada ? (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                                  Registrado
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[11px]">Não registrado</span>
                              )}
                            </div>
                            <span className="text-gray-500 text-[11px] block mt-0.5">
                              {row.subtitulo}
                            </span>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-gray-800 font-medium block">
                              {row.detalhes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vulnerabilidades e Apoio */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Dificuldades, Rede de Apoio e Serviços FLH
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 font-semibold block mb-1">
                          Dificuldades Enfrentadas pela Família:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(assistido.dificuldades_enfrentadas) &&
                          assistido.dificuldades_enfrentadas.length > 0 ? (
                            assistido.dificuldades_enfrentadas.map((dif, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded font-medium border border-amber-200 text-[11px]"
                              >
                                {dif}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Nenhuma informada</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 font-semibold block mb-1">
                          Rede de Apoio Principal:
                        </span>
                        <span className="font-bold text-gray-900 block">
                          {assistido.rede_apoio || 'Não informada'}
                        </span>
                      </div>

                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-gray-400 font-semibold block mb-1">
                          Serviços da Fundação Lar Harmonia já Utilizados:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(assistido.servicos_acompanhamento) &&
                          assistido.servicos_acompanhamento.length > 0 ? (
                            assistido.servicos_acompanhamento.map((srv, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-semibold border border-emerald-200"
                              >
                                {srv}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Nenhum serviço registrado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
}
