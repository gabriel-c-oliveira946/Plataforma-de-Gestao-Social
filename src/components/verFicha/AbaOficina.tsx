import { getAssistidoMotivoEvasao } from '../../utils/avaliacao4Meses';
import { GraduationCap, AlertTriangle } from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Aba de oficinas e expectativas. */
export function AbaOficina({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    activeTab,
    renderStatusBadge,
    expectativaParsed,
    cursosAnterioresInfo
  } = ctx;

  return (
    <>
              {/* ABA 4: OFICINAS & EXPECTATIVAS */}
              {activeTab === 'oficina' && (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    Motivações e Percepção da FLH (Oficinas e Expectativas)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 font-semibold block">Oficina Pretendida:</span>
                      <span className="font-extrabold text-emerald-900 text-sm">
                        {assistido.curso_pretendido || 'Não informado'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block">Status do Atendimento:</span>
                      <span className="mt-1 block">
                        {renderStatusBadge(assistido.status_curso)}
                      </span>
                    </div>

                    {getAssistidoMotivoEvasao(assistido) && (
                      <div className="col-span-1 sm:col-span-2 md:col-span-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 animate-fadeIn">
                        <span className="text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider block text-[10px] flex items-center gap-1.5 mb-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Motivo da Evasão / Desistência Registrado:
                        </span>
                        <span className="font-bold text-amber-950 dark:text-amber-100 text-xs sm:text-sm leading-relaxed block">
                          "{getAssistidoMotivoEvasao(assistido)}"
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-400 font-semibold block">
                        É a oficina de sua preferência?
                      </span>
                      <span className="font-bold text-gray-900">
                        {expectativaParsed.preferencia}
                        {expectativaParsed.preferenciaOutro
                          ? ` (Preferia: ${expectativaParsed.preferenciaOutro})`
                          : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block">
                        Cursos Profissionalizantes Anteriores:
                      </span>
                      <span className="font-medium text-gray-800">
                        {cursosAnterioresInfo.texto}
                      </span>
                    </div>

                    {assistido.motivo_busca && (
                      <div className="col-span-1 sm:col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <span className="text-gray-400 font-semibold block mb-1">
                          Motivo da busca pela oficina neste momento:
                        </span>
                        <p className="text-gray-800 italic">"{assistido.motivo_busca}"</p>
                      </div>
                    )}

                    {expectativaParsed.representacaoFLH && (
                      <div className="col-span-1 sm:col-span-2 bg-rose-50/50 p-3 rounded-xl border border-rose-200">
                        <span className="text-rose-900 font-semibold block mb-1">
                          O que a Fundação Lar Harmonia representa para sua família?
                        </span>
                        <p className="text-gray-900 italic">
                          "{expectativaParsed.representacaoFLH}"
                        </p>
                      </div>
                    )}

                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-400 font-semibold block mb-1">
                        Objetivo profissional para os próximos 3 meses:
                      </span>
                      <span className="font-medium text-gray-900">
                        {assistido.objetivo_profissional_3_meses || 'Não informado'}
                      </span>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-400 font-semibold block mb-1">
                        Interesse em outras oficinas da FLH:
                      </span>
                      <span className="font-medium text-gray-900">
                        {expectativaParsed.naoTemInteresse
                          ? 'Não tem interesse em outras oficinas no momento'
                          : expectativaParsed.outrasOficinas || 'Não informado'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
}
