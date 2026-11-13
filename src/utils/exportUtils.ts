import { Assistido } from '../types/assistido';
import {
  getAssistidoFaixaRenda,
  getAssistidoFilhos
} from './camposAssistido';
import {
  getAssistidoMotivoEvasao,
  isPendenteAvaliacao4Meses
} from './avaliacao4Meses';
import {
  autorizacaoImagem,
  descreverNascimentoMembro,
  normalizarProgramas,
  normalizarSexo,
  rotuloAutorizacaoImagem
} from './familia';

/**
 * Formata data no padrão brasileiro DD/MM/AAAA
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Não registrada';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

/**
 * Utilitário para sanitizar e formatar arrays/listas em texto legível para CSV/Excel
 */
function formatList(
  val?: string[] | string | null,
  fallback = 'Nenhum / Não informado',
  separator = ', '
): string {
  if (!val) return fallback;
  if (Array.isArray(val)) {
    const clean = val
      .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
      .filter(
        (item) =>
          item &&
          !item.toLowerCase().includes('nenhum') &&
          !item.toLowerCase().includes('não informado')
      );
    return clean.length > 0 ? clean.join(separator) : fallback;
  }
  if (typeof val === 'string' && val.trim()) {
    const clean = val.trim();
    if (clean.toLowerCase() === 'nenhum' || clean.toLowerCase() === 'nenhuma') {
      return fallback;
    }
    return clean;
  }
  return fallback;
}

/**
 * Exporta a lista de assistidos para um arquivo CSV formatado com BOM UTF-8 (compatível com Microsoft Excel)
 * Sem ID Cadastral e com todas as colunas organizadas por grupos socioeconômicos e demográficos.
 */
