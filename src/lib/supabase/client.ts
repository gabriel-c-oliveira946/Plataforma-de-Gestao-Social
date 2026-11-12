import { createClient } from '@supabase/supabase-js';

const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;

/**
 * Modo local (somente desenvolvimento): ativado quando o projeto roda SEM
 * as variáveis do Supabase. Nesse modo os dados de exemplo ficam no
 * localStorage. Com o Supabase configurado (produção e demo), NENHUM dado
 * de assistidos ou voluntários é guardado no navegador.
 */
export const MODO_LOCAL = !envUrl;

const supabaseUrl = envUrl || 'https://placeholder-larharmonia.supabase.co';
const supabaseAnonKey = envKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/** Chaves antigas em que versões anteriores guardavam fichas no navegador. */
const CHAVES_CACHE_LEGADO = ['lar_harmonia_assistidos_store', 'lar_harmonia_voluntarios_store'];

/**
 * Remove do navegador cópias de dados pessoais deixadas por versões
 * anteriores do sistema. Chamado na inicialização e no logout.
 */
export function limparDadosPessoaisDoNavegador(): void {
  if (MODO_LOCAL) return;
  try {
    CHAVES_CACHE_LEGADO.forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage indisponível (ex.: navegação privada) — nada a limpar
  }
}

limparDadosPessoaisDoNavegador();
