# Handoff — Plataforma de Gestão Social Lar Harmonia

> Estado em **13/11/2026**, após o merge do PR #3 na `main` (commit `61dd611`).
> Leia este arquivo antes de continuar o trabalho, seja numa nova sessão do Claude, seja numa nova turma.

## 1. Contexto em uma página

- **O que é:** CRM do Serviço Social da Fundação Lar Harmonia (Salvador/BA). Substitui fichas de papel e planilhas Excel. Projeto de extensão universitária (sem cobrança). Equipe técnica: Gabriel, Filipe, Ludmila e Nadson (TI da fundação).
- **Quem usa:** Diretoria (admin), Serviço Social e Recepção/Voluntários, com permissões diferentes.
- **Situação:** a coordenação (Priscila) validou o protótipo em 13/11/2026 e pediu que ele vire a **base de um sistema maior e unificado**: um cadastro único de pessoas, com papéis em vários núcleos (Social, Ambulatório, Balé, Voluntariado, Psicologia…).
- **Dados:** os dois bancos (oficial e demo) têm **somente dados fictícios**. A migração dos dados reais será feita pelo Robson (TI da ONG), que trabalha presencialmente às segundas.
- **Dois ambientes:**
  - **Oficial:** projeto Supabase próprio, deploy na Vercel (`plataforma-de-gestao-social-lar-harmonia`).
  - **Demo (portfólio):** outro projeto Supabase e outro deploy na Vercel (`lar-harmonia-demo`). O login `visitante` é admin, mas está protegido e os dados são resetados todo dia.

## 2. Stack e arquitetura

| Camada | Tecnologia |
| --- | --- |
| Front-end | React 19 + TypeScript 7 + Vite 8 + Tailwind 4 + React Router 7, ícones lucide-react |
| Hospedagem | Vercel (SPA estática; `vercel.json` reescreve todas as rotas para `index.html`) |
| Back-end | Supabase: PostgreSQL, Auth, API REST gerada (PostgREST), funções RPC e 1 Edge Function |
| Conexão | `src/lib/supabase/client.ts`, com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (variáveis na Vercel) |

- **Não existe servidor próprio.** O site fala direto com o Supabase, e a segurança é aplicada **no banco** pelas regras RLS.
- **Sem as variáveis de ambiente**, o app roda em `MODO_LOCAL`: dados de exemplo no `localStorage`, só para desenvolvimento.
- **Instalação:** `npm ci` funciona sem flags; só existe o `package-lock.json`. **Verificação:** `npx tsc --noEmit` e `npm run build`.

### Organização do código (`src/`)

- `pages/`: telas.
  - `Dashboard.tsx` é a composição; a lógica fica em `pages/dashboard/useDashboard.tsx`, e cada parte da tela em `pages/dashboard/*`.
  - Demais telas: `CadastrarAssistido`, `GerenciarVoluntarios`, `GerenciarEquipe`, `Login` e `HomeSeletor` (escolha de módulo depois do login).
- `components/VerFichaModal.tsx`: composição da ficha do assistido. Em `components/verFicha/` ficam:
  - `useVerFicha.tsx`: estado e efeitos;
  - `derivados.ts`: valores calculados;
  - `acoesSalvamento.ts`: salvamentos;
  - `renderizadores.tsx`: trechos visuais compartilhados;
  - um componente por aba e por modal.
- `components/cadastro/Tab*.tsx`: as 5 abas do formulário (usadas no cadastro e na edição).
- `components/vinculo/VinculoCpf.tsx`: selos e avisos do vínculo assistido↔voluntário por CPF.
- `components/QuadroResumoModal.tsx`: tela do Quadro Resumo.
- `services/assistidosService.ts` e `services/voluntariosService.ts`: o **único** ponto que lê e grava no banco.
- `context/AuthContext.tsx`: sessão e cargo. O cargo vem **só** da tabela `profiles`.
- `utils/`:
  - `familia.ts`: sexo, idade, programas e autorização de imagem;
  - `quadroResumo.ts`: cálculo do quadro;
  - `vinculoPessoas.ts`: cruzamento por CPF;
  - `camposAssistido.ts`, `exportUtils.ts` (CSV) e `equipe.ts` (gestão da equipe).
