import { useEffect, useMemo, useState } from 'react';
import { assistidosService } from '../services/assistidosService';
import { voluntariosService } from '../services/voluntariosService';

/**
 * Cruzamento de pessoas entre os módulos (assistidos e voluntários) pelo CPF.
 * É um passo intermediário: enquanto não existe um cadastro único de pessoas,
 * cada módulo continua com sua tabela, e o CPF liga as duas fichas.
 */

export type OrigemPessoa = 'assistidos' | 'voluntarios';

export interface ResumoPessoa {
  id: string;
  nome: string;
  cpf: string; // apenas dígitos
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
}

/** CPF só com dígitos, ou '' se não tiver 11 dígitos. */
export function cpfDigitos(cpf?: string | null): string {
  const d = (cpf || '').replace(/\D/g, '');
  return d.length === 11 ? d : '';
}

const VALIDADE_MS = 30_000;
const cache: Partial<Record<OrigemPessoa, { em: number; promessa: Promise<ResumoPessoa[]> }>> = {};

async function buscar(origem: OrigemPessoa): Promise<ResumoPessoa[]> {
  if (origem === 'assistidos') {
    const lista = await assistidosService.listarResumos();
    return lista.map((a) => ({
      id: a.id,
      nome: a.nome_completo,
      cpf: cpfDigitos(a.cpf),
      data_nascimento: a.data_nascimento || null,
      telefone: a.telefone || null,
      email: null,
      endereco: [a.endereco, a.bairro].filter(Boolean).join(' - ') || null
    }));
  }
  const lista = await voluntariosService.listarResumos();
  return lista.map((v) => ({
    id: v.id,
    nome: v.nome_completo,
    cpf: cpfDigitos(v.cpf),
    data_nascimento: v.data_nascimento || null,
    telefone: v.celular || v.telefone || null,
    email: v.email || null,
    endereco: v.endereco || null
  }));
}

function carregar(origem: OrigemPessoa): Promise<ResumoPessoa[]> {
  const c = cache[origem];
  if (c && Date.now() - c.em < VALIDADE_MS) return c.promessa;
  const promessa = buscar(origem).catch((err) => {
    console.warn(`Cruzamento por CPF indisponível (${origem}):`, err);
    delete cache[origem];
    return [] as ResumoPessoa[];
  });
  cache[origem] = { em: Date.now(), promessa };
  return promessa;
}

/** Descarta o cache depois de cadastrar ou editar alguém. */
export function invalidarResumosPessoas(): void {
  delete cache.assistidos;
  delete cache.voluntarios;
}

function indexar(lista: ResumoPessoa[]): Map<string, ResumoPessoa[]> {
  const mapa = new Map<string, ResumoPessoa[]>();
  for (const p of lista) {
    if (!p.cpf) continue;
    mapa.set(p.cpf, [...(mapa.get(p.cpf) || []), p]);
  }
  return mapa;
}

/** Índices por CPF das duas bases. `versao` força recarregar (ex.: após salvar). */
export function usePessoasPorCpf(versao: unknown = 0) {
  const [listas, setListas] = useState<{ assistidos: ResumoPessoa[]; voluntarios: ResumoPessoa[] } | null>(null);
  useEffect(() => {
    let ativo = true;
    Promise.all([carregar('assistidos'), carregar('voluntarios')]).then(([assistidos, voluntarios]) => {
      if (ativo) setListas({ assistidos, voluntarios });
    });
    return () => {
      ativo = false;
    };
  }, [versao]);
  return useMemo(
    () => ({
      carregado: listas !== null,
      assistidos: indexar(listas?.assistidos || []),
      voluntarios: indexar(listas?.voluntarios || [])
    }),
    [listas]
  );
}