export function exportAssistidosToCSV(assistidos: Assistido[]): {
  success: boolean;
  count: number;
  filename: string;
} {
  if (!assistidos || assistidos.length === 0) {
    return { success: false, count: 0, filename: '' };
  }

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).trim();
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Nomes exatos e organizados das colunas (SEM ID Cadastral)
  const headers = [
    // Identificação
    'Nome Completo',
    'CPF',
    'RG / Documento',
    'Número do Cartão SUS',
    'Sexo',
    'Idade',
    'Data de Nascimento',
    'Cor / Raça / Etnia',
    'Estado Civil',
    'Telefone / Contato',
    'Endereço Completo',
    'Bairro / Localidade',
    'Situação de Rua',
    'Autorização Uso de Imagem',
    'Programas FLH',
    'Total de Pessoas na Família (cadastradas)',

    // Acompanhamento
    'Data de Ingresso',
    'Status do Acompanhamento',
    'Fatores de Desistência / Motivo Evasão',
    'Cadastro no CRAS',

    // Renda & Trabalho
    'Escolaridade',
    'Ocupação / Atividade',
    'Turno de Trabalho',
    'Faixa de Renda',
    'Programas Sociais',

    // Moradia
    'Tipo de Moradia',
    'Composição Familiar (Pessoas)',
    'Quantidade de Filhos',
    'Membros do Núcleo Familiar (Nome / Vínculo / Projeto)',
    'Acesso à Internet',
    'Serviços Básicos',

    // Saúde & Vulnerabilidades
    'Condições de Saúde na Família',
    'Dificuldades Enfrentadas pela Família',
    'Rede de Apoio Principal',

    // Oficinas & Objetivos
    'Oficina Pretendida',
    'Objetivos Futuros / Pós-Oficina'
  ];

  const rows = assistidos.map((item) => {
    // 1. Nome Completo
    const nome = item.nome_completo || item.nome || 'Não informado';

    // 2. CPF
    const cpf = item.cpf || 'Não informado';

    // 3. RG / Documento
    const rg = item.rg || 'Não informado';

    // 4. Cartão SUS
    const cartaoSus =
      (item as any).cartao_sus ||
      (item.expectativa_curso
        ? item.expectativa_curso.match(/Cart[ãa]o SUS:\s*([^|]+)/i)?.[1]?.trim()
        : null) ||
      'Não informado';

    // 5. Idade
    const idade =
      item.idade !== null && item.idade !== undefined && item.idade !== ''
        ? `${item.idade} anos`
        : 'Não informada';

    // 6. Data de Nascimento
    const dataNasc = item.data_nascimento ? formatDate(item.data_nascimento) : 'Não informada';

    // 7. Cor / Raça / Etnia
    const racaCor = item.raca_cor || 'Não informado';

    // 8. Estado Civil
    const estadoCivil = item.estado_civil || 'Não informado';

    // 9. Telefone / Contato
    const telefone = item.telefone || 'Não informado';

    // 10. Endereço Completo
    const isRua =
      item.em_situacao_rua ||
      item.tipo_moradia?.toLowerCase().includes('rua') ||
      item.endereco?.toLowerCase().includes('rua') ||
      item.endereco?.toLowerCase().includes('situação');

    let enderecoCompleto = 'Não informado';
    if (isRua) {
      enderecoCompleto = 'Em situação de rua / Sem moradia fixa';
    } else {
      const addr = item.endereco?.trim() || '';
      const neighborhood = item.bairro?.trim() || '';
      if (addr && neighborhood && !addr.toLowerCase().includes(neighborhood.toLowerCase())) {
        enderecoCompleto = `${addr} - Bairro: ${neighborhood}`;
      } else if (addr) {
        enderecoCompleto = addr;
      } else if (neighborhood) {
        enderecoCompleto = `Bairro: ${neighborhood}`;
      }
    }

    // 11. Bairro / Localidade
    const bairroLocalidade = isRua
      ? 'Em situação de rua'
      : item.bairro || item.bairro_cras || item.endereco || 'Não informado';

    // 12. Situação de Rua
    const situacaoRua = isRua ? 'Sim' : 'Não';

    // 13. Autorização de Uso de Imagem
    const autorizaImagem = rotuloAutorizacaoImagem(autorizacaoImagem(item as any));
    const sexo = normalizarSexo((item as any).sexo) || 'Não informado';
    const programas = normalizarProgramas((item as any).programas).join(', ') || 'Não informado';
    const totalPessoasFamilia = String(1 + (Array.isArray(item.membros_familia) ? item.membros_familia.length : 0));

    // 14. Data de Ingresso
    const dataIngresso = formatDate(item.data_ingresso || item.created_at);

    // 15. Status do Acompanhamento
    const statusAcompanhamento = item.status_curso || 'Ativo / Em Acompanhamento';

    // 16. Fatores de Desistência / Motivo Evasão
    const motivoEvasao = getAssistidoMotivoEvasao(item) || 'Não se aplica';

    // 17. Cadastro no CRAS
    let cadastroCRAS = 'Não informado';
    if (item.possui_cras === true) {
      cadastroCRAS = item.bairro_cras?.trim()
        ? `Sim (${item.bairro_cras.trim()})`
        : 'Sim (Unidade/Bairro não especificado)';
    } else if (item.possui_cras === false) {
      cadastroCRAS = 'Não possui cadastro';
    }

    // 18. Escolaridade
    const escolaridade = item.escolaridade || 'Não informada';

    // 19. Ocupação / Atividade
    let ocupacao = item.profissao || 'Não informada';
    if (ocupacao.includes('(Dias:') && ocupacao.includes('Turno:')) {
      const match = ocupacao.match(/^([^(]+)\s*\(Dias:/);
      if (match && match[1]?.trim()) {
        ocupacao = match[1].trim();
      }
    }

    // 20. Turno de Trabalho
    let turno = 'Não informado';
    if (item.profissao?.includes('Turno:')) {
      const match = item.profissao.match(/Turno:\s*([^|)]+)/);
      if (match && match[1]?.trim()) {
        turno = match[1].trim();
      }
    }

    // 21. Faixa de Renda
    const faixaRenda = getAssistidoFaixaRenda(item as any);

    // 22. Programas Sociais
    const programasSociais = formatList(
      item.beneficios_sociais,
      'Nenhum benefício/programa social'
    );

    // 23. Tipo de Moradia
    let tipoMoradia = item.tipo_moradia || 'Não informado';
    if (tipoMoradia.includes('|')) {
      tipoMoradia = tipoMoradia.split('|')[0].trim();
    }

    // 24. Composição Familiar
    const composicao =
      item.composicao_familiar !== undefined &&
      item.composicao_familiar !== null &&
      item.composicao_familiar !== ''
        ? `${item.composicao_familiar} pessoa(s)`
        : 'Não informada';

    // 25. Quantidade de Filhos
    const qtdFilhos = getAssistidoFilhos(item as any);
    const filhos = qtdFilhos !== null ? `${qtdFilhos} filho(s)` : 'Não informado';

    // 25.1 Membros do Núcleo Familiar
    let membrosList: any[] = [];
    if (Array.isArray((item as any).membros_familia) && (item as any).membros_familia.length > 0) {
      membrosList = (item as any).membros_familia;
    } else if (item.expectativa_curso) {
      const match = item.expectativa_curso.match(/\[Membros da Fam[íi]lia:\s*([\s\S]*?)\]/i);
      if (match && match[1]?.trim()) {
        try {
          const parsed = JSON.parse(match[1].trim());
          if (Array.isArray(parsed)) membrosList = parsed;
        } catch {}
      }
    }

    const membrosFormatados =
      membrosList.length > 0
        ? membrosList
            .map((m: any) => {
              const nomeM = m.nome_membro || m.nome || 'Membro sem nome';
              const vinc = m.vinculo || m.parentesco || 'Familiar';
              const vincCompleto = vinc === 'Outro' && m.outro_vinculo ? `Outro: ${m.outro_vinculo}` : vinc;
              const idadeNasc = m.data_nasc_idade ? ` - ${descreverNascimentoMembro(m.data_nasc_idade)}` : '';
              const sexoM = normalizarSexo(m.sexo) ? ` - ${normalizarSexo(m.sexo)}` : '';
              const proj = m.projeto_oficina || 'Não informado';
              const projCompleto = proj === 'Outro' && m.outro_projeto ? `Outro: ${m.outro_projeto}` : proj;
              return `${nomeM} (${vincCompleto}${idadeNasc}${sexoM} - Projeto/Oficina: ${projCompleto})`;
            })
            .join('; ')
        : 'Nenhum membro dependente cadastrado';

    // 26. Acesso à Internet
    const internet = item.acesso_internet || 'Não informado';

    // 27. Serviços Básicos
    const infraList: string[] = [];
    if (item.tipo_moradia?.includes('|')) {
      const parts = item.tipo_moradia.split('|').map((p) => p.trim());
      parts.forEach((p) => {
        if (
          p.startsWith('Água:') ||
          p.startsWith('Energia:') ||
          p.startsWith('Serviços Básicos')
        ) {
          infraList.push(p);
        }
      });
    }
    let infraestrutura = infraList.length > 0 ? infraList.join(', ') : '';
    if (!infraestrutura) {
      if (item.servicos_basicos_regulares === true) {
        infraestrutura = 'Água e Energia Regulares';
      } else if (item.servicos_basicos_regulares === false) {
        infraestrutura = 'Serviços Irregulares / Incompletos';
      } else {
        infraestrutura = 'Não informada';
      }
    }

    // 28. Condições de Saúde na Família
    const saudeList: string[] = [];
    if (Array.isArray(item.doencas_cronicas_familia)) {
      const valid = item.doencas_cronicas_familia.filter(
        (d) =>
          d &&
          !d.toLowerCase().includes('nenhum') &&
          !d.toLowerCase().includes('não informado')
      );
      saudeList.push(...valid);
    } else if (
      typeof item.doencas_cronicas_familia === 'string' &&
      item.doencas_cronicas_familia.trim() &&
      !item.doencas_cronicas_familia.toLowerCase().includes('nenhum')
    ) {
      saudeList.push(item.doencas_cronicas_familia.trim());
    }
    if (item.possui_deficiencia) {
      const defStr =
        Array.isArray(item.tipos_deficiencia) && item.tipos_deficiencia.length > 0
          ? item.tipos_deficiencia.join(', ')
          : 'Sim';
      saudeList.push(`Deficiência/PcD: ${defStr}`);
    }
    const saudeFamilia =
      saudeList.length > 0 ? saudeList.join('; ') : 'Nenhuma condição registrada';

    // 29. Dificuldades Enfrentadas pela Família
    const dificuldades = formatList(
      item.dificuldades_enfrentadas,
      'Nenhuma dificuldade registrada'
    );

    // 30. Rede de Apoio Principal
    const redeApoio = item.rede_apoio || 'Não informada';

    // 31. Oficina Pretendida
    const oficina = item.curso_pretendido || 'Nenhuma oficina vinculada';

    // 32. Objetivos Futuros / Pós-Oficina
    let objetivos = item.objetivo_profissional_3_meses || '';
    if (!objetivos && item.expectativa_curso?.includes('Pretende:')) {
      const match = item.expectativa_curso.match(/Pretende:\s*([^|]+)/);
      if (match && match[1]?.trim()) {
        objetivos = match[1].trim();
      }
    }
    if (!objetivos && item.motivo_busca) {
      objetivos = item.motivo_busca;
    }
    if (!objetivos) {
      objetivos = 'Não informado';
    }

    return [
      escapeCSV(nome),
      escapeCSV(cpf),
      escapeCSV(rg),
      escapeCSV(cartaoSus),
      escapeCSV(sexo),
      escapeCSV(idade),
      escapeCSV(dataNasc),
      escapeCSV(racaCor),
      escapeCSV(estadoCivil),
      escapeCSV(telefone),
      escapeCSV(enderecoCompleto),
      escapeCSV(bairroLocalidade),
      escapeCSV(situacaoRua),
      escapeCSV(autorizaImagem),
      escapeCSV(programas),
      escapeCSV(totalPessoasFamilia),
      escapeCSV(dataIngresso),
      escapeCSV(statusAcompanhamento),
      escapeCSV(motivoEvasao),
      escapeCSV(cadastroCRAS),
      escapeCSV(escolaridade),
      escapeCSV(ocupacao),
      escapeCSV(turno),
      escapeCSV(faixaRenda),
      escapeCSV(programasSociais),
      escapeCSV(tipoMoradia),
      escapeCSV(composicao),
      escapeCSV(filhos),
      escapeCSV(membrosFormatados),
      escapeCSV(internet),
      escapeCSV(infraestrutura),
      escapeCSV(saudeFamilia),
      escapeCSV(dificuldades),
      escapeCSV(redeApoio),
      escapeCSV(oficina),
      escapeCSV(objetivos)
    ];
  });

  // Delimitador ';' padrão para Excel em português com UTF-8 BOM (\uFEFF)
  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCSV).join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');

  const today = new Date().toISOString().split('T')[0];
  const filename = `relatorio_assistidos_lar_harmonia_${today}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: assistidos.length, filename };
}
