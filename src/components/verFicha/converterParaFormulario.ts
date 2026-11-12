import { getAssistidoMotivoEvasao } from '../../utils/avaliacao4Meses';
import { CadastroFormData } from '../../types/cadastro';
import type { Assistido } from './tipos';

/**
 * Converte os dados do registro do Supabase para a estrutura completa do formulário (5 Abas)
 */
export function convertAssistidoToFormData(assistido: Assistido): CadastroFormData {
  // 1. Moradia & Infraestrutura
  const rawMoradia = assistido.tipo_moradia || '';
  const moradiaParts = rawMoradia.split(' | ').map((p) => p.trim());
  const tipoMoradia = moradiaParts[0] || 'Não informado';
  let agua: 'Regular' | 'Irregular' = 'Regular';
  let energia: 'Regular' | 'Irregular' = 'Regular';
  let servicosGerais: 'Sim' | 'Parcialmente' | 'Irregular' = assistido.servicos_basicos_regulares
    ? 'Sim'
    : 'Parcialmente';
  let filhos =
    assistido.quantidade_filhos !== undefined && assistido.quantidade_filhos !== null
      ? Number(assistido.quantidade_filhos)
      : 0;
  let obsMoradia = '';
  let faixaRendaFromMoradia = '';

  moradiaParts.forEach((p) => {
    if (p.startsWith('Água:')) {
      const v = p.replace('Água:', '').trim();
      if (v.toLowerCase().includes('irreg')) agua = 'Irregular';
    } else if (p.startsWith('Energia:')) {
      const v = p.replace('Energia:', '').trim();
      if (v.toLowerCase().includes('irreg')) energia = 'Irregular';
    } else if (p.startsWith('Serviços Básicos Gerais:') || p.startsWith('Serviços Gerais:')) {
      const v = p.split(':')[1]?.trim() || '';
      if (v.toLowerCase().includes('parcial')) servicosGerais = 'Parcialmente';
      else if (v.toLowerCase().includes('irreg') || v.toLowerCase().includes('não'))
        servicosGerais = 'Irregular';
      else if (v.toLowerCase().includes('sim') || v.toLowerCase().includes('regul'))
        servicosGerais = 'Sim';
    } else if (p.startsWith('Filhos:') || p.startsWith('Quantidade de Filhos:')) {
      const fVal = Number(p.split(':')[1]?.trim());
      if (!isNaN(fVal)) filhos = fVal;
    } else if (p.startsWith('Faixa de Renda:')) {
      faixaRendaFromMoradia = p.replace('Faixa de Renda:', '').trim();
    } else if (p.startsWith('Obs:')) {
      obsMoradia = p.replace('Obs:', '').trim();
    }
  });

  // 2. Faixa de Renda
  let faixaRenda = faixaRendaFromMoradia;
  if (!faixaRenda && assistido.profissao?.includes('Renda Familiar:')) {
    const match = assistido.profissao.match(/Renda Familiar:\s*([^|]+)/);
    if (match && match[1]?.trim()) {
      faixaRenda = match[1].trim();
    }
  }
  if (!faixaRenda) {
    const val = Number(assistido.renda_familiar_aproximada);
    if (isNaN(val) || val === 0) faixaRenda = 'Sem Renda (R$ 0)';
    else if (val <= 600) faixaRenda = 'Até R$ 600';
    else if (val <= 1200) faixaRenda = 'De R$ 601 a R$ 1.200';
    else if (val <= 2000) faixaRenda = 'De R$ 1.201 a R$ 2.000';
    else if (val <= 3500) faixaRenda = 'De R$ 2.001 a R$ 3.500';
    else if (val <= 5000) faixaRenda = 'De R$ 3.501 a R$ 5.000';
    else faixaRenda = 'Acima de R$ 5.000';
  }

  // 3. Trabalho & Ocupação
  const rawProf = assistido.profissao || '';
  const isAposentado =
    assistido.atividade_remunerada === 'Aposentado(a) / Pensionista' ||
    rawProf.startsWith('Aposentado(a) / Pensionista');
  const isRemunerada = assistido.atividade_remunerada === 'Sim';
  let ocupacao = '';
  let diasSemanaArr: string[] = [];
  let turno = 'Manhã';
  let desempregoCircunstancia = '';
  let trabalhouAntes: 'Sim' | 'Não' = 'Sim';
  let areaAnterior = '';

  const profParts = rawProf.split(' | ').map((p) => p.trim());
  profParts.forEach((p) => {
    if (p.startsWith('Ocupação:')) {
      ocupacao = p.replace('Ocupação:', '').trim();
    } else if (p.startsWith('Aposentado(a) / Pensionista:')) {
      ocupacao = p.replace('Aposentado(a) / Pensionista:', '').trim();
    } else if (p.startsWith('Atividade complementar:')) {
      turno = p.replace('Atividade complementar:', '').trim() || 'Sem atividade extra';
    } else if (p.startsWith('Dias:')) {
      const diasStr = p.replace('Dias:', '').trim();
      const allDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      diasSemanaArr = allDias.filter((d) => diasStr.includes(d));
    } else if (p.startsWith('Turno:')) {
      turno = p.replace('Turno:', '').trim() || 'Manhã';
    } else if (
      p.startsWith('Causa/Justificativa:') ||
      p.startsWith('Justificativa/Ações:') ||
      p.startsWith('Motivo/Ações:')
    ) {
      desempregoCircunstancia = p.split(':')[1]?.trim() || '';
    } else if (p.startsWith('Já trabalhou anteriormente:')) {
      const val = p.replace('Já trabalhou anteriormente:', '').trim();
      trabalhouAntes = val.toLowerCase().includes('não') ? 'Não' : 'Sim';
      const areaMatch = val.match(/\(([^)]+)\)/);
      if (areaMatch) areaAnterior = areaMatch[1].trim();
    } else if (p.startsWith('Trabalho anterior:') || p.startsWith('Histórico anterior:')) {
      areaAnterior = p.replace(/^(Trabalho anterior|Histórico anterior):\s*/i, '').trim();
    } else if (p.includes('(Dias:') && p.includes('Turno:')) {
      const match = p.match(/^([^(]+)\s*\(Dias:\s*([^|]+)\|\s*Turno:\s*([^)]+)\)/);
      if (match) {
        ocupacao = match[1]?.trim() || '';
        const dStr = match[2]?.trim() || '';
        const allDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        diasSemanaArr = allDias.filter((d) => dStr.includes(d));
        turno = match[3]?.trim() || 'Manhã';
      }
    }
  });
  if (isRemunerada && !ocupacao && rawProf && !rawProf.includes('|')) {
    ocupacao = rawProf;
  }
  if (isAposentado && !ocupacao) {
    ocupacao = 'Aposentado(a) / Pensionista';
  }

  // 4. Programas Sociais
  const rawProgs = Array.isArray(assistido.beneficios_sociais) ? assistido.beneficios_sociais : [];
  let outroProg = '';
  const progs = rawProgs.map((p) => {
    if (p.startsWith('Outro:')) {
      outroProg = p.replace('Outro:', '').trim();
      return 'Outro';
    }
    return p;
  });

  // 5. Vulnerabilidades e Saúde Familiar
  const rawSaude = Array.isArray(assistido.doencas_cronicas_familia)
    ? assistido.doencas_cronicas_familia
    : typeof assistido.doencas_cronicas_familia === 'string'
    ? [assistido.doencas_cronicas_familia]
    : [];

  const parseHealthItemToStruct = (item: string, catKey: string, idx: number) => {
    let content = item;
    const prefixes = [
      'Doença Crônica:',
      'Dependência Química:',
      'Saúde Mental:',
      'Deficiência/Síndrome:',
      'Deficiência:',
      'Outra Situação de Saúde:'
    ];
    for (const pfx of prefixes) {
      if (content.startsWith(pfx)) {
        content = content.slice(pfx.length).trim();
        break;
      }
    }

    let nome = '';
    let parentescoStr = 'O próprio assistido';
    let med = '';
    let obs = '';

    if (content.includes('|')) {
      const parts = content.split('|').map((p) => p.trim());
      parts.forEach((p) => {
        if (p.startsWith('Doença:') || p.startsWith('Doenca:')) {
          nome = p.replace(/^Doen[cç]a:\s*/i, '').trim();
        } else if (p.startsWith('Paciente:')) {
          parentescoStr = p.replace(/^Paciente:\s*/i, '').trim();
        } else if (
          p.startsWith('Med/Tratamento:') ||
          p.startsWith('Med:') ||
          p.startsWith('Medicamento:') ||
          p.startsWith('Tratamento:')
        ) {
          med = p.replace(/^(Med\/Tratamento|Med|Medicamento|Tratamento):\s*/i, '').trim();
        } else if (
          p.startsWith('Obs:') ||
          p.startsWith('Observacao:') ||
          p.startsWith('Observação:')
        ) {
          obs = p.replace(/^(Obs|Observacao|Observação):\s*/i, '').trim();
        } else if (p && p !== 'Sim' && p !== 'Não') {
          if (!nome) nome = p;
        }
      });
    } else {
      const match = content.match(/^([^(]+)\s*\(([^)]+)\)/);
      if (match) {
        parentescoStr = match[1].trim();
        med = match[2].replace(/^(Med\/Tratamento|Med|Tratamento):\s*/i, '').trim();
      } else if (content !== 'Sim' && content !== 'Não') {
        if (
          content.includes('Assistido') ||
          content.includes('Mãe') ||
          content.includes('Filho') ||
          content.includes('Pai') ||
          content.includes('Espos') ||
          content.includes('Cônjuge')
        ) {
          parentescoStr = content;
        } else {
          nome = content;
        }
      }
    }

    const isProprio = !parentescoStr || parentescoStr === 'O próprio assistido';
    return {
      id: `edit_${catKey}_${idx}_${Date.now()}`,
      parentesco_tipo: (isProprio ? 'assistido' : 'familiar') as 'assistido' | 'familiar',
      parentesco_nome: isProprio ? '' : parentescoStr,
      nome_doenca: nome,
      medicamento: med,
      observacoes: obs,
      ativo: true,
      parentesco: parentescoStr || 'O próprio assistido',
      med,
      obs,
      detalhe: content
    };
  };

  const getCategoryListParsed = (prefixes: string[], catKey: string) => {
    const matching = rawSaude.filter((str) => prefixes.some((pfx) => str.startsWith(pfx)));
    return matching.map((item, idx) => parseHealthItemToStruct(item, catKey, idx));
  };

  const saudeCronicaList = getCategoryListParsed(['Doença Crônica:'], 'cronica');
  const saudeDepList = getCategoryListParsed(['Dependência Química:'], 'dependencia');
  const saudeMentalList = getCategoryListParsed(['Saúde Mental:'], 'mental');
  let saudeDefList = getCategoryListParsed(['Deficiência/Síndrome:', 'Deficiência:'], 'deficiencia');
  const saudeOutraList = getCategoryListParsed(['Outra Situação de Saúde:'], 'outra');

  if (saudeDefList.length === 0 && assistido.possui_deficiencia) {
    const defs =
      Array.isArray(assistido.tipos_deficiencia) && assistido.tipos_deficiencia.length > 0
        ? assistido.tipos_deficiencia.filter((d) => d && d !== 'Nenhuma').join(', ')
        : 'Deficiência física/mental';
    saudeDefList = [
      {
        id: `edit_def_auto_${Date.now()}`,
        parentesco_tipo: 'assistido',
        parentesco_nome: '',
        nome_doenca: defs,
        medicamento: '',
        observacoes: 'Deficiência identificada no cadastro',
        ativo: true,
        parentesco: 'O próprio assistido',
        med: '',
        obs: 'Deficiência identificada no cadastro',
        detalhe: defs
      }
    ];
  }

  const saudeCronicaData = saudeCronicaList[0] || {
    ativo: false,
    nome: '',
    parentesco: 'O próprio assistido',
    med: '',
    obs: '',
    detalhe: ''
  };
  const saudeDepData = saudeDepList[0] || {
    ativo: false,
    nome: '',
    parentesco: 'O próprio assistido',
    med: '',
    obs: '',
    detalhe: ''
  };
  const saudeMentalData = saudeMentalList[0] || {
    ativo: false,
    nome: '',
    parentesco: 'O próprio assistido',
    med: '',
    obs: '',
    detalhe: ''
  };
  const saudeDefData = saudeDefList[0] || {
    ativo: false,
    nome: '',
    parentesco: 'O próprio assistido',
    med: '',
    obs: '',
    detalhe: ''
  };
  const saudeOutraData = saudeOutraList[0] || {
    ativo: false,
    nome: '',
    parentesco: 'O próprio assistido',
    med: '',
    obs: '',
    detalhe: ''
  };

  const saudeDef = saudeDefList.length > 0 || Boolean(assistido.possui_deficiencia);
  const saudeDefNome = saudeDefData.nome_doenca || '';
  const saudeDefPar = saudeDefData.parentesco || 'O próprio assistido';
  const saudeDefMed = saudeDefData.medicamento || saudeDefData.med || '';
  const saudeDefObs = saudeDefData.observacoes || saudeDefData.obs || '';

  if (assistido.possui_deficiencia && !saudeDefMed) {
    if (Array.isArray(assistido.tipos_deficiencia) && assistido.tipos_deficiencia.length > 0) {
      const defsStr = assistido.tipos_deficiencia.filter((d) => d && d !== 'Nenhuma').join(', ');
      if (defsStr && !saudeDefNome) {
        // use as name/med
      }
    }
  }

  // 6. Expectativa & Motivações (Seção 12)
  const rawExp = assistido.expectativa_curso || '';
  let cursoPref: 'Sim' | 'Não' = 'Sim';
  let cursoPrefOutro = '';
  const oQuePretende: string[] = [];
  let oQuePretendeOutro = '';
  let representacaoFLH = '';
  const percepcaoHoje: string[] = [];
  let percepcaoOutro = '';
  let outrasOficinas = '';
  let naoTemInteresse = false;

  const expParts = rawExp.split(' | ').map((p) => p.trim());
  expParts.forEach((p) => {
    if (p.includes('Curso de preferência do assistido')) {
      cursoPref = 'Sim';
    } else if (p.startsWith('Preferência alternativa:')) {
      cursoPref = 'Não';
      cursoPrefOutro = p.replace('Preferência alternativa:', '').trim();
    } else if (p.startsWith('Pretende:')) {
      const itens = p.replace('Pretende:', '').trim().split(',').map((i) => i.trim());
      itens.forEach((it) => {
        if (it.startsWith('Outro:')) {
          oQuePretende.push('Outro');
          oQuePretendeOutro = it.replace('Outro:', '').trim();
        } else if (it) {
          oQuePretende.push(it);
        }
      });
    } else if (p.startsWith('Significado FLH:')) {
      representacaoFLH = p.replace('Significado FLH:', '').trim();
    } else if (p.startsWith('Percepção FLH:')) {
      const percs = p.replace('Percepção FLH:', '').trim().split(',').map((i) => i.trim());
      percs.forEach((it) => {
        if (it.startsWith('Outro:')) {
          percepcaoHoje.push('Outro');
          percepcaoOutro = it.replace('Outro:', '').trim();
        } else if (it) {
          percepcaoHoje.push(it);
        }
      });
    } else if (p.includes('Sem interesse em outras oficinas')) {
      naoTemInteresse = true;
    } else if (p.startsWith('Outras oficinas de interesse:')) {
      outrasOficinas = p.replace('Outras oficinas de interesse:', '').trim();
    }
  });

  // 7. Cursos anteriores
  let partCursosAntes: 'Sim' | 'Não' = 'Não';
  let cursosAntesDet = '';
  const rawCursos = assistido.cursos_anteriores;
  if (
    Array.isArray(rawCursos) &&
    rawCursos.length > 0 &&
    !rawCursos.includes('Não participou de cursos anteriores')
  ) {
    partCursosAntes = 'Sim';
    cursosAntesDet = rawCursos.join('; ');
  } else if (
    typeof rawCursos === 'string' &&
    rawCursos.trim() &&
    !rawCursos.toLowerCase().includes('não participou')
  ) {
    partCursosAntes = 'Sim';
    cursosAntesDet = rawCursos.trim();
  }

  const isRua =
    assistido.tipo_moradia?.toLowerCase().includes('rua') ||
    (assistido.endereco?.toLowerCase().includes('rua') &&
      assistido.endereco?.toLowerCase().includes('situação')) ||
    false;

  return {
    nome_completo: assistido.nome_completo || '',
    data_nascimento: assistido.data_nascimento || '',
    idade: assistido.idade ?? '',
    rg: assistido.rg || '',
    cpf: assistido.cpf || '',
    cartao_sus:
      (assistido as any).cartao_sus ||
      (assistido.expectativa_curso
        ? assistido.expectativa_curso.match(/Cart[ãa]o SUS:\s*([^|]+)/i)?.[1]?.trim()
        : null) ||
      '',
    autoriza_imagem:
      (assistido as any).autoriza_imagem === false ||
      (assistido as any).autoriza_imagem === 'Não' ||
      (assistido.expectativa_curso &&
        /Autoriza[çc][ãa]o de Imagem:\s*Não/i.test(assistido.expectativa_curso))
        ? 'Não'
        : 'Sim',
    telefone: assistido.telefone || '',
    escolaridade: assistido.escolaridade || 'Não informado',
    estado_civil: assistido.estado_civil || 'Não informado',
    raca_cor: assistido.raca_cor || 'Não informado',
    endereco: assistido.endereco || '',
    bairro: assistido.bairro || '',
    em_situacao_rua: isRua,
    foto_url: assistido.foto_url || null,
    possui_cadastro_flh: Boolean(assistido.possui_cadastro_flh),
    possui_cras: Boolean(assistido.possui_cras),
    bairro_cras: assistido.bairro_cras || '',
    data_ingresso: assistido.data_ingresso
      ? assistido.data_ingresso.split('T')[0]
      : assistido.created_at
      ? assistido.created_at.split('T')[0]
      : new Date().toISOString().split('T')[0],
    status_acompanhamento: (() => {
      const s = (assistido.status_curso || '').toLowerCase();
      if (s.includes('desist') || s.includes('evas') || s.includes('trancad')) {
        return 'Desistente / Evasão';
      }
      if (s.includes('conclu') || s.includes('formad')) {
        return 'Concluído';
      }
      if (s.includes('pausad')) {
        return 'Pausado';
      }
      return 'Ativo / Em Acompanhamento';
    })(),
    data_saida: (() => {
      const match = assistido.expectativa_curso?.match(/Data de Saída:\s*([^|]+)/);
      return match && match[1]?.trim() ? match[1].trim() : '';
    })(),
    motivo_evasao: (() => {
      return getAssistidoMotivoEvasao(assistido) || '';
    })(),

    atividade_remunerada: isAposentado ? 'Aposentado(a) / Pensionista' : isRemunerada ? 'Sim' : 'Não',
    ocupacao_atual: ocupacao,
    turno_trabalho: turno,
    dias_semana_trabalho_array: diasSemanaArr,
    dias_semana_trabalho: diasSemanaArr.join(', '),
    desemprego_circunstancia: desempregoCircunstancia,
    trabalhou_anteriormente: trabalhouAntes,
    area_trabalho_anterior: areaAnterior,
    faixa_renda: faixaRenda,
    renda_aproximada_valor: assistido.renda_familiar_aproximada || 0,
    programas_sociais: progs.length > 0 ? progs : ['Nenhum'],
    outro_programa_social: outroProg,

    composicao_familiar: assistido.composicao_familiar || 1,
    mora_sozinho: assistido.composicao_familiar === 1 || isRua,
    quantidade_filhos: filhos,
    acesso_internet: assistido.acesso_internet === 'Sim' ? 'Sim' : 'Não',
    tipo_moradia: isRua ? 'Situação de Rua / Sem Moradia Fixa' : tipoMoradia,
    agua_regularidade: agua,
    energia_regularidade: energia,
    servicos_basicos_gerais: servicosGerais,
    observacoes_moradia: obsMoradia,

    dificuldades_familia:
      Array.isArray(assistido.dificuldades_enfrentadas) &&
      assistido.dificuldades_enfrentadas.length > 0
        ? assistido.dificuldades_enfrentadas
        : ['Nenhuma'],
    saude_doencas_cronicas_lista: saudeCronicaList,
    saude_dependencia_quimica_lista: saudeDepList,
    saude_mental_lista: saudeMentalList,
    saude_deficiencia_lista: saudeDefList,
    saude_outra_situacao_lista: saudeOutraList,

    saude_doenca_cronica: saudeCronicaData.ativo,
    saude_doenca_cronica_parentesco: saudeCronicaData.parentesco,
    saude_doenca_cronica_nome: saudeCronicaData.nome_doenca,
    saude_doenca_cronica_medicamento: saudeCronicaData.med,
    saude_doenca_cronica_obs: saudeCronicaData.obs,
    saude_doenca_cronica_detalhe: saudeCronicaData.detalhe,

    saude_dependencia_quimica: saudeDepData.ativo,
    saude_dependencia_quimica_parentesco: saudeDepData.parentesco,
    saude_dependencia_quimica_nome: saudeDepData.nome_doenca,
    saude_dependencia_quimica_medicamento: saudeDepData.med,
    saude_dependencia_quimica_obs: saudeDepData.obs,
    saude_dependencia_quimica_detalhe: saudeDepData.detalhe,

    saude_mental: saudeMentalData.ativo,
    saude_mental_parentesco: saudeMentalData.parentesco,
    saude_mental_nome: saudeMentalData.nome_doenca,
    saude_mental_medicamento: saudeMentalData.med,
    saude_mental_obs: saudeMentalData.obs,
    saude_mental_detalhe: saudeMentalData.detalhe,

    saude_deficiencia: saudeDef,
    saude_deficiencia_parentesco: saudeDefPar,
    saude_deficiencia_nome: saudeDefNome,
    saude_deficiencia_medicamento: saudeDefMed,
    saude_deficiencia_obs: saudeDefObs,
    saude_deficiencia_detalhe: saudeDefData.detalhe,

    saude_outra_situacao: saudeOutraData.ativo,
    saude_outra_situacao_parentesco: saudeOutraData.parentesco,
    saude_outra_situacao_nome: saudeOutraData.nome_doenca,
    saude_outra_situacao_medicamento: saudeOutraData.med,
    saude_outra_situacao_obs: saudeOutraData.obs,
    saude_outra_situacao_detalhe: saudeOutraData.detalhe,

    rede_apoio_principal: assistido.rede_apoio || 'Não possui',
    fatores_risco_evasao:
      Array.isArray(assistido.fatores_risco_evasao) && assistido.fatores_risco_evasao.length > 0
        ? assistido.fatores_risco_evasao
        : ['Nenhum'],
    servicos_flh_utilizados:
      Array.isArray(assistido.servicos_acompanhamento) &&
      assistido.servicos_acompanhamento.length > 0
        ? assistido.servicos_acompanhamento
        : ['Nenhum / Nunca utilizou'],

    motivo_busca_momento: assistido.motivo_busca || '',
    oficina_pretendida: assistido.curso_pretendido || 'Informática',
    curso_e_preferencia: cursoPref,
    curso_preferencia_outro: cursoPrefOutro,
    o_que_pretende_fazer: oQuePretende,
    o_que_pretende_outro: oQuePretendeOutro,
    participou_cursos_anteriores: partCursosAntes,
    cursos_anteriores_concluiu: '',
    cursos_anteriores_detalhes: cursosAntesDet,
    objetivo_profissional_3_meses: assistido.objetivo_profissional_3_meses || '',
    representacao_flh_familia: representacaoFLH,
    percepcao_flh_hoje: percepcaoHoje,
    percepcao_flh_outro: percepcaoOutro,
    interesse_outras_oficinas: outrasOficinas,
    nao_tem_interesse_outras_oficinas: naoTemInteresse,
    status_atendimento: assistido.status_curso || 'Em Acompanhamento',
    membros_familia: Array.isArray(assistido.membros_familia) && assistido.membros_familia.length > 0
      ? assistido.membros_familia
      : (() => {
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
        })()
  };
}
