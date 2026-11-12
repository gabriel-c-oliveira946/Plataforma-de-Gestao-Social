import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOperadorInfo } from '../../utils/equipe';
import {
  isPendenteAvaliacao4Meses,
  isPendenteEntrevistaDomiciliar1Ano,
  getEntrevistaDomiciliar1Ano,
  getAvaliacao4Meses,
  getAssistidoMotivoEvasao
} from '../../utils/avaliacao4Meses';
import { supabase } from '../../lib/supabase/client';
import { assistidosService } from '../../services/assistidosService';
import { useToast } from '../../context/ToastContext';
import { CadastroFormData, MembroFamilia } from '../../types/cadastro';
import type { Assistido } from './tipos';
import { convertAssistidoToFormData } from './converterParaFormulario';
import { calcularDerivados } from './derivados';
import { criarAcoesDeSalvamento } from './acoesSalvamento';
import { criarRenderizadores } from './renderizadores';

export interface VerFichaModalProps {
  assistido: Assistido;
  onClose: () => void;
  onDelete?: (assistido: Assistido) => void;
  isAdmin: boolean;
  onAssistidoUpdated: (updated: Assistido) => void;
}

/**
 * Estado, efeitos e ações da ficha do assistido. As partes visuais
 * (abas, rodapé, impressão e modais) recebem o retorno deste hook.
 */
