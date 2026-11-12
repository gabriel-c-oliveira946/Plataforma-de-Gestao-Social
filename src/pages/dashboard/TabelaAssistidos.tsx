import { Assistido } from '../../components/VerFichaModal';
import {
  isPendenteAvaliacao4Meses,
  isPendenteEntrevistaDomiciliar1Ano,
  hasAvaliacao4Meses,
  getDiasIngresso,
  getAssistidoMotivoEvasao
} from '../../utils/avaliacao4Meses';
import {
  GraduationCap,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { DashboardCtx } from './useDashboard';

/** Lista de assistidos em tabela. */
export function TabelaAssistidos({ ctx }: { ctx: DashboardCtx }) {
  const {
    canEdit,
    loading,
    viewMode,
    setAssistidoToDelete,
    isAdmin,
    filteredAssistidos,
    formatDate,
    renderStatusBadge,
    handleOpenDetails
  } = ctx;

  return (
    <>
        {/* TABELA DE ASSISTIDOS (Modo Tabela) */}
        {!loading && filteredAssistidos.length > 0 && viewMode === 'table' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-heading">
                    <th scope="col" className="py-3 px-4">Assistido</th>
                    <th scope="col" className="py-3 px-4">Status</th>
                    <th scope="col" className="py-3 px-4">Avaliação 4 Meses</th>
                    <th scope="col" className="py-3 px-4">Oficina</th>
                    <th scope="col" className="py-3 px-4">Localidade</th>
                    <th scope="col" className="py-3 px-4">Data Ingresso</th>
                    <th scope="col" className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs text-slate-800 dark:text-slate-200">
                  {filteredAssistidos.map((assistido) => {
                    const isPendente = isPendenteAvaliacao4Meses(assistido);
                    const isPendente1Ano = isPendenteEntrevistaDomiciliar1Ano(assistido);
                    const isConcluida = hasAvaliacao4Meses(assistido);
                    const dias = getDiasIngresso(assistido.data_ingresso, assistido.created_at);
                    const isSituacaoRua =
                      assistido.tipo_moradia === 'Em situação de rua' ||
                      assistido.endereco === 'Em situação de rua';

                    return (
                      <tr
                        key={assistido.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                          isPendente || isPendente1Ano ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        {/* Assistido Foto & Nome */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {assistido.foto_url ? (
                              <img
                                src={assistido.foto_url}
                                alt={assistido.nome_completo}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 font-heading">
                                {assistido.nome_completo ? assistido.nome_completo.charAt(0).toUpperCase() : 'A'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-emerald-700 transition font-heading">
                                {assistido.nome_completo}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {assistido.idade ? `${assistido.idade} anos` : 'Idade não informada'}
                                {assistido.cpf ? ` • CPF: ${assistido.cpf}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {renderStatusBadge(assistido.status_curso)}
                            {getAssistidoMotivoEvasao(assistido) && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 max-w-[200px] truncate"
                                title={`Motivo da Evasão: ${getAssistidoMotivoEvasao(assistido)}`}
                              >
                                <span className="font-bold">Motivo:</span> <span className="truncate">{getAssistidoMotivoEvasao(assistido)}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Avaliação 4 Meses e Acompanhamento */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            {isPendente1Ano && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
                                <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                                <span>Pendente Entrevista Domiciliar (1 Ano)</span>
                              </span>
                            )}
                            {isPendente ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
                                <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                                <span>Avaliação 4 Meses Pendente</span>
                              </span>
                            ) : isConcluida ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                Avaliação Concluída
                              </span>
                            ) : !isPendente1Ano ? (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {dias !== null ? `${dias} dias (< 120 dias)` : 'Em acompanhamento'}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Oficina */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium truncate max-w-[160px]">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{assistido.curso_pretendido || 'Não vinculada'}</span>
                          </div>
                        </td>

                        {/* Localidade */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                          {isSituacaoRua ? 'Situação de Rua' : assistido.bairro || assistido.endereco || 'Não informado'}
                        </td>

                        {/* Data Ingresso */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(assistido.data_ingresso || assistido.created_at)}
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(assistido)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 text-xs font-semibold rounded-md shadow-2xs transition"
                            >
                              <Eye className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                              {canEdit ? 'Ver / Editar' : 'Ver Ficha'}
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setAssistidoToDelete(assistido)}
                                className="p-1 text-slate-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition"
                                title="Excluir Assistido"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </>
  );
}
