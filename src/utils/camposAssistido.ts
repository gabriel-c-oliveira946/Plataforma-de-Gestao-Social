import { Assistido } from '../components/VerFichaModal';

// Leitura de campos do assistido que podem estar gravados como texto
// combinado em outras colunas (tipo_moradia, profissao, expectativa_curso).

// Helper para extrair Data de Saída se houver
export function getAssistidoDataSaida(item: Assistido): string | null {
  if (item.expectativa_curso?.includes('Data de Saída:')) {
    const match = item.expectativa_curso.match(/Data de Saída:\s*([^|]+)/);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }
  return null;
}

// Helper para extrair quantidade de filhos de um assistido
export function getAssistidoFilhos(item: Assistido): number | null {
  if (
    item.quantidade_filhos !== undefined &&
    item.quantidade_filhos !== null &&
    !isNaN(Number(item.quantidade_filhos))
  ) {
    return Number(item.quantidade_filhos);
  }
  if (item.tipo_moradia) {
    const match = item.tipo_moradia.match(/Filhos:\s*(\d+)/);
    if (match) return Number(match[1]);
  }
  return null;
}

// Helper para obter a Faixa de Renda exata de um assistido
export function getAssistidoFaixaRenda(item: Assistido): string {
  if (item.tipo_moradia?.includes('Faixa de Renda:')) {
    const match = item.tipo_moradia.match(/Faixa de Renda:\s*([^|]+)/);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }
  if (item.profissao?.includes('Renda Familiar:')) {
    const match = item.profissao.match(/Renda Familiar:\s*([^|]+)/);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }
  const val = Number(item.renda_familiar_aproximada);
  if (isNaN(val) || val === 0) return 'Sem Renda (R$ 0)';
  if (val <= 600) return 'Até R$ 600';
  if (val <= 1200) return 'De R$ 601 a R$ 1.200';
  if (val <= 2000) return 'De R$ 1.201 a R$ 2.000';
  if (val <= 3500) return 'De R$ 2.001 a R$ 3.500';
  if (val <= 5000) return 'De R$ 3.501 a R$ 5.000';
  return 'Acima de R$ 5.000';
}