- `supabase/`:
  - `migrations/`: scripts SQL numerados;
  - `functions/criar-membro/`: a Edge Function;
  - `demo/`: scripts só da demo.

## 3. Banco de dados

### Tabelas atuais
- `assistidos`: uma linha por família (pessoa de referência). Os membros da família ficam em `membros_familia` (JSON).
- `voluntarios`
- `profiles`: equipe, com `role` (`admin` | `servico_social` | `recepcao`), `status` e `cargo`. **Não tem coluna `email`**; o e-mail fica em `auth.users`.

### Scripts (rodar no SQL Editor, em ordem, cada um numa query nova e inteira)

| Script | O que faz | Oficial | Demo |
| --- | --- | --- | --- |
| `20261112_01_funcao_papel_atual.sql` | Função `papel_atual()`: cargo de quem está logado, só se o perfil estiver ativo | rodado | rodado |
| `20261112_02_politicas_rls.sql` | Remove as políticas antigas (permissivas) e cria as RLS por cargo | rodado | rodado |
| `20261112_03_resolver_login.sql` | RPC `resolver_login`: login por nome de usuário sem expor `profiles` | rodado | **confirmar** |
| `20261112_04_voluntarios_hierarquia.sql` | Recepção não edita voluntários | rodado | não se aplica* |
| `20261113_05_sexo_programas.sql` | Colunas `sexo` e `programas` (+ `membros_familia`) | rodado | rodado |
| `20261113_06_colunas_assistidos.sql` | Garante todas as colunas que o cadastro grava | **confirmar** | **confirmar** |
| `demo/protecao_demo.sql` | Protege o `visitante` e cria o reset diário (pg_cron 06:00 UTC) | não | rodado |
| `demo/voluntarios_demo.sql` | Cria a tabela `voluntarios` com dados fictícios | não | rodado |

\* Na demo, a hierarquia dos voluntários já é aplicada pelo `voluntarios_demo.sql`.

> **Atenção:** o script 06 nasceu de um erro real no oficial ("Could not find the 'quantidade_filhos' column"). Se criar uma ficha ainda falhar, rode o 06. Ele pode ser rodado mais de uma vez sem problema.

### Permissões (garantidas pelo banco)

| Ação | Diretoria | Serviço Social | Recepção |
| --- | --- | --- | --- |
| Ver fichas e voluntários | ✓ | ✓ | ✓ |
| Cadastrar ficha e voluntário | ✓ | ✓ | ✓ |
| Editar ficha, avaliação 4 meses e voluntário | ✓ | ✓ | — |
| Excluir | ✓ | — | — |
| Gerenciar equipe | ✓ | — | — |

## 4. O que foi feito nesta etapa (PRs #1, #2 e #3)

**PR #1: segurança**
- **Políticas antigas:** se somavam com OR e liberavam acesso total. Por exemplo, a tabela de voluntários era legível e editável **sem login**. Foram substituídas pelas RLS por cargo.
- **Cargo:** vem só de `profiles`. Removidos o cargo `admin` padrão, os atalhos por e-mail e a tentativa automática de login em `admin@larharmonia.org`.
- **Cadastro de membros da equipe:** passa pela Edge Function `criar-membro` (com `service_role` só no servidor), e não mais por `signUp` no navegador.
- **Fim do "salvo com sucesso" falso:** antes, o app salvava em silêncio só no navegador quando o banco falhava. Agora mostra o erro.
- **Fichas no navegador:** nenhuma ficha é mais guardada no `localStorage`, e as cópias antigas são apagadas ao abrir o site.

