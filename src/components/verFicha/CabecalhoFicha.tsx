import { getAssistidoMotivoEvasao } from '../../utils/avaliacao4Meses';
import {
  X,
  Home,
  AlertTriangle,
  Edit3,
  Save,
  Lock,
  Sparkles,
  Eye,
  Award,
  ZoomIn
} from 'lucide-react';
import type { FichaCtx } from './useVerFicha';
import { autorizacaoImagem } from '../../utils/familia';
import { SeloOutroModuloPorCpf } from '../vinculo/VinculoCpf';

/** Cabeçalho: foto, dados principais e ações rápidas. */
export function CabecalhoFicha({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    onClose,
    canEdit,
    canEvaluate,
    setFotoZoomUrl,
    isEditingData,
    activeTab,
    setActiveTab,
    editFormData,
    existingAvaliacao,
    isPendente4Meses,
    setIsEditingAvaliacao,
    isPendente1Ano,
    existingEntrevista1Ano,
    setIsEntrevistaModalOpen,
    fotoPreview,
    savingEdit,
    handleStartEdit,
    handleCancelEdit,
    handleSaveFullEdit,
    renderStatusBadge
  } = ctx;

  return (
    <>
        {/* Cabeçalho do Modal Compacto e Responsivo */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2.5 bg-slate-50/80 dark:bg-slate-800/80 flex-shrink-0">
          {/* Linha Superior: Foto, Dados Principais e Botão Fechar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-emerald-600/30 dark:border-emerald-500/40 shadow-md flex-shrink-0 relative group cursor-pointer"
                onClick={() => {
                  const targetUrl = fotoPreview || assistido.foto_url;
                  if (targetUrl) {
                    setFotoZoomUrl(targetUrl);
                  }
                }}
                role="button"
                tabIndex={0}
                title={fotoPreview || assistido.foto_url ? 'Clique para ampliar a foto' : undefined}
              >
                {fotoPreview || assistido.foto_url ? (
                  <>
                    <img
                      src={fotoPreview || assistido.foto_url || ''}
                      alt={assistido.nome_completo}
                      className="w-full h-full object-cover transition transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-1 text-center">
                      <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                      <span className="text-[9px] font-bold leading-tight drop-shadow hidden sm:inline">Ampliar</span>
                    </div>
                    <div className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 text-white backdrop-blur-xs group-hover:hidden">
                      <ZoomIn className="w-3 h-3" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-emerald-700 text-white flex flex-col items-center justify-center font-bold shadow-sm">
                    <span className="text-xl sm:text-3xl">
                      {assistido.nome_completo ? assistido.nome_completo.charAt(0).toUpperCase() : 'A'}
                    </span>
                    <span className="text-[9px] font-normal text-emerald-100 mt-0.5">Sem foto</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="font-heading text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                    {assistido.nome_completo}
                  </h3>
                  {renderStatusBadge(
                    isEditingData ? editFormData.status_atendimento : assistido.status_curso
                  )}
                  {(() => {
                    const termo = isEditingData ? editFormData.autoriza_imagem : autorizacaoImagem(assistido);
                    if (termo === 'Não') {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-950/90 dark:text-red-300 rounded-full text-xs font-extrabold border border-red-300 dark:border-red-700 shadow-2xs">
                          <span>🚫</span>
                          <span>NÃO Autoriza Uso de Imagem</span>
                        </span>
                      );
                    }
                    if (termo === 'Sim') {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                          <span>📷</span>
                          <span>Autoriza Uso de Imagem</span>
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-300 dark:border-amber-700 shadow-2xs">
                        <span>❔</span>
                        <span>Uso de Imagem Não Informado</span>
                      </span>
                    );
                  })()}
                  <SeloOutroModuloPorCpf cpf={assistido.cpf} tipoAtual="assistido" />
                  {isEditingData && (
                    <span className="px-2 py-0.5 bg-amber-600 text-white text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider shadow-2xs">
                      Modo Edição Ativo
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 flex flex-wrap items-center gap-x-2">
                  <span>
                    Oficina:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      {isEditingData
                        ? editFormData.oficina_pretendida
                        : assistido.curso_pretendido || 'Geral'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>CPF: {assistido.cpf || 'Não informado'}</span>
                </p>
                {getAssistidoMotivoEvasao(assistido) && (
                  <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 rounded-lg text-xs text-amber-950 dark:text-amber-200 w-fit shadow-2xs animate-fadeIn">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      Motivo da Evasão: <strong className="font-bold underline decoration-amber-400">"{getAssistidoMotivoEvasao(assistido)}"</strong>
                    </span>
                  </div>
                )}
                {isPendente1Ano && (
                  <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 rounded-lg text-xs font-bold text-amber-950 dark:text-amber-200 w-fit shadow-2xs animate-fadeIn">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Pendente Entrevista Domiciliar (1 Ano)</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer flex-shrink-0"
              title="Fechar Janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Linha de Ações Rápidas (Organizada em linha no mobile para poupar espaço) */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none w-full">
            {!isEditingData ? (
              <div className="flex flex-wrap items-center gap-2 w-full">
                {/* Botão de Acesso Direto às Avaliações & Entrevistas no Topo */}
                <button
                  type="button"
                  onClick={() => setActiveTab('avaliacao')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    activeTab === 'avaliacao'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : isPendente4Meses || isPendente1Ano
                      ? 'bg-amber-500 hover:bg-amber-600 text-white font-extrabold animate-pulse'
                      : 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                  }`}
                  title="Acessar painel de Avaliações de 4 Meses e Entrevistas Domiciliares de 1 Ano"
                >
                  <Award className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-300" />
                  <span className="truncate">Avaliações & Entrevistas</span>
                  {isPendente4Meses || isPendente1Ano ? (
                    <span className="bg-amber-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0">
                      Pendente
                    </span>
                  ) : existingAvaliacao || existingEntrevista1Ano ? (
                    <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0">
                      Realizada
                    </span>
                  ) : null}
                </button>

                {canEvaluate && isPendente1Ano && (
                  <button
                    type="button"
                    onClick={() => setIsEntrevistaModalOpen(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white animate-pulse transition shadow-xs cursor-pointer"
                    title="Registrar Visita/Entrevista Domiciliar de 1 Ano Pendente"
                  >
                    <Home className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span className="truncate">Registrar Entrevista Domiciliar (1 Ano)</span>
                  </button>
                )}

                {canEvaluate && isPendente4Meses && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('avaliacao');
                      setIsEditingAvaliacao(true);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white animate-pulse transition shadow-xs cursor-pointer"
                    title="Registrar Avaliação de 4 Meses Pendente"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span className="truncate">Avaliação 4 Meses</span>
                  </button>
                )}

                {canEdit ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg border border-emerald-500 ring-2 ring-emerald-500/20 cursor-pointer transform hover:-translate-y-0.5"
                    title="Editar informações completas nas 5 Abas do cadastro"
                  >
                    <Edit3 className="w-4 h-4 shrink-0 text-white" />
                    <span>Editar Ficha (5 Abas)</span>
                  </button>
                ) : (
                  <span
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    title="Perfil Recepção tem permissão apenas para cadastro inicial e consulta"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Consulta (Recepção)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingEdit}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Modo Leitura</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveFullEdit}
                  disabled={savingEdit}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
