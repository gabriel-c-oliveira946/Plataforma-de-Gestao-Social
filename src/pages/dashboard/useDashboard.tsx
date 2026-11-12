import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { assistidosService } from '../../services/assistidosService';
import { Assistido } from '../../components/VerFichaModal';
import { calculateExactAge } from '../../components/QuadroResumoModal';
import { exportAssistidosToCSV } from '../../utils/exportUtils';
import {
  isPendenteAvaliacao4Meses,
  isPendenteEntrevistaDomiciliar1Ano,
  hasAvaliacao4Meses,
  isStatusAtivo,
  getDiasIngresso
} from '../../utils/avaliacao4Meses';
import { getAssistidoFilhos, getAssistidoFaixaRenda } from '../../utils/camposAssistido';

/** Estado, filtros, carregamento e ações do painel de assistidos. */
export function useDashboard() {
  const { user, canDelete, canEdit } = useAuth();
  const toast = useToast();

  // Estados principais de dados
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados de busca e filtros (painel recolhido por padrão)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterLocalidade, setFilterLocalidade] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filtros detalhados do formulário
  const [filterComposicao, setFilterComposicao] = useState<string>('Todos');
  const [filterFilhos, setFilterFilhos] = useState<string>('Todos');
  const [filterFaixaRenda, setFilterFaixaRenda] = useState<string>('Todas as Faixas');
  const [filterSaudeFamilia, setFilterSaudeFamilia] = useState<string>('Todas');
  const [filterServicosFLH, setFilterServicosFLH] = useState<string>('Todos');
  const [filterOcupacao, setFilterOcupacao] = useState<string>('Todos');
  const [filterInternet, setFilterInternet] = useState<string>('Todos');
  const [filterUsoImagem, setFilterUsoImagem] = useState<string>('Todos os Termos');
  const [filterFaixaEtaria, setFilterFaixaEtaria] = useState<string>('Todas as Idades');

  // Filtros complementares
  const [filterOficina, setFilterOficina] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos os Status');
  const [filterAvaliacao, setFilterAvaliacao] = useState<string>('Todos');
  const [filterAno, setFilterAno] = useState<string>('Todos os Anos');
  const [filterDataInicial, setFilterDataInicial] = useState<string>('');
  const [filterDataFinal, setFilterDataFinal] = useState<string>('');

  // Modo de visualização: Grade de Cards ou Tabela
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal de Detalhes / Ficha Completa
  const [selectedAssistido, setSelectedAssistido] = useState<Assistido | null>(null);

  // Modal do Quadro Resumo Estatístico
  const [isQuadroResumoOpen, setIsQuadroResumoOpen] = useState<boolean>(false);

  // Modal de Exclusão (Admin)
  const [assistidoToDelete, setAssistidoToDelete] = useState<Assistido | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Identificação se o usuário logado é Admin (Apenas Diretoria/Admin tem permissão de exclusão)
  const isAdmin = canDelete;

  // Carregar assistidos (com fallback offline seguro)
  const fetchAssistidos = async (showLoading: boolean = true) => {
    const shouldShow = typeof showLoading === 'boolean' ? showLoading : true;
    if (shouldShow) setLoading(true);
    setErrorMsg(null);
    try {
      const data = await assistidosService.getAll();
      setAssistidos(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar assistidos:', err);
      setErrorMsg('Não foi possível carregar a lista de assistidos no momento. Tente novamente.');
    } finally {
      if (shouldShow) setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Busca direta no banco sempre que o Dashboard for carregado
    fetchAssistidos(true);

    // 2. Re-executa sempre que a aba ganhar foco
    const handleFocus = () => {
      fetchAssistidos(false);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAssistidos(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Sincronização em tempo real via Supabase Realtime se configurado
    let channel: any = null;
    try {
      const hasUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
      if (hasUrl) {
        channel = supabase
          .channel('assistidos-realtime-dashboard')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'assistidos' },
            (payload) => {
              if (payload.eventType === 'DELETE') {
                const deletedId = (payload.old as any)?.id;
                if (deletedId) {
                  setAssistidos((prev) => prev.filter((a) => a.id !== deletedId));
                } else {
                  fetchAssistidos(false);
                }
              } else {
                fetchAssistidos(false);
              }
            }
          )
          .subscribe();
      }
    } catch (channelErr) {
      console.warn('Realtime channel não disponível:', channelErr);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, []);

  // Métricas rápidas calculadas para o topo do Dashboard
  const metrics = useMemo(() => {
    let pendentes4Meses = 0;
    let pendentesEntrevista1Ano = 0;
    let avaliacoesConcluidas = 0;
    let ativosAcompanhamento = 0;

    for (const item of assistidos) {
      if (isPendenteAvaliacao4Meses(item)) {
        pendentes4Meses++;
      }
      if (isPendenteEntrevistaDomiciliar1Ano(item)) {
        pendentesEntrevista1Ano++;
      }
      if (hasAvaliacao4Meses(item)) {
        avaliacoesConcluidas++;
      }
      if (isStatusAtivo(item.status_curso)) {
        ativosAcompanhamento++;
      }
    }

    return {
      total: assistidos.length,
      pendentes4Meses,
      pendentesEntrevista1Ano,
      avaliacoesConcluidas,
      ativosAcompanhamento
    };
  }, [assistidos]);

  // Limpeza de todos os filtros
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterLocalidade('');
    setFilterComposicao('Todos');
    setFilterFilhos('Todos');
    setFilterFaixaRenda('Todas as Faixas');
    setFilterSaudeFamilia('Todas');
    setFilterServicosFLH('Todos');
    setFilterOcupacao('Todos');
    setFilterInternet('Todos');
    setFilterUsoImagem('Todos os Termos');
    setFilterFaixaEtaria('Todas as Idades');
    setFilterOficina('Todos');
    setFilterStatus('Todos os Status');
    setFilterAvaliacao('Todos');
    setFilterAno('Todos os Anos');
    setFilterDataInicial('');
    setFilterDataFinal('');
  };

  // Contagem de filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterLocalidade.trim()) count++;
    if (filterComposicao !== 'Todos') count++;
    if (filterFilhos !== 'Todos') count++;
    if (filterFaixaRenda !== 'Todas as Faixas') count++;
    if (filterSaudeFamilia !== 'Todas') count++;
    if (filterServicosFLH !== 'Todos') count++;
    if (filterOcupacao !== 'Todos') count++;
    if (filterInternet !== 'Todos') count++;
    if (filterUsoImagem !== 'Todos os Termos') count++;
    if (filterFaixaEtaria !== 'Todas as Idades') count++;
    if (filterOficina !== 'Todos') count++;
    if (filterStatus !== 'Todos os Status') count++;
    if (filterAvaliacao !== 'Todos') count++;
    if (filterAno !== 'Todos os Anos') count++;
    if (filterDataInicial) count++;
    if (filterDataFinal) count++;
    return count;
  }, [
    filterLocalidade,
    filterComposicao,
    filterFilhos,
    filterFaixaRenda,
    filterSaudeFamilia,
    filterServicosFLH,
    filterOcupacao,
    filterInternet,
    filterUsoImagem,
    filterFaixaEtaria,
    filterOficina,
    filterStatus,
    filterAvaliacao,
    filterAno,
    filterDataInicial,
    filterDataFinal
  ]);

  // Filtragem dinâmica e precisa em tempo real
  const filteredAssistidos = useMemo(() => {
    return assistidos.filter((item) => {
      // 1. Busca textual rápida (Nome, CPF ou RG)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nomeMatch = item.nome_completo?.toLowerCase().includes(query) ?? false;
        const cleanQueryCpf = query.replace(/\D/g, '');
        const cpfMatch = cleanQueryCpf && item.cpf ? item.cpf.replace(/\D/g, '').includes(cleanQueryCpf) : false;
        const rgMatch = item.rg?.toLowerCase().includes(query) ?? false;
        if (!nomeMatch && !cpfMatch && !rgMatch) {
          return false;
        }
      }

      // 2. Filtro Localidade (Bairro / Cidade dinâmico)
      if (filterLocalidade.trim()) {
        const locQuery = filterLocalidade.toLowerCase().trim();
        const bMatch = item.bairro?.toLowerCase().includes(locQuery) ?? false;
        const endMatch = item.endereco?.toLowerCase().includes(locQuery) ?? false;
        const crasMatch = item.bairro_cras?.toLowerCase().includes(locQuery) ?? false;
        if (!bMatch && !endMatch && !crasMatch) {
          return false;
        }
      }

      // 3. Filtro Composição Familiar: [Todos] [Mora Sozinho (1 pessoa)] [2 a 4 pessoas] [5+ pessoas] [Em Situação de Rua]
      if (filterComposicao !== 'Todos') {
        const isRua =
          item.tipo_moradia?.toLowerCase().includes('rua') ||
          (item.endereco?.toLowerCase().includes('rua') &&
            item.endereco?.toLowerCase().includes('situação'));
        if (filterComposicao === 'Em Situação de Rua') {
          if (!isRua) return false;
        } else if (filterComposicao === 'Mora Sozinho (1 pessoa)') {
          if (isRua) return false;
          const comp = item.composicao_familiar || 1;
          if (comp !== 1) return false;
        } else if (filterComposicao === '2 a 4 pessoas') {
          if (isRua) return false;
          const comp = item.composicao_familiar || 1;
          if (comp < 2 || comp > 4) return false;
        } else if (filterComposicao === '5+ pessoas') {
          if (isRua) return false;
          const comp = item.composicao_familiar || 1;
          if (comp < 5) return false;
        }
      }

      // 4. Filtro Filhos: [Todos] [Sem Filhos] [Com Filhos]
      if (filterFilhos !== 'Todos') {
        const qtd = getAssistidoFilhos(item);
        if (filterFilhos === 'Sem Filhos') {
          if (qtd !== null && qtd > 0) return false;
        } else if (filterFilhos === 'Com Filhos') {
          if (qtd === null || qtd <= 0) return false;
        }
      }

      // 5. Filtro Faixa de Renda: [Todas as Faixas] [Sem Renda (R$ 0)] [Até R$ 600] [De R$ 601 a R$ 1.200] [De R$ 1.201 a R$ 2.000] [De R$ 2.001 a R$ 3.500] [De R$ 3.501 a R$ 5.000] [Acima de R$ 5.000]
      if (filterFaixaRenda !== 'Todas as Faixas') {
        const itemFaixa = getAssistidoFaixaRenda(item);
        if (itemFaixa !== filterFaixaRenda) {
          return false;
        }
      }

      // 6. Filtro Saúde na Família: [Todas] [Com Condição de Saúde Registrada] [Doença Crônica] [Dependência Química] [Saúde Mental] [Deficiência / Síndrome]
      if (filterSaudeFamilia !== 'Todas') {
        const saudeArr = Array.isArray(item.doencas_cronicas_familia)
          ? item.doencas_cronicas_familia
          : typeof item.doencas_cronicas_familia === 'string'
          ? [item.doencas_cronicas_familia]
          : [];
        const saudeStr = saudeArr.join(' ').toLowerCase();
        const hasCondicaoRegistrada =
          saudeArr.some(
            (c) =>
              c &&
              !c.toLowerCase().includes('nenhuma') &&
              !c.toLowerCase().includes('não informado')
          ) || Boolean(item.possui_deficiencia);

        if (filterSaudeFamilia === 'Com Condição de Saúde Registrada') {
          if (!hasCondicaoRegistrada) return false;
        } else if (filterSaudeFamilia === 'Doença Crônica') {
          if (!saudeStr.includes('crônica') && !saudeStr.includes('cronica')) return false;
        } else if (filterSaudeFamilia === 'Dependência Química') {
          if (!saudeStr.includes('química') && !saudeStr.includes('quimica') && !saudeStr.includes('depend')) return false;
        } else if (filterSaudeFamilia === 'Saúde Mental') {
          if (!saudeStr.includes('mental')) return false;
        } else if (filterSaudeFamilia === 'Deficiência / Síndrome') {
          const hasDef =
            Boolean(item.possui_deficiencia) ||
            saudeStr.includes('deficiên') ||
            saudeStr.includes('deficien') ||
            saudeStr.includes('síndrome') ||
            saudeStr.includes('sindrome');
          if (!hasDef) return false;
        }
      }

      // 7. Filtro Serviços da FLH: [Todos] [Ambulatório] [Psicologia] [Jurídico] [SAC] [Programas Sociais]
      if (filterServicosFLH !== 'Todos') {
        const servicos = Array.isArray(item.servicos_acompanhamento)
          ? item.servicos_acompanhamento
          : typeof item.servicos_acompanhamento === 'string'
          ? [item.servicos_acompanhamento]
          : [];
        const servicosStr = servicos.join(' ').toLowerCase();

        if (filterServicosFLH === 'Nenhum') {
          const hasNenhum =
            servicos.length === 0 ||
            servicos.some(
              (s) =>
                s.toLowerCase().includes('nenhum') ||
                s.toLowerCase().includes('nunca')
            );
          if (!hasNenhum) return false;
        } else if (filterServicosFLH === 'Programas Sociais') {
          const hasProg =
            servicosStr.includes('programa') ||
            servicosStr.includes('criança') ||
            servicosStr.includes('crianca') ||
            servicosStr.includes('adolescente') ||
            servicosStr.includes('idoso') ||
            (Array.isArray(item.beneficios_sociais) &&
              item.beneficios_sociais.some((b) => !b.toLowerCase().includes('nenhum')));
          if (!hasProg) return false;
        } else if (filterServicosFLH === 'Programa Idosos') {
          if (!servicosStr.includes('idoso')) return false;
        } else if (filterServicosFLH === 'Programa Crianças/Adolescentes') {
          if (
            !servicosStr.includes('criança') &&
            !servicosStr.includes('crianca') &&
            !servicosStr.includes('adolescente')
          ) {
            return false;
          }
        } else {
          const target = filterServicosFLH.toLowerCase();
          if (!servicosStr.includes(target)) {
            return false;
          }
        }
      }

      // 8. Filtro Ocupação / Trabalho: [Todos] [Com Atividade Remunerada] [Desempregados / Sem Ocupação]
      if (filterOcupacao !== 'Todos') {
        const isRemunerada = item.atividade_remunerada === 'Sim';
        if (filterOcupacao === 'Com Atividade Remunerada' && !isRemunerada) return false;
        if (filterOcupacao === 'Desempregados / Sem Ocupação' && isRemunerada) return false;
      }

      // 9. Filtro Acesso à Internet: [Todos] [Sim] [Não]
      if (filterInternet !== 'Todos') {
        const internetVal = (item.acesso_internet || '').toLowerCase();
        const hasInternet = internetVal === 'sim' || internetVal === 'true';
        if (filterInternet === 'Sim' && !hasInternet) return false;
        if (filterInternet === 'Não' && hasInternet) return false;
      }

      // 10. Filtro Oficina / Curso
      if (filterOficina !== 'Todos') {
        if ((item.curso_pretendido || '').toLowerCase() !== filterOficina.toLowerCase()) {
          return false;
        }
      }

      // 11. Filtro Status: [Todos os Status] [Apenas Ativos] [Apenas Concluídos] [Apenas Desistentes] [Pausados]
      if (filterStatus !== 'Todos os Status') {
        const currentStatus = (item.status_curso || '').toLowerCase();
        if (filterStatus === 'Apenas Ativos') {
          const isAtivo =
            currentStatus.includes('ativo') ||
            currentStatus.includes('acompanhamento') ||
            !currentStatus;
          if (!isAtivo) return false;
        } else if (filterStatus === 'Apenas Concluídos') {
          if (!currentStatus.includes('conclu') && !currentStatus.includes('formad')) return false;
        } else if (filterStatus === 'Apenas Desistentes') {
          if (
            !currentStatus.includes('desist') &&
            !currentStatus.includes('evas') &&
            !currentStatus.includes('trancad') &&
            !currentStatus.includes('desligad')
          ) {
            return false;
          }
        } else if (filterStatus === 'Pausados') {
          if (!currentStatus.includes('pausad')) return false;
        }
      }

      // 12. Filtro Dedicado "Avaliação de 4 Meses":
      // [Todos]
      // [Pendentes de Avaliação (>= 4 Meses)] (Exibe apenas os assistidos com 120+ dias de curso ativos e sem avaliação)
      // [Em Acompanhamento (< 4 Meses)] (Exibe assistidos mais recentes com menos de 120 dias)
      // [Avaliação Concluída] (Exibe assistidos que já tiveram a avaliação de 4 meses registrada)
      if (filterAvaliacao !== 'Todos') {
        if (filterAvaliacao.includes('Entrevista Domiciliar') || filterAvaliacao === 'Entrevista Domiciliar Pendente (1 Ano)') {
          if (!isPendenteEntrevistaDomiciliar1Ano(item)) {
            return false;
          }
        } else if (filterAvaliacao.includes('Pendentes de Avaliação') || filterAvaliacao === 'Pendentes de Avaliação (>= 4 Meses)') {
          if (!isPendenteAvaliacao4Meses(item)) {
            return false;
          }
        } else if (filterAvaliacao.includes('Em Acompanhamento') || filterAvaliacao === 'Em Acompanhamento (< 4 Meses)') {
          const dias = getDiasIngresso(item.data_ingresso, item.created_at);
          const isRecente =
            dias !== null &&
            dias < 120 &&
            isStatusAtivo(item.status_curso) &&
            !hasAvaliacao4Meses(item);
          if (!isRecente) {
            return false;
          }
        } else if (filterAvaliacao.includes('Avaliação Concluída') || filterAvaliacao === 'Avaliação Concluída') {
          if (!hasAvaliacao4Meses(item)) {
            return false;
          }
        }
      }

      // 13. Filtro de Período de Entrada (Por Ano e/ou Intervalo De-Até)
      const dataEntradaStr = item.data_ingresso || item.created_at;
      if (filterAno !== 'Todos os Anos') {
        if (!dataEntradaStr) return false;
        const entryDate = new Date(dataEntradaStr);
        if (isNaN(entryDate.getTime())) return false;
        const entryYear = entryDate.getFullYear();
        if (filterAno === '2022 ou anterior') {
          if (entryYear > 2022) return false;
        } else {
          if (entryYear !== Number(filterAno)) return false;
        }
      }

      if (filterDataInicial) {
        if (!dataEntradaStr) return false;
        const itemYmd = dataEntradaStr.split('T')[0];
        if (itemYmd < filterDataInicial) return false;
      }

      if (filterDataFinal) {
        if (!dataEntradaStr) return false;
        const itemYmd = dataEntradaStr.split('T')[0];
        if (itemYmd > filterDataFinal) return false;
      }

      // 14. Filtro por Uso de Imagem
      if (filterUsoImagem !== 'Todos os Termos') {
        const isNaoAutorizado =
          item.autoriza_imagem === 'Não' ||
          item.autoriza_imagem === false ||
          (item.expectativa_curso &&
            /Autoriza[çc][ãa]o de Imagem:\s*Não/i.test(item.expectativa_curso));

        if (filterUsoImagem === 'Autoriza Imagem' && isNaoAutorizado) return false;
        if (filterUsoImagem === 'NÃO Autoriza Imagem' && !isNaoAutorizado) return false;
      }

      // 15. Filtro por Faixa Etária (Cálculo Dinâmico da Idade Exata)
      if (filterFaixaEtaria !== 'Todas as Idades') {
        const idade = calculateExactAge(item.data_nascimento, item.idade);
        if (idade === null || isNaN(idade)) return false;

        if (filterFaixaEtaria === '0 a 6 anos' && (idade < 0 || idade > 6)) return false;
        if (filterFaixaEtaria === '7 a 11 anos' && (idade < 7 || idade > 11)) return false;
        if (filterFaixaEtaria === '12 a 17 anos' && (idade < 12 || idade > 17)) return false;
        if (filterFaixaEtaria === '18 a 29 anos' && (idade < 18 || idade > 29)) return false;
        if (filterFaixaEtaria === '30 a 59 anos' && (idade < 30 || idade > 59)) return false;
        if (filterFaixaEtaria === '60+ anos' && idade < 60) return false;
      }

      return true;
    });
  }, [
    assistidos,
    searchTerm,
    filterLocalidade,
    filterComposicao,
    filterFilhos,
    filterFaixaRenda,
    filterSaudeFamilia,
    filterServicosFLH,
    filterOcupacao,
    filterInternet,
    filterUsoImagem,
    filterFaixaEtaria,
    filterOficina,
    filterStatus,
    filterAvaliacao,
    filterAno,
    filterDataInicial,
    filterDataFinal
  ]);

  // Formatação de data em português
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Não registrada';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Exportação de Relatório em Excel/CSV respeitando os filtros ativos
  const handleExportCSV = () => {
    if (filteredAssistidos.length === 0) {
      setErrorMsg('Nenhum assistido encontrado nos filtros ativos para exportação.');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    const res = exportAssistidosToCSV(filteredAssistidos);
    if (res.success) {
      setSuccessMsg(
        `Planilha (.csv) gerada com sucesso! ${res.count} assistidos exportados no arquivo "${res.filename}".`
      );
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4500);
    } else {
      setErrorMsg('Erro ao gerar planilha de exportação.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Badge de Status visual
  const renderStatusBadge = (status?: string | null) => {
    const s = (status || 'Em Acompanhamento').toLowerCase();
    if (s.includes('conclu') || s.includes('formad')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
          Concluído
        </span>
      );
    }
    if (s.includes('desist') || s.includes('evas') || s.includes('trancad')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
          Desistente / Evasão
        </span>
      );
    }
    if (s.includes('pausad')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
          Pausado
        </span>
      );
    }
    if (s.includes('desligad')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
          Desligado
        </span>
      );
    }
    // Padrão: Ativo / Em Acompanhamento
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
        Ativo / Em Acompanhamento
      </span>
    );
  };

  // Abrir Modal de Visualização da Ficha Completa
  const handleOpenDetails = (item: Assistido) => {
    setSelectedAssistido(item);
  };

  // Excluir assistido (Apenas Admin)
  const handleConfirmDelete = async () => {
    if (!assistidoToDelete || !isAdmin) return;
    setDeleting(true);
    try {
      await assistidosService.delete(assistidoToDelete.id);

      // Atualiza o estado e recarrega a lista imediatamente na tela
      setAssistidos((prev) => prev.filter((a) => a.id !== assistidoToDelete.id));
      await fetchAssistidos(false);

      if (selectedAssistido?.id === assistidoToDelete.id) {
        setSelectedAssistido(null);
      }
      toast.success('Ficha removida com sucesso!', `${assistidoToDelete.nome_completo} foi excluído do sistema.`);
      setSuccessMsg('Ficha removida com sucesso!');
      setAssistidoToDelete(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao excluir assistido:', err);
      const errorMsgDetails = err?.message || 'Não foi possível excluir o cadastro do assistido. Verifique suas permissões.';
      toast.error('Erro ao excluir assistido', errorMsgDetails);
      setErrorMsg(`Erro ao excluir assistido: ${errorMsgDetails}`);
      setTimeout(() => setErrorMsg(null), 6000);
    } finally {
      setDeleting(false);
    }
  };

  return {
    user,
    canDelete,
    canEdit,
    toast,
    assistidos,
    setAssistidos,
    loading,
    setLoading,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    searchTerm,
    setSearchTerm,
    filterLocalidade,
    setFilterLocalidade,
    showFilters,
    setShowFilters,
    filterComposicao,
    setFilterComposicao,
    filterFilhos,
    setFilterFilhos,
    filterFaixaRenda,
    setFilterFaixaRenda,
    filterSaudeFamilia,
    setFilterSaudeFamilia,
    filterServicosFLH,
    setFilterServicosFLH,
    filterOcupacao,
    setFilterOcupacao,
    filterInternet,
    setFilterInternet,
    filterUsoImagem,
    setFilterUsoImagem,
    filterFaixaEtaria,
    setFilterFaixaEtaria,
    filterOficina,
    setFilterOficina,
    filterStatus,
    setFilterStatus,
    filterAvaliacao,
    setFilterAvaliacao,
    filterAno,
    setFilterAno,
    filterDataInicial,
    setFilterDataInicial,
    filterDataFinal,
    setFilterDataFinal,
    viewMode,
    setViewMode,
    selectedAssistido,
    setSelectedAssistido,
    isQuadroResumoOpen,
    setIsQuadroResumoOpen,
    assistidoToDelete,
    setAssistidoToDelete,
    deleting,
    setDeleting,
    isAdmin,
    fetchAssistidos,
    metrics,
    handleResetFilters,
    activeFiltersCount,
    filteredAssistidos,
    formatDate,
    handleExportCSV,
    renderStatusBadge,
    handleOpenDetails,
    handleConfirmDelete
  };
}

export type DashboardCtx = ReturnType<typeof useDashboard>;