**PR #2: refatoração e Quadro Resumo**
- **Arquivos grandes divididos:** `VerFichaModal` (4.817 → 107 linhas) e `Dashboard` (2.013 → 45). O HTML gerado em 139 cenários ficou idêntico ao de antes.
- **Dependências:** 10 pacotes sem uso removidos (sobras do template do AI Studio), e o conflito do `esbuild` que quebrava o `npm ci` foi corrigido.
- **Quadro Resumo refeito no formato da aba RESUMO da planilha da fundação:**
  - conta todas as pessoas da família por faixa etária × sexo × programa (Famílias Assistidas, Integração ao M. do Trabalho, Creche, Gestantes);
  - não deduz nada; o que falta aparece como "não informado";
  - a data de referência das idades pode ser escolhida;
  - impressão em A4 e exportação CSV para Excel.
- **Campos novos:** sexo e programas (titular), sexo e data de nascimento (cada membro). A autorização de imagem passou a ter três estados e não vem mais marcada como "Sim".

**PR #3: vínculo por CPF**
- **Selos:** "Também é assistido(a)" e "Também é voluntário(a)".
- **Aviso no cadastro:** com o botão "Usar dados básicos" (preenche só os campos vazios).
- **Alerta de CPF duplicado** no mesmo módulo.
- **Script 06.**

## 5. Decisões tomadas (e por quê)

1. **Supabase como back-end, sem servidor próprio por enquanto.** Custo zero e menos manutenção para as próximas turmas. A segurança fica no banco, então vale para qualquer cliente. Um servidor próprio só se surgir integração ou processamento que não caiba em funções do banco ou Edge Functions. A decisão final é com o Nadson.
2. **Toda mudança de banco é um script versionado** em `supabase/migrations/`, que pode ser rodado de novo.
3. **Quadro Resumo:**
   - conta a família inteira;
   - família em mais de um programa entra em cada coluna, mas o Total não repete pessoas;
   - nunca inventa sexo ou idade.
   
   **Pendente de confirmação pelas assistentes sociais** (seção 8).
4. **Cadastro e edição exigem** sexo, programa, autorização de imagem, e sexo e data de nascimento de cada membro. Por isso, fichas antigas pedem esses dados ao serem editadas.
5. **CPF como elo provisório** entre módulos, até existir o cadastro único de pessoas.
6. **Demo separada do oficial**, com `visitante` admin protegido e reset diário. É para portfólio e LinkedIn.

## 6. Dívida técnica conhecida

| Item | Onde | Impacto |
| --- | --- | --- |
| Cartão SUS, autorização de imagem, avaliação 4 meses e entrevista 1 ano guardados como **texto** em `expectativa_curso` | `CadastrarAssistido`, `acoesSalvamento`, `utils/avaliacao4Meses.ts` | Relatórios frágeis; só uma entrevista guardada (sem histórico anual) |
| Membros da família em JSON | `assistidos.membros_familia` | Um filho não é uma pessoa no banco |
| Fotos em base64 dentro da ficha | `foto_url` | Fichas pesadas. Solução: bucket privado + links temporários |
| Duas telas de equipe que fazem a mesma coisa | `components/EquipeModal.tsx` e `pages/GerenciarEquipe.tsx` | Manutenção em dobro. Falta a fundação escolher qual fica |
| Sem testes automatizados no repositório | — | Mudanças dependem de teste manual |
| Bundle único de cerca de 1 MB | build | Carregamento inicial lento no celular |
| "Quantas pessoas moram no domicílio" separado da lista de membros | Aba 3 | Pode divergir da lista |

## 7. Próximos passos

### Imediatos (o Gabriel faz)
- [ ] Confirmar se o **script 06** foi rodado no oficial e na demo.
- [ ] Confirmar se a **Edge Function `criar-membro`** foi publicada (nome exato, "Verify JWT" ligado). Testar o cadastro de um membro pela tela de equipe.
- [ ] Depois disso, **desligar** *Authentication → Sign In / Providers → Allow new users to sign up* no projeto oficial.
- [ ] Completar 3 ou 4 fichas fictícias com sexo, programa e membros, para o Quadro Resumo mostrar números nas demonstrações.
- [ ] Compartilhar com o Nadson o relatório técnico, criado como documento no Claude: "Plataforma Lar Harmonia — respostas técnicas ao Nadson". Ele está privado até ser compartilhado.