function useVerFichaBase({
  assistido,
  onClose,
  onDelete,
  isAdmin,
  onAssistidoUpdated
}: VerFichaModalProps) {
  const { user, profile, displayName, canEdit, canEvaluate, canDelete } = useAuth();
  const toast = useToast();
  const canUserDelete = isAdmin || canDelete;
  const [showDirectConfirmModal, setShowDirectConfirmModal] = useState(false);
  const [fotoZoomUrl, setFotoZoomUrl] = useState<string | null>(null);

  // Fecha o Lightbox da foto ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fotoZoomUrl) {
        setFotoZoomUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fotoZoomUrl]);

  // Auditoria do Operador (Requisito 3): Consulta na tabela 'profiles' usando o ID do operador
  const [operadorCadastro, setOperadorCadastro] = useState<{ nome: string; cargo: string }>(() =>
    getOperadorInfo(assistido.criado_por, user)
  );

  const [operadorAtualizacao, setOperadorAtualizacao] = useState<{ nome: string; cargo: string }>(() =>
    getOperadorInfo(assistido.atualizado_por || assistido.criado_por, user)
  );

  useEffect(() => {
    let isCancelled = false;

    async function carregarAuditoriaProfiles() {
      const fallbackCadastro = getOperadorInfo(assistido.criado_por, user);
      const fallbackAtualizacao = getOperadorInfo(
        assistido.atualizado_por || assistido.criado_por,
        user
      );

      const idCadastro = assistido.criado_por?.trim();
      const idAtualizacao = (assistido.atualizado_por || assistido.criado_por)?.trim();

      const idsToFetch = Array.from(
        new Set([idCadastro, idAtualizacao].filter((id): id is string => Boolean(id)))
      );

      if (idsToFetch.length === 0) {
        if (!isCancelled) {
          setOperadorCadastro(fallbackCadastro);
          setOperadorAtualizacao(fallbackAtualizacao);
        }
        return;
      }

      try {
        // Consulta direta na tabela 'profiles' usando o ID do operador
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, cargo, role')
          .in('id', idsToFetch);

        if (!error && data && data.length > 0) {
          const map = new Map<string, { nome: string; cargo: string }>();
          data.forEach((p: any) => {
            const roleFormatted =
              p.cargo && p.cargo !== 'Inativo'
                ? p.cargo
                : p.role === 'admin'
                ? 'Diretoria / Administrador'
                : p.role === 'recepcao'
                ? 'Recepção'
                : 'Serviço Social';

            const info = {
              nome: p.nome || 'Operador Social',
              cargo: roleFormatted
            };
            if (p.id) map.set(p.id, info);
            if (p.email) map.set(p.email.toLowerCase(), info);
          });

          if (!isCancelled) {
            if (idCadastro && map.has(idCadastro)) {
              setOperadorCadastro(map.get(idCadastro)!);
            } else {
              setOperadorCadastro(fallbackCadastro);
            }

            if (idAtualizacao && map.has(idAtualizacao)) {
              setOperadorAtualizacao(map.get(idAtualizacao)!);
            } else {
              setOperadorAtualizacao(fallbackAtualizacao);
            }
          }
          return;
        }
      } catch (err) {
        console.warn('Erro ao consultar perfis de auditoria na tabela profiles:', err);
      }

      if (!isCancelled) {
        setOperadorCadastro(fallbackCadastro);
        setOperadorAtualizacao(fallbackAtualizacao);
      }
    }

    carregarAuditoriaProfiles();

    return () => {
      isCancelled = true;
    };
  }, [assistido.criado_por, assistido.atualizado_por, user]);

  // Controle de Modo: Leitura (Visualização) vs Edição Completa (5 Abas)
  const [isEditingData, setIsEditingData] = useState<boolean>(false);

  // Aba ativa na Visualização (Modo Leitura)
  const [activeTab, setActiveTab] = useState<
    'geral' | 'identificacao' | 'trabalho' | 'moradia' | 'saude' | 'oficina' | 'avaliacao'
  >('geral');

  // Aba ativa no Modo Edição (1 a 5)
  const [editActiveTab, setEditActiveTab] = useState<number>(1);

  // Estado completo dos dados em edição (5 Abas)
  const [editFormData, setEditFormData] = useState<CadastroFormData>(() =>
    convertAssistidoToFormData(assistido)
  );

  // Estados para Avaliação de 4 Meses
  const existingAvaliacao = useMemo(
    () => getAvaliacao4Meses(assistido),
    [assistido.expectativa_curso]
  );
  const isPendente4Meses = useMemo(
    () => isPendenteAvaliacao4Meses(assistido),
    [assistido]
  );

  const [isEditingAvaliacao, setIsEditingAvaliacao] = useState<boolean>(!existingAvaliacao);
  const [dataAvaliacao, setDataAvaliacao] = useState<string>(
    () => existingAvaliacao?.data_avaliacao || new Date().toISOString().split('T')[0]
  );
  const [statusFinalCurso, setStatusFinalCurso] = useState<
    'Concluiu Oficina' | 'Desistiu (Evasão)' | 'Continua em Acompanhamento'
  >(() => {
    if (existingAvaliacao?.status_final_curso) return existingAvaliacao.status_final_curso;
    const isEvasao =
      (assistido.status_curso || '').toLowerCase().includes('desist') ||
      (assistido.status_curso || '').toLowerCase().includes('evas');
    return isEvasao ? 'Desistiu (Evasão)' : 'Concluiu Oficina';
  });
  const [motivoEvasao, setMotivoEvasao] = useState<string>(
    () => existingAvaliacao?.motivo_evasao || getAssistidoMotivoEvasao(assistido) || ''
  );
  const [impactoGerado, setImpactoGerado] = useState<
    'Conseguiu Emprego' | 'Abriu Pequeno Negócio' | 'Aumentou Renda em Casa' | 'Sem Alteração Renda' | 'Outro'
  >(() => existingAvaliacao?.impacto_gerado || 'Aumentou Renda em Casa');
  const [mudancaAutonomia, setMudancaAutonomia] = useState<string>(
    () => existingAvaliacao?.mudanca_autonomia_qualidade_vida || ''
  );
  const [savingAvaliacao, setSavingAvaliacao] = useState<boolean>(false);
  const [avaliacaoSuccessMsg, setAvaliacaoSuccessMsg] = useState<string | null>(null);
  const [avaliacaoErrorMsg, setAvaliacaoErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const av = getAvaliacao4Meses(assistido);
    if (av) {
      setDataAvaliacao(av.data_avaliacao);
      setStatusFinalCurso(av.status_final_curso);
      setMotivoEvasao(av.motivo_evasao || getAssistidoMotivoEvasao(assistido) || '');
      setImpactoGerado(av.impacto_gerado);
      setMudancaAutonomia(av.mudanca_autonomia_qualidade_vida);
      setIsEditingAvaliacao(false);
    } else {
      setDataAvaliacao(new Date().toISOString().split('T')[0]);
      const existingMotive = getAssistidoMotivoEvasao(assistido);
      const isEvasao =
        (assistido.status_curso || '').toLowerCase().includes('desist') ||
        (assistido.status_curso || '').toLowerCase().includes('evas');
      setStatusFinalCurso(isEvasao ? 'Desistiu (Evasão)' : 'Concluiu Oficina');
      setMotivoEvasao(existingMotive || '');
      setImpactoGerado('Aumentou Renda em Casa');
      setMudancaAutonomia('');
      setIsEditingAvaliacao(true);
    }
  }, [assistido]);

  // Estados para Entrevista Domiciliar (1 Ano)
  const isPendente1Ano = useMemo(
    () => isPendenteEntrevistaDomiciliar1Ano(assistido),
    [assistido]
  );

  const existingEntrevista1Ano = useMemo(
    () => getEntrevistaDomiciliar1Ano(assistido),
    [assistido.expectativa_curso]
  );

  const [isEntrevistaModalOpen, setIsEntrevistaModalOpen] = useState<boolean>(false);
  const [dataVisita, setDataVisita] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState<string>(() => profile?.nome || displayName || 'Serviço Social');
  const [evolucaoSituacao, setEvolucaoSituacao] = useState<string>('Mantém / Sem alterações significativas');
  const [observacoesEvolucaoLar, setObservacoesEvolucaoLar] = useState<string>('');
  const [statusPosVisita, setStatusPosVisita] = useState<
    'Manter em Acompanhamento' | 'Pausado' | 'Desligado'
  >('Manter em Acompanhamento');
  const [savingEntrevista, setSavingEntrevista] = useState<boolean>(false);

  useEffect(() => {
    if (existingEntrevista1Ano) {
      setDataVisita(existingEntrevista1Ano.data_visita);
      setTecnicoResponsavel(existingEntrevista1Ano.tecnico_responsavel);
      setEvolucaoSituacao(existingEntrevista1Ano.evolucao_situacao || 'Mantém / Sem alterações significativas');
      setObservacoesEvolucaoLar(existingEntrevista1Ano.observacoes_evolucao_lar || existingEntrevista1Ano.parecer_observacoes || '');
      setStatusPosVisita(
        existingEntrevista1Ano.status_pos_visita?.includes('Deslig')
          ? 'Desligado'
          : existingEntrevista1Ano.status_pos_visita?.includes('Paus')
          ? 'Pausado'
          : 'Manter em Acompanhamento'
      );
    }
  }, [existingEntrevista1Ano]);

  // Manipulação de Foto no Modo de Edição
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(assistido.foto_url || null);

  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const handleStartEdit = () => {
    setEditFormData(convertAssistidoToFormData(assistido));
    setFotoPreview(assistido.foto_url || null);
    setFotoFile(null);
    setEditActiveTab(1);
    setIsEditingData(true);
    setSaveErrorMsg(null);
  };

  const handleCancelEdit = () => {
    setIsEditingData(false);
    setEditFormData(convertAssistidoToFormData(assistido));
    setFotoPreview(assistido.foto_url || null);
    setFotoFile(null);
    setSaveErrorMsg(null);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSaveErrorMsg('O arquivo selecionado deve ser uma imagem válida (JPG, PNG ou WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setSaveErrorMsg('A imagem é muito grande. Escolha uma foto de até 8MB.');
      return;
    }
    setFotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFotoPreview(previewUrl);
    setSaveErrorMsg(null);
  };

  const handleRemoveFoto = () => {
    setFotoFile(null);
    if (fotoPreview && fotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(fotoPreview);
    }
    setFotoPreview(null);
    setEditFormData((prev) => ({ ...prev, foto_url: null }));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 600;
          let width = image.width;
          let height = image.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(image, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(dataUrl);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        };
        image.onerror = () => {
          resolve(readerEvent.target?.result as string);
        };
        image.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Não informada';
    try {
      const parts = dateString.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'Não registrada';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (val?: number | null) => {
    if (val === null || val === undefined) return 'Não informada';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const [deletingFicha, setDeletingFicha] = useState(false);

  const handleDeleteAction = () => {
    if (!canUserDelete) return;

    if (onDelete) {
      onDelete(assistido);
      return;
    }

    setShowDirectConfirmModal(true);
  };

  const handleExecuteDirectDelete = async () => {
    setDeletingFicha(true);
    try {
      await assistidosService.delete(assistido.id);
      toast.success('Ficha removida com sucesso!', `${assistido.nome_completo} foi removido do sistema.`);
      setShowDirectConfirmModal(false);
      onClose();
    } catch (err: any) {
      console.error('Erro ao excluir assistido:', err);
      const msg = err?.message || 'Não foi possível excluir o cadastro.';
      toast.error('Erro ao excluir ficha', msg);
    } finally {
      setDeletingFicha(false);
    }
  };

  // Membros do Núcleo Familiar e Dependentes
  const membrosFamilia: MembroFamilia[] = useMemo(() => {
    if (Array.isArray(assistido.membros_familia) && assistido.membros_familia.length > 0) {
      return assistido.membros_familia;
    }
    if (assistido.expectativa_curso) {
      const match = assistido.expectativa_curso.match(/\[Membros da Fam[íi]lia:\s*(\[.*?\])\]/i);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1]);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [];
  }, [assistido.membros_familia, assistido.expectativa_curso]);

  return {
    assistido,
    onClose,
    onDelete,
    isAdmin,
    onAssistidoUpdated,
    user,
    profile,
    displayName,
    canEdit,
    canEvaluate,
    canDelete,
    toast,
    canUserDelete,
    showDirectConfirmModal,
    setShowDirectConfirmModal,
    fotoZoomUrl,
    setFotoZoomUrl,
    operadorCadastro,
    setOperadorCadastro,
    operadorAtualizacao,
    setOperadorAtualizacao,
    isEditingData,
    setIsEditingData,
    activeTab,
    setActiveTab,
    editActiveTab,
    setEditActiveTab,
    editFormData,
    setEditFormData,
    existingAvaliacao,
    isPendente4Meses,
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
    setSavingAvaliacao,
    avaliacaoSuccessMsg,
    setAvaliacaoSuccessMsg,
    avaliacaoErrorMsg,
    setAvaliacaoErrorMsg,
    isPendente1Ano,
    existingEntrevista1Ano,
    isEntrevistaModalOpen,
    setIsEntrevistaModalOpen,
    dataVisita,
    setDataVisita,
    tecnicoResponsavel,
    setTecnicoResponsavel,
    evolucaoSituacao,
    setEvolucaoSituacao,
    observacoesEvolucaoLar,
    setObservacoesEvolucaoLar,
    statusPosVisita,
    setStatusPosVisita,
    savingEntrevista,
    setSavingEntrevista,
    fotoFile,
    setFotoFile,
    fotoPreview,
    setFotoPreview,
    savingEdit,
    setSavingEdit,
    saveSuccessMsg,
    setSaveSuccessMsg,
    saveErrorMsg,
    setSaveErrorMsg,
    handleStartEdit,
    handleCancelEdit,
    handleFileSelect,
    handleRemoveFoto,
    convertFileToBase64,
    formatDate,
    formatDateTime,
    formatCurrency,
    deletingFicha,
    setDeletingFicha,
    handleDeleteAction,
    handleExecuteDirectDelete,
    membrosFamilia
  };
}

export type FichaBase = ReturnType<typeof useVerFichaBase>;

/**
 * Estado, efeitos e ações da ficha do assistido. As partes visuais
 * (abas, rodapé, impressão e modais) recebem o retorno deste hook.
 */
export function useVerFicha(props: VerFichaModalProps) {
  const base = useVerFichaBase(props);
  const comDerivados = { ...base, ...calcularDerivados(base) };
  const comAcoes = { ...comDerivados, ...criarAcoesDeSalvamento(comDerivados) };
  return { ...comAcoes, ...criarRenderizadores(comAcoes) };
}

export type FichaCtx = ReturnType<typeof useVerFicha>;
