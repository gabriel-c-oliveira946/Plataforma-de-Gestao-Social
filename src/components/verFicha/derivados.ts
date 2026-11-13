
import type { FichaBase } from './useVerFicha';

/** Valores calculados a partir da ficha (moradia, renda, saúde etc.). */
export function calcularDerivados(ctx: FichaBase) {
  const {
    assistido
  } = ctx;

  const isSituacaoRua =
    assistido.tipo_moradia?.toLowerCase().includes('rua') ||
    (assistido.endereco?.toLowerCase().includes('rua') &&
      assistido.endereco?.toLowerCase().includes('situação'));

  // =========================================================================
  // PARSERS E EXTRATORES DE DADOS DO FORMULÁRIO (PARA VISUALIZAÇÃO)
  // =========================================================================
  const moradiaParsed = (() => {
    const raw = assistido.tipo_moradia || '';
    const parts = raw.split(' | ').map((p) => p.trim());
    const tipo = parts[0] || 'Não informado';
    let agua = 'Não informada';
    let energia = 'Não informada';
    let servicosGerais = assistido.servicos_basicos_regulares
      ? 'Sim (Regulares)'
      : 'Não / Parcial';
    let filhos =
      assistido.quantidade_filhos !== undefined && assistido.quantidade_filhos !== null
        ? String(assistido.quantidade_filhos)
        : '';
    let obs = '';

    parts.forEach((p) => {
      if (p.startsWith('Água:')) {
        agua = p.replace('Água:', '').trim();
      } else if (p.startsWith('Energia:')) {
        energia = p.replace('Energia:', '').trim();
      } else if (
        p.startsWith('Serviços Básicos Gerais:') ||
        p.startsWith('Serviços Gerais:')
      ) {
        servicosGerais = p.split(':')[1]?.trim() || servicosGerais;
      } else if (p.startsWith('Filhos:') || p.startsWith('Quantidade de Filhos:')) {
        filhos = p.split(':')[1]?.trim() || filhos;
      } else if (p.startsWith('Obs:')) {
        obs = p.replace('Obs:', '').trim();
      }
    });

    return { tipo, agua, energia, servicosGerais, filhos, obs, raw };
  })();

  const faixaRendaParsed = (() => {
    if (assistido.tipo_moradia?.includes('Faixa de Renda:')) {
      const match = assistido.tipo_moradia.match(/Faixa de Renda:\s*([^|]+)/);
      if (match && match[1]?.trim()) {
        return match[1].trim();
      }
    }
    if (assistido.profissao?.includes('Renda Familiar:')) {
      const match = assistido.profissao.match(/Renda Familiar:\s*([^|]+)/);
      if (match && match[1]?.trim()) {
        return match[1].trim();
      }
    }
    const val = Number(assistido.renda_familiar_aproximada);
    if (isNaN(val) || val === 0) return 'Sem Renda (R$ 0)';
    if (val <= 600) return 'Até R$ 600';
    if (val <= 1200) return 'De R$ 601 a R$ 1.200';
    if (val <= 2000) return 'De R$ 1.201 a R$ 2.000';
    if (val <= 3500) return 'De R$ 2.001 a R$ 3.500';
    if (val <= 5000) return 'De R$ 3.501 a R$ 5.000';
    return 'Acima de R$ 5.000';
  })();

  const trabalhoParsed = (() => {
    const raw = assistido.profissao || '';
    const isRemunerada = assistido.atividade_remunerada === 'Sim';
    let ocupacao = '';
    let dias = '';
    let turno = '';
    let desempregoJustificativa = '';
    let trabalhouAnteriormente = '';
    let areaAnterior = '';

    const parts = raw.split(' | ').map((p) => p.trim());
    parts.forEach((p) => {
      if (p.startsWith('Ocupação:')) {
        ocupacao = p.replace('Ocupação:', '').trim();
      } else if (p.startsWith('Dias:')) {
        dias = p.replace('Dias:', '').trim();
      } else if (p.startsWith('Turno:')) {
        turno = p.replace('Turno:', '').trim();
      } else if (
        p.startsWith('Causa/Justificativa:') ||
        p.startsWith('Justificativa/Ações:') ||
        p.startsWith('Motivo/Ações:')
      ) {
        desempregoJustificativa = p.split(':')[1]?.trim() || '';
      } else if (p.startsWith('Já trabalhou anteriormente:')) {
        trabalhouAnteriormente = p.replace('Já trabalhou anteriormente:', '').trim();
      } else if (p.startsWith('Trabalho anterior:')) {
        areaAnterior = p.replace('Trabalho anterior:', '').trim();
      } else if (p.includes('(Dias:') && p.includes('Turno:')) {
        const match = p.match(/^([^(]+)\s*\(Dias:\s*([^|]+)\|\s*Turno:\s*([^)]+)\)/);
        if (match) {
          ocupacao = match[1]?.trim() || '';
          dias = match[2]?.trim() || '';
          turno = match[3]?.trim() || '';
        }
      }
    });

    return {
      isRemunerada,
      ocupacao: ocupacao || (isRemunerada ? raw : 'Não informada'),
      dias: dias || 'Não informado',
      turno: turno || 'Não informado',
      desempregoJustificativa,
      trabalhouAnteriormente,
      areaAnterior,
      raw
    };
  })();

  const expectativaParsed = (() => {
    const raw = assistido.expectativa_curso || '';
    let preferencia = 'Sim, é o curso de preferência';
    let preferenciaOutro = '';
    let oQuePretende: string[] = [];
    let representacaoFLH = '';
    let outrasOficinas = '';
    let naoTemInteresse = false;

    const parts = raw.split(' | ').map((p) => p.trim());
    parts.forEach((p) => {
      if (p.includes('Curso de preferência do assistido')) {
        preferencia = 'Sim, é o curso de sua preferência';
      } else if (p.startsWith('Preferência alternativa:')) {
        preferencia = 'Não';
        preferenciaOutro = p.replace('Preferência alternativa:', '').trim();
      } else if (p.startsWith('Pretende:')) {
        const itens = p.replace('Pretende:', '').trim();
        oQuePretende = itens
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean);
      } else if (p.startsWith('Significado FLH:')) {
        representacaoFLH = p.replace('Significado FLH:', '').trim();
      } else if (p.includes('Sem interesse em outras oficinas')) {
        naoTemInteresse = true;
      } else if (p.startsWith('Outras oficinas de interesse:')) {
        outrasOficinas = p.replace('Outras oficinas de interesse:', '').trim();
      }
    });

    return {
      preferencia,
      preferenciaOutro,
      oQuePretende,
      representacaoFLH,
      outrasOficinas,
      naoTemInteresse,
      raw
    };
  })();

  const saudeFamiliaTabela = (() => {
    const itemsRaw = Array.isArray(assistido.doencas_cronicas_familia)
      ? assistido.doencas_cronicas_familia
      : typeof assistido.doencas_cronicas_familia === 'string'
      ? [assistido.doencas_cronicas_familia]
      : [];

    const rows = [
      {
        id: 'cronica',
        titulo: 'Doença Crônica',
        subtitulo: 'Hipertensão, diabetes, cardiopatias, asma, etc.',
        registrada: false,
        detalhes: 'Nenhuma condição relatada'
      },
      {
        id: 'dependencia',
        titulo: 'Dependência Química',
        subtitulo: 'Álcool, tabaco ou outras substâncias',
        registrada: false,
        detalhes: 'Nenhuma condição relatada'
      },
      {
        id: 'mental',
        titulo: 'Sofrimento Psíquico Grave / Saúde Mental',
        subtitulo: 'Depressão grave, ansiedade, transtornos psiquiátricos',
        registrada: false,
        detalhes: 'Nenhuma condição relatada'
      },
      {
        id: 'deficiencia',
        titulo: 'Deficiência / Síndrome',
        subtitulo: 'Física, auditiva, visual, intelectual, autismo (TEA), etc.',
        registrada: false,
        detalhes: 'Nenhuma condição relatada'
      },
      {
        id: 'outra',
        titulo: 'Outra Situação Relevante de Saúde',
        subtitulo: 'Sequelas de AVC, membro acamado, neoplasias, cirurgias recentes',
        registrada: false,
        detalhes: 'Nenhuma condição relatada'
      }
    ];

    itemsRaw.forEach((item) => {
      if (item.startsWith('Doença Crônica:')) {
        const val = item.replace('Doença Crônica:', '').trim();
        rows[0].registrada = true;
        rows[0].detalhes = val && val !== 'Sim' ? val : 'Condição registrada na família';
      } else if (item.startsWith('Dependência Química:')) {
        const val = item.replace('Dependência Química:', '').trim();
        rows[1].registrada = true;
        rows[1].detalhes = val && val !== 'Sim' ? val : 'Condição registrada na família';
      } else if (item.startsWith('Saúde Mental:')) {
        const val = item.replace('Saúde Mental:', '').trim();
        rows[2].registrada = true;
        rows[2].detalhes = val && val !== 'Sim' ? val : 'Condição registrada na família';
      } else if (
        item.startsWith('Deficiência/Síndrome:') ||
        item.startsWith('Deficiência:')
      ) {
        const val = item.replace(/Deficiência(\/Síndrome)?:/, '').trim();
        rows[3].registrada = true;
        rows[3].detalhes = val && val !== 'Sim' ? val : 'Condição registrada na família';
      } else if (item.startsWith('Outra Situação de Saúde:')) {
        const val = item.replace('Outra Situação de Saúde:', '').trim();
        rows[4].registrada = true;
        rows[4].detalhes = val && val !== 'Sim' ? val : 'Condição registrada na família';
      }
    });

    if (assistido.possui_deficiencia && !rows[3].registrada) {
      rows[3].registrada = true;
      const defs = Array.isArray(assistido.tipos_deficiencia)
        ? assistido.tipos_deficiencia.filter((d) => d && d !== 'Nenhuma').join(', ')
        : '';
      rows[3].detalhes = defs || 'Deficiência registrada no cadastro do assistido';
    }

    return rows;
  })();

  const cursosAnterioresInfo = (() => {
    const raw = assistido.cursos_anteriores;
    if (Array.isArray(raw)) {
      if (raw.length === 0 || raw.includes('Não participou de cursos anteriores')) {
        return { participou: false, texto: 'Não participou de cursos anteriores' };
      }
      return { participou: true, texto: raw.join('; ') };
    }
    if (typeof raw === 'string' && raw.trim()) {
      if (raw.toLowerCase().includes('não participou')) {
        return { participou: false, texto: 'Não participou de cursos anteriores' };
      }
      return { participou: true, texto: raw.trim() };
    }
    return { participou: false, texto: 'Não participou de cursos anteriores' };
  })();

  return {
    isSituacaoRua,
    moradiaParsed,
    faixaRendaParsed,
    trabalhoParsed,
    expectativaParsed,
    saudeFamiliaTabela,
    cursosAnterioresInfo
  };
}

export type FichaDerivados = ReturnType<typeof calcularDerivados>;
