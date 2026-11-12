// Edge Function: criar-membro
// ---------------------------------------------------------------------
// Cria um novo membro da equipe. Roda no servidor do Supabase, onde a
// chave service_role fica protegida (ela NUNCA vai para o navegador).
//
// 1. Confere, com o token de quem chamou, se essa pessoa é admin ATIVO
//    (usa a função public.papel_atual() criada na etapa 1 do RLS).
// 2. Cria o usuário no Supabase Auth já confirmado.
// 3. Cria o perfil em public.profiles com o cargo escolhido.
//
// Com esta função publicada, o cadastro público pode (e deve) ser
// desligado em Authentication > Sign In / Providers.
// ---------------------------------------------------------------------
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const CARGOS: Record<string, string> = {
  admin: 'Admin',
  servico_social: 'Serviço Social',
  recepcao: 'Recepção'
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 1. Quem está chamando é admin ativo?
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false }
  });
  const { data: papel, error: papelError } = await caller.rpc('papel_atual');
  if (papelError || papel !== 'admin') {
    return json({ error: 'Apenas a Diretoria pode cadastrar novos membros.' }, 403);
  }

  // 2. Validação dos dados
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Dados inválidos.' }, 400);
  }
  const nome = String(body.nome ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const role = String(body.role ?? '');

  if (!nome) return json({ error: 'Informe o nome do membro.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'E-mail inválido.' }, 400);
  if (password.length < 6) return json({ error: 'A senha inicial deve ter pelo menos 6 caracteres.' }, 400);
  if (!CARGOS[role]) return json({ error: 'Cargo inválido.' }, 400);

  // 3. Criação com privilégios de servidor
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome },
    app_metadata: { role }
  });
  if (createError || !created.user) {
    const jaExiste = createError?.message?.toLowerCase().includes('already');
    return json(
      { error: jaExiste ? 'Já existe uma conta com este e-mail.' : createError?.message || 'Falha ao criar a conta.' },
      400
    );
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    nome,
    role,
    cargo: CARGOS[role],
    status: 'ativo'
  });
  if (profileError) {
    // Não deixa conta "órfã" sem perfil
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: `Falha ao criar o perfil: ${profileError.message}` }, 500);
  }

  return json({ user: { id: created.user.id, email } });
});