### Reunião de modelagem com o Nadson (destrava a próxima fase)
- [ ] Validar o modelo proposto:
  - `pessoas` (CPF único quando houver);
  - `familias` e `familia_membros`;
  - `nucleos`;
  - `participacoes` (pessoa × núcleo × papel, com histórico);
  - tabelas de dados por núcleo (`social_atendimento`, `voluntariado`, `ambulatorio_atendimento`…);
  - `usuarios_nucleos` (acesso por núcleo e nível).
- [ ] Como identificar pessoas sem CPF (crianças) e evitar duplicidade.
- [ ] Níveis de sigilo (ex.: apenados) e registro de quem acessou cada ficha.
- [ ] Camada de API: formalizar o Supabase (proposta) ou criar servidor próprio.
- [ ] Plano de migração das tabelas atuais e da planilha, com o Robson.
- [ ] Contas da Vercel e do Supabase em nome da fundação; rotina de backup. O plano gratuito do Supabase pausa o projeto sem uso e não tem backup baixável. Confirmar também os termos do plano Hobby da Vercel.

### Melhorias já mapeadas (depois da modelagem)
- [ ] Tabela de avaliações e entrevistas com histórico; tirar os dados de `expectativa_curso`.
- [ ] Fotos num bucket privado.
- [ ] Unificar as telas de equipe.
- [ ] Termo de consentimento LGPD para dados sensíveis.
- [ ] Testes automatizados (Quadro Resumo, permissões).
- [ ] Carregar cada página só quando aberta.

## 8. Perguntas em aberto para a fundação

Precisam ser feitas **presencialmente às assistentes sociais** (a Priscila é representante, não opera o dia a dia). Use sempre um exemplo concreto, como "Dona Ana, 30 anos, grávida, com o filho Pedro, de 4 anos, que vai à creche".

**Essenciais:**
1. Uma família pode estar em mais de um programa ao mesmo tempo? No total, conta uma vez ou duas?
2. "Famílias Assistidas" é um programa próprio ou quer dizer "todas as famílias"?
3. No quadro, conta a família inteira ou só quem participa do programa?
4. Para a migração: as fichas de papel têm nome, data de nascimento e sexo de cada membro?

**Podem ir por mensagem:**
- O relatório usa só famílias ativas? Com qual data de referência?
- O Ministério Público e o Conselho exigem um modelo próprio?
- A renda por fonte (benefício, autônomo, CLT, outras) e a renda per capita precisam aparecer no sistema?
- O que significa o valor 0,01 nas colunas de renda da planilha?
- O "Não" em "pagam água e energia" é por falta do serviço ou por ligação irregular?
- Que data de ingresso usar para famílias que só têm o ano do cadastro?
- A entrevista domiciliar é anual, com histórico?

## 9. Como trabalhar com segurança neste código

- **Antes de entregar:** `npx tsc --noEmit` e `npm run build`.
- **Rede de segurança para refatorações:**
  - renderize a tela em modo local (sem variáveis do Supabase) com o Playwright;
  - percorra abas, filtros e botões, salvando o `document.body.innerHTML`;
  - compare o antes e o depois, ignorando o parâmetro `?t=` do Vite.
  
  A pasta `.harness/` usada nesta etapa não foi versionada. Vale recriá-la como teste oficial.
- **Scripts SQL:** teste antes num PostgreSQL local, com um schema `auth` simulado (`auth.uid()` lendo `request.jwt.claim.sub`) e os papéis `anon` e `authenticated`.
- **Branch de trabalho:** `claude/great-gauss-31kpkf`. Abra um PR por entrega e rode os scripts SQL **antes** do merge.

## 10. Cuidados com dados pessoais (LGPD)

- **Planilha recebida em 10/09/26:** chegou como "sanitizada", mas as abas IMT, Creche e Gestantes tinham nome, telefone e CPF reais. Peça à fundação um modelo realmente limpo e apague as cópias.
- **Nunca coloque dados reais** no repositório, em issues, em PRs ou em ferramentas de IA. Isso inclui telefones de contato da equipe da fundação.
- **Use só dados fictícios** em demonstrações e testes.
