import { Briefcase } from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Aba de trabalho e renda. */
export function AbaTrabalho({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    activeTab,
    faixaRendaParsed,
    trabalhoParsed
  } = ctx;

  return (
    <>
              {/* ABA 2: TRABALHO & RENDA */}
              {activeTab === 'trabalho' && (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Situação Profissional, Faixa de Renda e Programas Sociais
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 font-semibold block">
                        Atividade Remunerada Atual:
                      </span>
                      <span
                        className={`font-bold ${
                          assistido.atividade_remunerada === 'Sim'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {assistido.atividade_remunerada === 'Sim'
                          ? 'Sim, realiza atividade remunerada'
                          : 'Não realiza atividade remunerada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Ocupação / Ramo:</span>
                      <span className="font-medium text-gray-900">
                        {trabalhoParsed.ocupacao}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Turno de Trabalho:</span>
                      <span className="font-medium text-gray-800">{trabalhoParsed.turno}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Dias da Semana:</span>
                      <span className="font-medium text-gray-800">{trabalhoParsed.dias}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">
                        Faixa de Renda Familiar / Própria:
                      </span>
                      <span className="font-extrabold text-emerald-800">
                        {faixaRendaParsed}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">
                        Já trabalhou anteriormente:
                      </span>
                      <span className="font-medium text-gray-800">
                        {trabalhoParsed.trabalhouAnteriormente ||
                          (trabalhoParsed.areaAnterior ? `Sim (${trabalhoParsed.areaAnterior})` : 'Não')}
                      </span>
                    </div>
                    {trabalhoParsed.desempregoJustificativa && (
                      <div className="col-span-1 sm:col-span-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <span className="text-gray-500 font-semibold block mb-1">
                          Causa do Desemprego / Sem Renda:
                        </span>
                        <p className="text-gray-800 italic">
                          "{trabalhoParsed.desempregoJustificativa}"
                        </p>
                      </div>
                    )}
                    <div className="col-span-1 sm:col-span-3">
                      <span className="text-gray-400 font-semibold block mb-1">
                        Programas Sociais e Transferência de Renda:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(assistido.beneficios_sociais) &&
                        assistido.beneficios_sociais.length > 0 ? (
                          assistido.beneficios_sociais.map((prog, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded-lg text-xs font-semibold border border-indigo-200"
                            >
                              {prog}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">Nenhum benefício registrado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
}
