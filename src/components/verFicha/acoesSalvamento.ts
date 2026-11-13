import { getEntrevistaDomiciliar1Ano } from '../../utils/avaliacao4Meses';
import { supabase } from '../../lib/supabase/client';
import { assistidosService } from '../../services/assistidosService';
import { formatCPF, formatRG } from '../../utils/masks';
import type { FichaBase } from './useVerFicha';
import { pendenciaQuadroResumo } from '../../utils/familia';
import type { FichaDerivados } from './derivados';

/** Ações de salvamento: entrevista de 1 ano, edição completa e avaliação de 4 meses. */
export function criarAcoesDeSalvamento(ctx: FichaBase & FichaDerivados) {
  const {
    assistido,
    onAssistidoUpdated,
    toast,
    setIsEditingData,
    setEditActiveTab,
    editFormData,
    existingAvaliacao,
    setIsEditingAvaliacao,
    dataAvaliacao,
    statusFinalCurso,
    motivoEvasao,
    impactoGerado,
    mudancaAutonomia,
    setSavingAvaliacao,
    setAvaliacaoSuccessMsg,
    setAvaliacaoErrorMsg,
    setIsEntrevistaModalOpen,
    dataVisita,
    tecnicoResponsavel,
    evolucaoSituacao,
    observacoesEvolucaoLar,
    statusPosVisita,
    setSavingEntrevista,
    fotoFile,
    setSavingEdit,
    setSaveSuccessMsg,
    setSaveErrorMsg,
    convertFileToBase64
  } = ctx;

  const handleSaveEntrevista = async () => {
    if (!observacoesEvolucaoLar.trim()) {
      toast.error('Observações Obrigatórias', 'Por favor, descreva as observações da evolução do lar.');
      return;
    }
    setSavingEntrevista(true);
    try {
      const dataFormatada = dataVisita;
      const tec = tecnicoResponsavel.trim() || 'Serviço Social';
      const statusTxt = statusPosVisita;
      const evolucaoTxt = evolucaoSituacao;
      const obsLarTxt = observacoesEvolucaoLar.trim();

      const blocoEntrevista = `[Entrevista Domiciliar 1 Ano - ${dataFormatada}] Responsável: ${tec} | Situação Familiar: ${evolucaoTxt} | Status: ${statusTxt} | Observações da Evolução do Lar: ${obsLarTxt}`;

      const rawExpectativa = assistido.expectativa_curso || '';
      const novaExpectativa = rawExpectativa ? `${rawExpectativa} | ${blocoEntrevista}` : blocoEntrevista;

      const currentServicos = Array.isArray(assistido.servicos_acompanhamento)
        ? [...assistido.servicos_acompanhamento]
        : [];
      if (!currentServicos.includes('Entrevista Domiciliar (1 Ano)')) {
        currentServicos.push('Entrevista Domiciliar (1 Ano)');
      }

      let novoStatusCurso = assistido.status_curso || 'Ativo / Em Acompanhamento';
      if (statusPosVisita === 'Desligado') {
        novoStatusCurso = 'Desligado';
      } else if (statusPosVisita === 'Pausado') {
        novoStatusCurso = 'Pausado';
      } else if (statusPosVisita === 'Manter em Acompanhamento') {
        novoStatusCurso = 'Ativo / Em Acompanhamento';
      }

      let authUserId: string | null = null;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) authUserId = authData.user.id;
      } catch {
        authUserId = null;
      }

      const updatePayload: Record<string, any> = {
        expectativa_curso: novaExpectativa,
        servicos_acompanhamento: currentServicos,
        status_curso: novoStatusCurso
      };

      if (authUserId) {
        updatePayload.atualizado_por = authUserId;
      }

      const updated = await assistidosService.update(assistido.id, updatePayload);
      onAssistidoUpdated(updated);
      setIsEntrevistaModalOpen(false);
      toast.success(
        'Entrevista Domiciliar Registrada!',
        'A entrevista de 1 Ano foi salva com sucesso e a pendência de 1 ano foi removida.'
      );
    } catch (err: any) {
      console.error('Erro ao salvar entrevista domiciliar:', err);
      toast.error('Erro ao salvar entrevista', err?.message || 'Conexão falhou.');
    } finally {
      setSavingEntrevista(false);
    }
  };


  // =========================================================================
  // SALVAMENTO DA EDIÇÃO COMPLETA NO SUPABASE
  // =========================================================================
  const handleSaveFullEdit = async () => {
    setSavingEdit(true);
    setSaveErrorMsg(null);

    try {
      if (!editFormData.nome_completo.trim()) {
        setEditActiveTab(1);
        setSaveErrorMsg('O campo "Nome Completo" é obrigatório.');
        setSavingEdit(false);
        return;
      }

      const pendencia = pendenciaQuadroResumo(editFormData);
      if (pendencia) {
        setEditActiveTab(pendencia.aba);
        setSaveErrorMsg(pendencia.mensagem);
        setSavingEdit(false);
        return;
      }

      // Processar Foto se houver novo arquivo selecionado
      let finalFotoUrl = editFormData.foto_url;
      if (fotoFile) {
        finalFotoUrl = await convertFileToBase64(fotoFile);
      }

      // 1. Ocupação / Trabalho
      let profissaoFinal = '';
      if (editFormData.atividade_remunerada === 'Sim') {
        const ocup = editFormData.ocupacao_atual.trim() || 'Atividade remunerada informal';
        const diasList =
          editFormData.dias_semana_trabalho_array &&
          editFormData.dias_semana_trabalho_array.length > 0
            ? editFormData.dias_semana_trabalho_array.join(', ')
            : 'Dias flexíveis';
        const turno = editFormData.turno_trabalho || 'Manhã';
        profissaoFinal = `Ocupação: ${ocup} | Dias: ${diasList} | Turno: ${turno}`;
        if (
          editFormData.trabalhou_anteriormente === 'Sim' &&
          editFormData.area_trabalho_anterior.trim()
        ) {
          profissaoFinal += ` | Trabalho anterior: ${editFormData.area_trabalho_anterior.trim()}`;
        }
      } else if (editFormData.atividade_remunerada === 'Aposentado(a) / Pensionista') {
        const ocup = editFormData.ocupacao_atual.trim() || 'Aposentado(a) / Pensionista';
        const turno = editFormData.turno_trabalho || 'Sem atividade extra';
        profissaoFinal = `Aposentado(a) / Pensionista: ${ocup} | Atividade complementar: ${turno}`;
        if (
          editFormData.trabalhou_anteriormente === 'Sim' &&
          editFormData.area_trabalho_anterior.trim()
        ) {
          profissaoFinal += ` | Histórico anterior: ${editFormData.area_trabalho_anterior.trim()}`;
        }
      } else {
        const partes: string[] = ['Sem ocupação formal no momento'];
        if (editFormData.desemprego_circunstancia.trim()) {
          partes.push(`Causa/Justificativa: ${editFormData.desemprego_circunstancia.trim()}`);
        }
        if (editFormData.trabalhou_anteriormente === 'Sim') {
          partes.push(
            `Já trabalhou anteriormente: Sim (${editFormData.area_trabalho_anterior.trim() || 'Área não informada'})`
          );
        } else {
          partes.push('Já trabalhou anteriormente: Não');
        }
        profissaoFinal = partes.join(' | ');
      }

      // 2. Programas Sociais
      let programasSociaisArray = editFormData.programas_sociais.filter(Boolean);
      if (
        programasSociaisArray.includes('Outro') &&
        editFormData.outro_programa_social.trim()
      ) {
        programasSociaisArray = programasSociaisArray.map((p) =>
          p === 'Outro' ? `Outro: ${editFormData.outro_programa_social.trim()}` : p
        );
      }

      // 3. Vulnerabilidades e Saúde Familiar (Suporte a múltiplos registros por categoria)
      const saudeFamiliaItens: string[] = [];

      const processCategoryList = (
        categoria: string,
        lista?: any[],
        legadoAtivo?: boolean,
        legadoParentesco?: string,
        legadoNome?: string,
        legadoMed?: string,
        legadoObs?: string,
        legadoDetalhe?: string
      ) => {
        if (Array.isArray(lista) && lista.length > 0) {
          lista.forEach((item) => {
            const p =
              item.parentesco_tipo === 'assistido'
                ? 'O próprio assistido'
                : item.parentesco_nome?.trim() || 'Familiar';
            const n = item.nome_doenca?.trim() || '';
            const m = item.medicamento?.trim() || '';
            const o = item.observacoes?.trim() || '';

            const parts: string[] = [];
            if (n) parts.push(`Doença: ${n}`);
            parts.push(`Paciente: ${p}`);
            if (m) parts.push(`Med/Tratamento: ${m}`);
            if (o) parts.push(`Obs: ${o}`);

            saudeFamiliaItens.push(`${categoria}: ${parts.join(' | ')}`);
          });
        } else if (legadoAtivo) {
          const p = legadoParentesco?.trim() || 'O próprio assistido';
          const n = legadoNome?.trim();
          const m = legadoMed?.trim();
          const o = legadoObs?.trim();

          const parts: string[] = [];
          if (n) parts.push(`Doença: ${n}`);
          parts.push(`Paciente: ${p}`);
          if (m) parts.push(`Med/Tratamento: ${m}`);
          if (o) parts.push(`Obs: ${o}`);

          const result = parts.length > 0 ? parts.join(' | ') : (legadoDetalhe || 'Sim');
          saudeFamiliaItens.push(`${categoria}: ${result}`);
        }
      };

      processCategoryList(
        'Doença Crônica',
        editFormData.saude_doencas_cronicas_lista,
        editFormData.saude_doenca_cronica,
        editFormData.saude_doenca_cronica_parentesco,
        editFormData.saude_doenca_cronica_nome,
        editFormData.saude_doenca_cronica_medicamento,
        editFormData.saude_doenca_cronica_obs,
        editFormData.saude_doenca_cronica_detalhe
      );
      processCategoryList(
        'Dependência Química',
        editFormData.saude_dependencia_quimica_lista,
        editFormData.saude_dependencia_quimica,
        editFormData.saude_dependencia_quimica_parentesco,
        editFormData.saude_dependencia_quimica_nome,
        editFormData.saude_dependencia_quimica_medicamento,
        editFormData.saude_dependencia_quimica_obs,
        editFormData.saude_dependencia_quimica_detalhe
      );
      processCategoryList(
        'Saúde Mental',
        editFormData.saude_mental_lista,
        editFormData.saude_mental,
        editFormData.saude_mental_parentesco,
        editFormData.saude_mental_nome,
        editFormData.saude_mental_medicamento,
        editFormData.saude_mental_obs,
        editFormData.saude_mental_detalhe
      );
      processCategoryList(
        'Deficiência/Síndrome',
        editFormData.saude_deficiencia_lista,
        editFormData.saude_deficiencia,
        editFormData.saude_deficiencia_parentesco,
        editFormData.saude_deficiencia_nome,
        editFormData.saude_deficiencia_medicamento,
        editFormData.saude_deficiencia_obs,
        editFormData.saude_deficiencia_detalhe
      );
      processCategoryList(
        'Outra Situação de Saúde',
        editFormData.saude_outra_situacao_lista,
        editFormData.saude_outra_situacao,
        editFormData.saude_outra_situacao_parentesco,
        editFormData.saude_outra_situacao_nome,
        editFormData.saude_outra_situacao_medicamento,
        editFormData.saude_outra_situacao_obs,
        editFormData.saude_outra_situacao_detalhe
      );

      const doencasCronicasFamiliaArray: string[] =
        saudeFamiliaItens.length > 0
          ? saudeFamiliaItens
          : ['Nenhuma condição registrada'];

      const tiposDeficienciaArray: string[] = editFormData.saude_deficiencia
        ? [
            editFormData.saude_deficiencia_medicamento.trim() ||
              editFormData.saude_deficiencia_parentesco.trim() ||
              'PcD / Síndrome familiar'
          ]
        : ['Nenhuma'];

      // 4. Cursos anteriores
      let cursosAnterioresArray: string[] = [];
      if (
        editFormData.participou_cursos_anteriores === 'Sim' &&
        editFormData.cursos_anteriores_detalhes.trim()
      ) {
        cursosAnterioresArray = [editFormData.cursos_anteriores_detalhes.trim()];
      } else {
        cursosAnterioresArray = ['Não participou de cursos anteriores'];
      }

      // 5. Expectativas de Curso e Percepção FLH (Seção 12)
      const expectativasList: string[] = [];
      if (editFormData.curso_e_preferencia === 'Sim') {
        expectativasList.push('Curso de preferência do assistido');
      } else if (editFormData.curso_preferencia_outro.trim()) {
        expectativasList.push(
          `Preferência alternativa: ${editFormData.curso_preferencia_outro.trim()}`
        );
      }

      if (editFormData.o_que_pretende_fazer.length > 0) {
        let pretencoes = [...editFormData.o_que_pretende_fazer];
        if (pretencoes.includes('Outro') && editFormData.o_que_pretende_outro.trim()) {
          pretencoes = pretencoes.map((p) =>
            p === 'Outro' ? `Outro: ${editFormData.o_que_pretende_outro.trim()}` : p
          );
        }
        expectativasList.push(`Pretende: ${pretencoes.join(', ')}`);
      }

      if (editFormData.representacao_flh_familia.trim()) {
        expectativasList.push(
          `Significado FLH: ${editFormData.representacao_flh_familia.trim()}`
        );
      }

      if (editFormData.percepcao_flh_hoje && editFormData.percepcao_flh_hoje.length > 0) {
        let percs = [...editFormData.percepcao_flh_hoje];
        if (percs.includes('Outro') && editFormData.percepcao_flh_outro.trim()) {
          percs = percs.map((p) =>
            p === 'Outro' ? `Outro: ${editFormData.percepcao_flh_outro.trim()}` : p
          );
        }
        expectativasList.push(`Percepção FLH: ${percs.join(', ')}`);
      }

      if (editFormData.nao_tem_interesse_outras_oficinas) {
        expectativasList.push('Sem interesse em outras oficinas');
      } else if (editFormData.interesse_outras_oficinas.trim()) {
        expectativasList.push(
          `Outras oficinas de interesse: ${editFormData.interesse_outras_oficinas.trim()}`
        );
      }

      if (editFormData.data_saida?.trim()) {
        expectativasList.push(`Data de Saída: ${editFormData.data_saida.trim()}`);
      }

      if (editFormData.motivo_evasao?.trim()) {
        expectativasList.push(`Motivo da Evasão: ${editFormData.motivo_evasao.trim()}`);
      }

      if (editFormData.cartao_sus?.trim()) {
        expectativasList.push(`Cartão SUS: ${editFormData.cartao_sus.trim()}`);
      }
      expectativasList.push(`Autorização de Imagem: ${editFormData.autoriza_imagem || 'Não informado'}`);

      if (Array.isArray(editFormData.membros_familia) && editFormData.membros_familia.length > 0) {
        expectativasList.push(`[Membros da Família: ${JSON.stringify(editFormData.membros_familia)}]`);
      }

      // Preservar registro da Entrevista Domiciliar de 1 Ano se já existente
      const existingEntrevista = getEntrevistaDomiciliar1Ano(assistido);
      if (existingEntrevista) {
        const blocoEntrevista = `[Entrevista Domiciliar 1 Ano - ${existingEntrevista.data_visita}] Técnico: ${existingEntrevista.tecnico_responsavel} | Situação: ${existingEntrevista.evolucao_situacao} | Status: ${existingEntrevista.status_pos_visita} | Parecer: ${existingEntrevista.parecer_observacoes}`;
        expectativasList.push(blocoEntrevista);
      }

      // Preservar registro da Avaliação de 4 Meses se já existente
      if (existingAvaliacao) {
        const evMotive =
          existingAvaliacao.status_final_curso === 'Desistiu (Evasão)'
            ? editFormData.motivo_evasao?.trim() || existingAvaliacao.motivo_evasao
            : existingAvaliacao.motivo_evasao;

        const blocoAvaliacao = `[Avaliação 4 Meses - ${existingAvaliacao.data_avaliacao}] Status: ${
          existingAvaliacao.status_final_curso
        }${
          evMotive ? ` (${evMotive})` : ''
        }${
          evMotive ? ` | Motivo da Evasão: ${evMotive}` : ''
        } | Impacto: ${existingAvaliacao.impacto_gerado} | Depoimento: ${
          existingAvaliacao.mudanca_autonomia_qualidade_vida
        }`;
        expectativasList.push(blocoAvaliacao);
      }

      const expectativaCursoFinal =
        expectativasList.length > 0 ? expectativasList.join(' | ') : null;

      // 6. Moradia Detalhada e Faixa de Renda Exata
      const moradiaDescPartes = [editFormData.tipo_moradia || 'Não informado'];
      moradiaDescPartes.push(`Água: ${editFormData.agua_regularidade}`);
      moradiaDescPartes.push(`Energia: ${editFormData.energia_regularidade}`);
      if (editFormData.servicos_basicos_gerais) {
        moradiaDescPartes.push(
          `Serviços Básicos Gerais: ${editFormData.servicos_basicos_gerais}`
        );
      }
      if (
        editFormData.quantidade_filhos !== '' &&
        Number(editFormData.quantidade_filhos) >= 0
      ) {
        moradiaDescPartes.push(`Filhos: ${editFormData.quantidade_filhos}`);
      }

      const faixaRendaString = editFormData.faixa_renda || 'Sem Renda (R$ 0)';
      moradiaDescPartes.push(`Faixa de Renda: ${faixaRendaString}`);

      if (editFormData.observacoes_moradia.trim()) {
        moradiaDescPartes.push(`Obs: ${editFormData.observacoes_moradia.trim()}`);
      }
      const tipoMoradiaFinal = moradiaDescPartes.join(' | ');

      // Renda Numérica segura para o banco
      let rendaNumerica = 0;
      if (faixaRendaString === 'Sem Renda (R$ 0)') rendaNumerica = 0;
      else if (faixaRendaString === 'Até R$ 600') rendaNumerica = 600;
      else if (faixaRendaString === 'De R$ 601 a R$ 1.200') rendaNumerica = 1200;
      else if (faixaRendaString === 'De R$ 1.201 a R$ 2.000') rendaNumerica = 2000;
      else if (faixaRendaString === 'De R$ 2.001 a R$ 3.500') rendaNumerica = 3500;
      else if (faixaRendaString === 'De R$ 3.501 a R$ 5.000') rendaNumerica = 5000;
      else if (faixaRendaString === 'Acima de R$ 5.000') rendaNumerica = 6000;
      else rendaNumerica = Number(editFormData.renda_aproximada_valor) || 0;

      const finalComposicaoFamiliar =
        editFormData.mora_sozinho ||
        editFormData.em_situacao_rua ||
        editFormData.composicao_familiar === ''
          ? 1
          : Math.max(1, Number(editFormData.composicao_familiar));

      const cleanCpf = editFormData.cpf.trim()
        ? formatCPF(editFormData.cpf).slice(0, 14)
        : null;
      const cleanRg = editFormData.rg.trim() ? formatRG(editFormData.rg) : null;

      const sanitizeStringArray = (val: any, defaultFallback: string[] = []): string[] => {
        if (!val) return defaultFallback;
        if (Array.isArray(val)) {
          const clean = val
            .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
            .filter(Boolean);
          return clean.length > 0 ? clean : defaultFallback;
        }
        if (typeof val === 'string' && val.trim()) {
          return [val.trim()];
        }
        return defaultFallback;
      };

      // Usuário autenticado
      let authUserId: string | null = null;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch {
        authUserId = null;
      }

      const nowIso = new Date().toISOString();

      const payload: Record<string, any> = {
        // Aba 1 - Identificação e Contato
        nome_completo: editFormData.nome_completo.trim(),
        rg: cleanRg,
        cpf: cleanCpf,
        cartao_sus: editFormData.cartao_sus?.trim() || null,
        autoriza_imagem: editFormData.autoriza_imagem,
        sexo: editFormData.sexo || null,
        programas: editFormData.programas || [],
        em_situacao_rua: Boolean(editFormData.em_situacao_rua),
        data_nascimento: editFormData.data_nascimento || null,
        idade: editFormData.idade === '' ? null : Number(editFormData.idade),
        raca_cor: editFormData.raca_cor || 'Não informado',
        telefone: editFormData.telefone.trim() || null,
        endereco: editFormData.endereco.trim() || null,
        bairro: editFormData.bairro.trim() || null,
        escolaridade: editFormData.escolaridade,
        estado_civil: editFormData.estado_civil,
        possui_cadastro_flh: editFormData.possui_cadastro_flh,
        possui_cras: editFormData.possui_cras,
        bairro_cras: editFormData.possui_cras
          ? editFormData.bairro_cras.trim() || null
          : null,
        data_ingresso:
          editFormData.data_ingresso ||
          assistido.data_ingresso ||
          new Date().toISOString().split('T')[0],
        foto_url: finalFotoUrl,

        // Aba 2 - Trabalho e Renda
        atividade_remunerada: editFormData.atividade_remunerada,
        profissao: profissaoFinal,
        renda_familiar_aproximada: rendaNumerica,
        beneficios_sociais: sanitizeStringArray(programasSociaisArray, ['Nenhum']),

        // Aba 3 - Moradia e Família
        composicao_familiar: finalComposicaoFamiliar,
        quantidade_filhos:
          editFormData.quantidade_filhos !== '' ? Number(editFormData.quantidade_filhos) : 0,
        membros_familia: editFormData.membros_familia || [],
        acesso_internet: editFormData.acesso_internet,
        tipo_moradia: tipoMoradiaFinal,
        servicos_basicos_regulares: editFormData.servicos_basicos_gerais === 'Sim',

        // Aba 4 - Vulnerabilidades e Saúde
        dificuldades_enfrentadas: sanitizeStringArray(
          editFormData.dificuldades_familia,
          ['Nenhuma']
        ),
        rede_apoio: editFormData.rede_apoio_principal,
        fatores_risco_evasao: sanitizeStringArray(
          editFormData.fatores_risco_evasao,
          ['Nenhum']
        ),
        possui_deficiencia: editFormData.saude_deficiencia,
        tipos_deficiencia: sanitizeStringArray(tiposDeficienciaArray, ['Nenhuma']),
        doencas_cronicas_familia: sanitizeStringArray(
          doencasCronicasFamiliaArray,
          ['Nenhuma condição registrada']
        ),
        servicos_acompanhamento: sanitizeStringArray(
          editFormData.servicos_flh_utilizados,
          ['Nenhum / Nunca utilizou']
        ),

        // Aba 5 - Motivações e Expectativas FLH
        motivo_busca: editFormData.motivo_busca_momento.trim() || null,
        expectativa_curso: expectativaCursoFinal,
        objetivo_profissional_3_meses:
          editFormData.objetivo_profissional_3_meses.trim() || null,
        curso_pretendido: editFormData.oficina_pretendida,
        cursos_anteriores: sanitizeStringArray(cursosAnterioresArray, [
          'Não participou de cursos anteriores'
        ]),
        status_curso:
          editFormData.status_acompanhamento ||
          editFormData.status_atendimento ||
          'Ativo / Em Acompanhamento'
      };

      if (authUserId) {
        payload.atualizado_por = authUserId;
      }

      // Executa o update com fallback seguro
      const updatedRecord = await assistidosService.update(assistido.id, payload);

      onAssistidoUpdated(updatedRecord);
      setIsEditingData(false);
      setSaveSuccessMsg('Cadastro atualizado com sucesso em todas as 5 etapas!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao atualizar assistido:', err);
      setSaveErrorMsg(err.message || 'Erro ao salvar alterações no banco de dados.');
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================================================================
  // SALVAMENTO DA AVALIAÇÃO DE 4 MESES NO SUPABASE
  // =========================================================================
  const handleSaveAvaliacao = async () => {
    setSavingAvaliacao(true);
    setAvaliacaoErrorMsg(null);
    setAvaliacaoSuccessMsg(null);

    try {
      if (!mudancaAutonomia.trim()) {
        setAvaliacaoErrorMsg(
          'Por favor, descreva as observações ou depoimento sobre a mudança na autonomia e qualidade de vida.'
        );
        setSavingAvaliacao(false);
        return;
      }

      if (statusFinalCurso === 'Desistiu (Evasão)' && !motivoEvasao.trim()) {
        setAvaliacaoErrorMsg('Por favor, informe o motivo da evasão / desistência.');
        setSavingAvaliacao(false);
        return;
      }

      // Definir novo status do assistido
      let novoStatus = 'Concluído';
      if (statusFinalCurso === 'Concluiu Oficina') {
        novoStatus = 'Concluído';
      } else if (statusFinalCurso === 'Desistiu (Evasão)') {
        novoStatus = 'Desistente / Evasão';
      } else {
        novoStatus = 'Ativo / Em Acompanhamento';
      }

      // Adicionar aos serviços de acompanhamento
      const servicosAtuais = Array.isArray(assistido.servicos_acompanhamento)
        ? [...assistido.servicos_acompanhamento]
        : typeof assistido.servicos_acompanhamento === 'string'
        ? [assistido.servicos_acompanhamento]
        : [];

      const servicoItem = `Avaliação de 4 Meses (${dataAvaliacao}): ${statusFinalCurso}`;
      const filteredServicos = servicosAtuais
        .filter((s) => !s.toLowerCase().includes('avaliação de 4 meses'))
        .filter((s) => s !== 'Nenhum / Nunca utilizou');
      filteredServicos.push(servicoItem);

      // Atualizar o bloco estruturado na expectativa_curso com limpeza robusta
      const cleanExpectativa = (assistido.expectativa_curso || '')
        .replace(/\s*\|\s*\[Avaliação 4 Meses\s*-\s*[^\]]+\][\s\S]*?(?=\s*\|\s*(?:\[|Data de Saída|Motivo da Evasão|Oficina)|$)/gi, '')
        .replace(/\[Avaliação 4 Meses\s*-\s*[^\]]+\][\s\S]*?(?=\s*\|\s*(?:\[|Data de Saída|Motivo da Evasão|Oficina)|$)/gi, '')
        .trim();

      const blocoAvaliacao = `[Avaliação 4 Meses - ${dataAvaliacao}] Status: ${statusFinalCurso}${
        statusFinalCurso === 'Desistiu (Evasão)' && motivoEvasao.trim() ? ` (${motivoEvasao.trim()})` : ''
      }${
        statusFinalCurso === 'Desistiu (Evasão)' && motivoEvasao.trim() ? ` | Motivo da Evasão: ${motivoEvasao.trim()}` : ''
      } | Impacto: ${impactoGerado} | Depoimento: ${mudancaAutonomia.trim()}`;

      let novaExpectativa = cleanExpectativa
        ? `${cleanExpectativa} | ${blocoAvaliacao}`
        : blocoAvaliacao;

      if (statusFinalCurso === 'Desistiu (Evasão)' && motivoEvasao.trim()) {
        if (!novaExpectativa.includes('Motivo da Evasão:')) {
          novaExpectativa = `${novaExpectativa} | Motivo da Evasão: ${motivoEvasao.trim()}`;
        }
      }

      // Obter usuário logado
      let authUserId: string | null = null;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch {
        authUserId = null;
      }

      const updatePayload: Record<string, any> = {
        status_curso: novoStatus,
        servicos_acompanhamento: filteredServicos,
        expectativa_curso: novaExpectativa
      };

      if (authUserId) {
        updatePayload.atualizado_por = authUserId;
      }

      const updatedRecord = await assistidosService.update(assistido.id, updatePayload);

      onAssistidoUpdated(updatedRecord);
      setIsEditingAvaliacao(false);
      setAvaliacaoSuccessMsg('Avaliação de 4 Meses registrada com sucesso e status atualizado!');
      setTimeout(() => setAvaliacaoSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao salvar avaliação de 4 meses:', err);
      setAvaliacaoErrorMsg(err.message || 'Erro ao salvar avaliação no banco de dados.');
    } finally {
      setSavingAvaliacao(false);
    }
  };

  return {
    handleSaveEntrevista,
    handleSaveFullEdit,
    handleSaveAvaliacao
  };
}

export type FichaAcoes = ReturnType<typeof criarAcoesDeSalvamento>;
