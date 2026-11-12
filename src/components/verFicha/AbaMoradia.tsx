import { Home } from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Aba de moradia e composição familiar. */
export function AbaMoradia({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    activeTab,
    isSituacaoRua,
    moradiaParsed,
    renderFamilyMembersSection
  } = ctx;

  return (
    <>
              {/* ABA 3: MORADIA & COMPOSIÇÃO FAMILIAR */}
              {activeTab === 'moradia' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Card de Informações da Moradia */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                      <Home className="w-4 h-4 text-emerald-600" />
                      Situação de Moradia, Saneamento e Infraestrutura
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 font-semibold block">Tipo de Moradia:</span>
                        <span className="font-bold text-gray-900">{moradiaParsed.tipo}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Composição Domiciliar:</span>
                        <span className="font-bold text-emerald-800">
                          {isSituacaoRua ? 'Em Situação de Rua' : `${assistido.composicao_familiar || 1} pessoas no lar`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Filhos Dependentes:</span>
                        <span className="font-bold text-pink-700">
                          {moradiaParsed.filhos !== ''
                            ? `${moradiaParsed.filhos} filhos`
                            : assistido.quantidade_filhos !== undefined && assistido.quantidade_filhos !== null
                            ? `${assistido.quantidade_filhos} filhos`
                            : 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Água e Energia Elétrica:</span>
                        <span className="font-medium text-gray-800">
                          Água: {moradiaParsed.agua} | Luz: {moradiaParsed.energia}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Serviços Básicos / Saneamento:</span>
                        <span className="font-medium text-gray-800">{moradiaParsed.servicosGerais}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Acesso à Internet em Casa:</span>
                        <span className="font-medium text-indigo-700">{assistido.acesso_internet || 'Não informado'}</span>
                      </div>
                      {moradiaParsed.obs && (
                        <div className="col-span-1 sm:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-semibold block mb-1">
                            Observações da Moradia:
                          </span>
                          <p className="text-slate-800 italic">"{moradiaParsed.obs}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabela Completa e Detalhada dos Membros do Núcleo Familiar */}
                  {renderFamilyMembersSection(false)}
                </div>
              )}
    </>
  );
}
