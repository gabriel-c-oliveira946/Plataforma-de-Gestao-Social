import { getAssistidoMotivoEvasao, getAssistidoDataSaida } from '../../utils/avaliacao4Meses';
import {
  User,
  Home,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { Assistido } from './tipos';
import type { FichaCtx } from './useVerFicha';

/** Aba "Visão Geral 360°". */
export function AbaGeral({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    activeTab,
    setActiveTab,
    existingAvaliacao,
    isPendente4Meses,
    setIsEditingAvaliacao,
    isPendente1Ano,
    existingEntrevista1Ano,
    setIsEntrevistaModalOpen,
    formatDate,
    renderStatusBadge,
    isSituacaoRua,
    moradiaParsed,
    faixaRendaParsed,
    trabalhoParsed,
    renderFamilyMembersSummaryCard
  } = ctx;

  return (
    <>
              {/* ABA GERAL: VISÃO 360° */}
              {activeTab === 'geral' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Banner de Aviso: Avaliação de 4 Meses Pendente */}
                  {isPendente4Meses && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-pulse">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-heading">
                            Atingiu 4 Meses (Avaliação Pendente)
                          </h4>
                          <p className="text-xs text-amber-800 mt-0.5">
                            Este assistido ingressou em{' '}
                            <strong>
                              {formatDate(assistido.data_ingresso || assistido.created_at)}
                            </strong>{' '}
                            (mais de 120 dias decorridos) e necessita da avaliação de acompanhamento de impacto e qualidade de vida.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('avaliacao');
                          setIsEditingAvaliacao(true);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Registrar Avaliação Agora
                      </button>
                    </div>
                  )}

                  {/* Banner de Aviso: Entrevista Domiciliar (1 Ano) Pendente */}
                  {isPendente1Ano && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-pulse">
                      <div className="flex items-start gap-3">
                        <Home className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Pendente Entrevista Domiciliar (1 Ano / 12 Meses)
                          </h4>
                          <p className="text-xs text-amber-800 mt-0.5">
                            Assistido com cadastro ativo há mais de 365 dias (12 meses). É necessário realizar e registrar a visita domiciliar de acompanhamento.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEntrevistaModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                      >
                        <Home className="w-4 h-4" />
                        Registrar Entrevista Domiciliar
                      </button>
                    </div>
                  )}

                  {/* Banner de Entrevista Domiciliar já Realizada */}
                  {existingEntrevista1Ano && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start sm:items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <span className="font-bold text-emerald-900 block sm:inline">
                            Entrevista Domiciliar de 1 Ano Realizada em {formatDate(existingEntrevista1Ano.data_visita)}
                          </span>
                          <span className="text-emerald-700 block text-[11px] mt-0.5">
                            Responsável: <strong>{existingEntrevista1Ano.tecnico_responsavel}</strong> • Status pós-visita: <strong>{existingEntrevista1Ano.status_pos_visita}</strong>
                          </span>
                          {existingEntrevista1Ano.parecer_observacoes && (
                            <span className="text-emerald-800 block text-[11px] italic mt-1 bg-white/60 p-2 rounded-lg border border-emerald-100">
                              "{existingEntrevista1Ano.parecer_observacoes}"
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEntrevistaModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shrink-0 cursor-pointer self-start sm:self-auto"
                      >
                        Atualizar Registro
                      </button>
                    </div>
                  )}

                  {/* Banner de Avaliação de 4 Meses já Concluída */}
                  {existingAvaliacao && !isPendente4Meses && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-900">
                            Avaliação de 4 Meses Realizada em {formatDate(existingAvaliacao.data_avaliacao)}
                          </span>
                          <span className="text-emerald-700 block text-[11px]">
                            Status Final: <strong>{existingAvaliacao.status_final_curso}</strong> • Impacto: <strong>{existingAvaliacao.impacto_gerado}</strong>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('avaliacao')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Ver Avaliação
                      </button>
                    </div>
                  )}

                  {/* Cards de Resumo */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-gray-400 text-[11px] font-semibold block uppercase tracking-wider">
                        Renda Familiar
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700 mt-1 block">
                        {faixaRendaParsed}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-gray-400 text-[11px] font-semibold block uppercase tracking-wider">
                        Composição Domiciliar
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700 mt-1 block">
                        {isSituacaoRua
                          ? 'Em Situação de Rua'
                          : `${assistido.composicao_familiar || 1} pessoas`}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-gray-400 text-[11px] font-semibold block uppercase tracking-wider">
                        Filhos Dependentes
                      </span>
                      <span className="text-sm font-extrabold text-pink-700 mt-1 block">
                        {moradiaParsed.filhos !== ''
                          ? `${moradiaParsed.filhos} filhos`
                          : assistido.quantidade_filhos !== undefined &&
                            assistido.quantidade_filhos !== null
                          ? `${assistido.quantidade_filhos} filhos`
                          : 'Não informado'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                      <span className="text-gray-400 text-[11px] font-semibold block uppercase tracking-wider">
                        Internet em Casa
                      </span>
                      <span
                        className={`text-sm font-extrabold mt-1 block ${
                          assistido.acesso_internet === 'Sim'
                            ? 'text-indigo-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {assistido.acesso_internet || 'Não informada'}
                      </span>
                    </div>
                  </div>

                  {/* Informações Pessoais e Residenciais */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      Identificação Civil e Residencial
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 font-semibold block">Nome Completo:</span>
                        <span className="font-bold text-gray-900">{assistido.nome_completo}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">CPF:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.cpf || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">RG:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.rg || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Cartão do SUS:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.cartao_sus || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Uso de Imagem / Voz:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.autoriza_imagem === false || assistido.autoriza_imagem === 'Não'
                            ? 'Não autorizado'
                            : 'Autorizado institucionalmente'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Data de Nascimento:</span>
                        <span className="font-medium text-gray-800">
                          {formatDate(assistido.data_nascimento)}
                          {assistido.idade ? ` (${assistido.idade} anos)` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Telefone / WhatsApp:</span>
                        <span className="font-bold text-emerald-700">
                          {assistido.telefone || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Raça / Cor:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.raca_cor || 'Não informada'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Escolaridade:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.escolaridade || 'Não informada'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Estado Civil:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.estado_civil || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">CRAS de Referência:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.possui_cras
                            ? `Sim (${assistido.bairro_cras || 'Bairro não especificado'})`
                            : 'Não possui cadastro no CRAS'}
                        </span>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-gray-400 font-semibold block">Endereço:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.endereco || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Bairro:</span>
                        <span className="font-medium text-gray-800">
                          {assistido.bairro || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Data de Ingresso no FLH:</span>
                        <span className="font-bold text-gray-900">
                          {formatDate(assistido.data_ingresso || assistido.created_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Status do Acompanhamento:</span>
                        <span className="mt-0.5 block">
                          {renderStatusBadge(assistido.status_curso)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Data de Saída / Desligamento:</span>
                        <span className="font-medium text-gray-800">
                          {getAssistidoDataSaida(assistido)
                            ? formatDate(getAssistidoDataSaida(assistido))
                            : 'Em acompanhamento ativo'}
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
                    </div>
                  </div>

                  {/* Trabalho, Renda e Moradia */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      Trabalho, Renda Familiar e Moradia
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
                            ? 'Sim (Atividade Ativa)'
                            : 'Não (Desempregado / Sem Ocupação)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Ocupação / Ramo:</span>
                        <span className="font-medium text-gray-900">
                          {trabalhoParsed.ocupacao}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">
                          Turno e Dias de Trabalho:
                        </span>
                        <span className="font-medium text-gray-800">
                          {trabalhoParsed.turno} (Dias: {trabalhoParsed.dias})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Faixa de Renda:</span>
                        <span className="font-bold text-emerald-800">{faixaRendaParsed}</span>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-gray-400 font-semibold block">
                          Programas Sociais Recebidos:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Array.isArray(assistido.beneficios_sociais) &&
                          assistido.beneficios_sociais.length > 0 ? (
                            assistido.beneficios_sociais.map((prog, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-medium text-[11px]"
                              >
                                {prog}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Nenhum registrado</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Tipo de Moradia:</span>
                        <span className="font-medium text-gray-800">{moradiaParsed.tipo}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Água e Energia:</span>
                        <span className="font-medium text-gray-800">
                          Água: {moradiaParsed.agua} | Luz: {moradiaParsed.energia}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block">Serviços Básicos:</span>
                        <span className="font-medium text-gray-800">
                          {moradiaParsed.servicosGerais}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Núcleo Familiar & Projetos (Resumo com badges) */}
                  {renderFamilyMembersSummaryCard()}
                </div>
              )}
    </>
  );
}
