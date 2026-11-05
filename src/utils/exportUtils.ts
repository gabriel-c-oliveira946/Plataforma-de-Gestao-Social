import { Assistido } from '../types/assistido';
import {
  getAssistidoFaixaRenda,
  getAssistidoFilhos
} from '../pages/Dashboard';
import {
  getAssistidoMotivoEvasao,
  isPendenteAvaliacao4Meses
} from './avaliacao4Meses';

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

  // Nomes exatos das colunas (sem ID Cadastral)
  const headers = [
    'Nome Completo',
    'CPF',
    'RG / Documento',
    'Cor / Raça / Etnia',
    'Idade / Data de Nascimento',
    'Estado Civil',
    'Telefone / Contato',
    'Endereço Completo',
    'Bairro / Localidade',
    'Cadastro no CRAS',
    'Escolaridade',
    'Composição Familiar (Pessoas)',
    'Filhos',
    'Atividade Remunerada',
    'Ocupação Atual',
    'Faixa de Renda (Renda Familiar / Própria)',
    'Programas Sociais',
    'Tipo de Moradia',
    'Infraestrutura Básica',
    'Acesso à Internet',
    'Condições de Saúde na Família',
    'Dificuldades Enfrentadas pela Família',
    'Rede de Apoio Principal',
    'Serviços FLH Utilizados',
    'Oficina Pretendida',
    'Objetivos Pós-Oficina / O que Pretende Fazer',
    'Data de Ingresso',
    'Status do Acompanhamento',
    'Motivo da Evasão / Desistência',
    'Pendente Avaliação 4 Meses? (Sim/Não)'
  ];

  const rows = assistidos.map((item) => {
    // 1. Nome Completo
    const nome = item.nome_completo || item.nome || 'Não informado';

    // 2. CPF
    const cpf = item.cpf || 'Não informado';

    // 3. RG / Documento
    const rg = item.rg || 'Não informado';

    // 4. Cor / Raça / Etnia
    const racaCor = item.raca_cor || 'Não informado';

    // 5. Idade / Data de Nascimento
    const idadeVal =
      item.idade !== null && item.idade !== undefined && item.idade !== ''
        ? `${item.idade} anos`
        : '';
    const nascVal = item.data_nascimento ? formatDate(item.data_nascimento) : '';
    let idadeDataNasc = 'Não informado';
    if (idadeVal && nascVal) {
      idadeDataNasc = `${idadeVal} (${nascVal})`;
    } else if (idadeVal) {
      idadeDataNasc = idadeVal;
    } else if (nascVal) {
      idadeDataNasc = nascVal;
    }

    // 6. Estado Civil
    const estadoCivil = item.estado_civil || 'Não informado';

    // 7. Telefone / Contato
    const telefone = item.telefone || 'Não informado';

    // 8. Endereço Completo
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

    // 9. Bairro / Localidade
    const bairroLocalidade = isRua
      ? 'Em situação de rua'
      : item.bairro || item.bairro_cras || item.endereco || 'Não informado';

    // 10. Cadastro no CRAS
    let cadastroCRAS = 'Não informado';
    if (item.possui_cras === true) {
      cadastroCRAS = item.bairro_cras?.trim()
        ? `Sim (${item.bairro_cras.trim()})`
        : 'Sim (Unidade/Bairro não especificado)';
    } else if (item.possui_cras === false) {
      cadastroCRAS = 'Não possui cadastro';
    }

    // 11. Escolaridade
    const escolaridade = item.escolaridade || 'Não informada';

    // 12. Composição Familiar
    const composicao =
      item.composicao_familiar !== undefined &&
      item.composicao_familiar !== null &&
      item.composicao_familiar !== ''
        ? `${item.composicao_familiar} pessoa(s)`
        : 'Não informada';

    // 13. Filhos
    const qtdFilhos = getAssistidoFilhos(item as any);
    const filhos = qtdFilhos !== null ? `${qtdFilhos} filho(s)` : 'Não informado';

    // 14. Atividade Remunerada
    const atividadeRemunerada = item.atividade_remunerada || 'Não informada';

    // 15. Ocupação Atual
    let ocupacao = item.profissao || 'Não informada';
    if (ocupacao.includes('(Dias:') && ocupacao.includes('Turno:')) {
      const match = ocupacao.match(/^([^(]+)\s*\(Dias:/);
      if (match && match[1]?.trim()) {
        ocupacao = match[1].trim();
      }
    }

    // 16. Faixa de Renda
    const faixaRenda = getAssistidoFaixaRenda(item as any);

    // 17. Programas Sociais
    const programasSociais = formatList(
      item.beneficios_sociais,
      'Nenhum benefício/programa social'
    );

    // 18. Tipo de Moradia
    let tipoMoradia = item.tipo_moradia || 'Não informado';
    if (tipoMoradia.includes('|')) {
      tipoMoradia = tipoMoradia.split('|')[0].trim();
    }

    // 19. Infraestrutura Básica
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

    // 20. Acesso à Internet
    const internet = item.acesso_internet || 'Não informado';

    // 21. Condições de Saúde na Família
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

    // 22. Dificuldades Enfrentadas pela Família
    const dificuldades = formatList(
      item.dificuldades_enfrentadas,
      'Nenhuma dificuldade registrada'
    );

    // 23. Rede de Apoio Principal
    const redeApoio = item.rede_apoio || 'Não informada';

    // 24. Serviços FLH Utilizados
    const servicosFLH = formatList(
      item.servicos_acompanhamento,
      'Nenhum / Nunca utilizou'
    );

    // 25. Oficina Pretendida
    const oficina = item.curso_pretendido || 'Nenhuma oficina vinculada';

    // 26. Objetivos Pós-Oficina / O que Pretende Fazer
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

    // 27. Data de Ingresso
    const dataIngresso = formatDate(item.data_ingresso || item.created_at);

    // 28. Status do Acompanhamento
    const statusAcompanhamento = item.status_curso || 'Ativo / Em Acompanhamento';

    // 29. Motivo da Evasão / Desistência
    const motivoEvasao = getAssistidoMotivoEvasao(item) || 'Não se aplica';

    // 30. Pendente Avaliação 4 Meses?
    const pendente4Meses = isPendenteAvaliacao4Meses(item) ? 'Sim' : 'Não';

    return [
      escapeCSV(nome),
      escapeCSV(cpf),
      escapeCSV(rg),
      escapeCSV(racaCor),
      escapeCSV(idadeDataNasc),
      escapeCSV(estadoCivil),
      escapeCSV(telefone),
      escapeCSV(enderecoCompleto),
      escapeCSV(bairroLocalidade),
      escapeCSV(cadastroCRAS),
      escapeCSV(escolaridade),
      escapeCSV(composicao),
      escapeCSV(filhos),
      escapeCSV(atividadeRemunerada),
      escapeCSV(ocupacao),
      escapeCSV(faixaRenda),
      escapeCSV(programasSociais),
      escapeCSV(tipoMoradia),
      escapeCSV(infraestrutura),
      escapeCSV(internet),
      escapeCSV(saudeFamilia),
      escapeCSV(dificuldades),
      escapeCSV(redeApoio),
      escapeCSV(servicosFLH),
      escapeCSV(oficina),
      escapeCSV(objetivos),
      escapeCSV(dataIngresso),
      escapeCSV(statusAcompanhamento),
      escapeCSV(motivoEvasao),
      escapeCSV(pendente4Meses)
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
