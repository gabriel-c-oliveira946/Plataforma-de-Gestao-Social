import { getAssistidoMotivoEvasao, getAssistidoDataSaida } from '../../utils/avaliacao4Meses';
import { User, AlertTriangle } from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Aba de identificação civil. */
export function AbaIdentificacao({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    activeTab,
    formatDate,
    renderStatusBadge
  } = ctx;

  return (
    <>
              {/* ABA 1: IDENTIFICAÇÃO CIVIL */}
              {activeTab === 'identificacao' && (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    Dados Civis, Documentais e CRAS
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
                      <span className="text-gray-400 font-semibold block">Cadastro no CRAS:</span>
                      <span className="font-medium text-gray-800">
                        {assistido.possui_cras
                          ? `Sim (${assistido.bairro_cras || 'Bairro do CRAS não informado'})`
                          : 'Não possui cadastro no CRAS'}
                      </span>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-400 font-semibold block">Endereço Residencial:</span>
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
                      <span className="mt-1 block">
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
              )}
    </>
  );
}
