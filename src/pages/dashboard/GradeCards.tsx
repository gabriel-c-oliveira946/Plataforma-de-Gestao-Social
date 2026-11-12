import { Assistido } from '../../components/VerFichaModal';
import { isPendenteAvaliacao4Meses, isPendenteEntrevistaDomiciliar1Ano, getAssistidoMotivoEvasao } from '../../utils/avaliacao4Meses';
import {
  User as UserIcon,
  MapPin,
  Calendar,
  GraduationCap,
  Trash2,
  Eye,
  Phone,
  Home,
  HeartPulse,
  Users,
  DollarSign,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { getAssistidoDataSaida, getAssistidoFilhos, getAssistidoFaixaRenda } from '../../utils/camposAssistido';
import type { DashboardCtx } from './useDashboard';

/** Lista de assistidos em cards. */
export function GradeCards({ ctx }: { ctx: DashboardCtx }) {
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
        {/* GRID DE CARDS DE ASSISTIDOS (Modo Cards) */}
        {!loading && filteredAssistidos.length > 0 && viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssistidos.map((assistido) => {
              const isSituacaoRua =
                assistido.tipo_moradia === 'Em situação de rua' ||
                assistido.endereco === 'Em situação de rua';

              return (
                <div
                  key={assistido.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Conteúdo Principal do Card */}
                  <div className="p-5 space-y-3.5">
                    {/* Topo: Foto / Avatar + Nome + Status */}
                    <div className="flex items-start gap-3.5">
                      {/* Foto ou Avatar padrão */}
                      <div className="relative shrink-0">
                        {assistido.foto_url ? (
                          <img
                            src={assistido.foto_url}
                            alt={assistido.nome_completo}
                            className="w-13 h-13 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                          />
                        ) : (
                          <div className="w-13 h-13 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-base font-heading">
                            {assistido.nome_completo
                              ? assistido.nome_completo.charAt(0).toUpperCase()
                              : <UserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />}
                          </div>
                        )}
                      </div>

                      {/* Nome, Idade e Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          {renderStatusBadge(assistido.status_curso)}
                          {getAssistidoMotivoEvasao(assistido) && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 truncate max-w-[200px]"
                              title={`Motivo da Evasão: ${getAssistidoMotivoEvasao(assistido)}`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span className="truncate">Evasão: {getAssistidoMotivoEvasao(assistido)}</span>
                            </span>
                          )}
                        </div>
                        {isPendenteAvaliacao4Meses(assistido) && (
                          <div className="mb-1.5">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs"
                              title="Assistido com mais de 120 dias de curso/acolhimento ativos. Necessita registro da Avaliação de 4 Meses."
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                              <span>Avaliação 4 Meses Pendente</span>
                            </span>
                          </div>
                        )}
                        {isPendenteEntrevistaDomiciliar1Ano(assistido) && (
                          <div className="mb-1.5">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs"
                              title="Assistido ativo há 1 ano ou mais (>= 365 dias). Necessita registro da Entrevista Domiciliar."
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                              <span>Pendente Entrevista Domiciliar (1 Ano)</span>
                            </span>
                          </div>
                        )}
                        <h3
                          className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-1 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition font-heading"
                          title={assistido.nome_completo}
                        >
                          {assistido.nome_completo}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {assistido.idade !== null && assistido.idade !== undefined
                            ? `${assistido.idade} anos`
                            : 'Idade não informada'}{' '}
                          {assistido.raca_cor && `• ${assistido.raca_cor}`}
                        </p>
                      </div>
                    </div>

                    {/* Tags Visuais Especiais (Situação de Rua / PcD) */}
                    {(isSituacaoRua || assistido.possui_deficiencia) && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {isSituacaoRua && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Home className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            Em situação de rua
                          </span>
                        )}
                        {assistido.possui_deficiencia && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <HeartPulse className="w-3 h-3 text-indigo-700 dark:text-indigo-400" />
                            Possui deficiência (PcD)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Informações Resumidas com Ícones */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {/* Bairro / Localidade */}
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                        <span className="truncate">
                          {isSituacaoRua
                            ? 'Sem moradia fixa (Situação de Rua)'
                            : assistido.bairro || assistido.endereco || 'Bairro não informado'}
                        </span>
                      </div>

                      {/* Oficina / Curso */}
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {assistido.curso_pretendido || 'Não vinculada'}
                        </span>
                      </div>

                      {/* Faixa de Renda Familiar */}
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span>
                          Renda:{' '}
                          <strong className="text-emerald-800 dark:text-emerald-400 font-bold">
                            {getAssistidoFaixaRenda(assistido)}
                          </strong>
                        </span>
                      </div>

                      {/* Composição Familiar e Filhos */}
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                        <span>
                          Família: <strong>{assistido.composicao_familiar || 1}</strong> {assistido.composicao_familiar === 1 ? 'pessoa' : 'pessoas'}
                          {getAssistidoFilhos(assistido) !== null && (
                            <> • <strong>{getAssistidoFilhos(assistido)}</strong> {getAssistidoFilhos(assistido) === 1 ? 'filho' : 'filhos'}</>
                          )}
                        </span>
                      </div>

                      {/* Ocupação / Trabalho */}
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                        <span className="truncate">
                          {assistido.atividade_remunerada === 'Sim'
                            ? 'Atividade remunerada ativa'
                            : 'Sem ocupação formal'}
                          {assistido.acesso_internet && ` • Internet: ${assistido.acesso_internet}`}
                        </span>
                      </div>

                      {/* Data de Ingresso */}
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                        <span>
                          Ingresso:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {formatDate(assistido.data_ingresso || assistido.created_at)}
                          </strong>
                        </span>
                      </div>

                      {/* Data de Saída / Desligamento (se houver) */}
                      {getAssistidoDataSaida(assistido) && (
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                          <Calendar className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                          <span>
                            Saída:{' '}
                            <strong className="text-rose-800 dark:text-rose-300">
                              {formatDate(getAssistidoDataSaida(assistido))}
                            </strong>
                          </span>
                        </div>
                      )}

                      {/* Telefone (se houver) */}
                      {assistido.telefone && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span>{assistido.telefone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rodapé do Card com Ações */}
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                    {/* Botão Ver / Editar Ficha */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(assistido)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      {canEdit ? 'Ver / Editar Ficha' : 'Ver Ficha'}
                    </button>

                    {/* Botão Excluir (Apenas Admin) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setAssistidoToDelete(assistido)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md text-xs font-medium transition cursor-pointer"
                        title="Excluir Assistido (Permissão Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </>
  );
}
