import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase/client';
import {
  Users,
  Award,
  ArrowRight,
  HeartHandshake,
  Shield,
  UserCheck,
  User,
  LogOut,
  Sun,
  Moon,
  CheckCircle2,
  Sparkles,
  Heart,
  Calendar,
  Building2
} from 'lucide-react';
import logoLarHarmonia from '../assets/images/regenerated_image_1790687724025.png';
import { getRoleBadgeClasses } from '../types/auth';

export default function HomeSeletor() {
  const navigate = useNavigate();
  const { user, role, displayName, roleShortLabel } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const badgeStyle = getRoleBadgeClasses(role) || {
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-600 dark:bg-emerald-400'
  };

  const renderRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />;
      case 'servico_social':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />;
      case 'recepcao':
      default:
        return <User className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Barra de Topo Integrada */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoLarHarmonia}
              alt="Fundação Lar Harmonia"
              className="w-[200px] sm:w-[240px] h-[52px] object-contain dark:brightness-110 dark:contrast-110"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Alternar Tema */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Crachá do Usuário */}
            {user && (
              <div
                className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${badgeStyle.badge}`}
              >
                {renderRoleIcon()}
                <span>{displayName}</span>
                <span className="opacity-50">•</span>
                <span>{roleShortLabel}</span>
              </div>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/60"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {/* Banner de Boas-Vindas */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fundação Lar Harmonia • Sistema Integrado de Gestão</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-slate-900 dark:text-white mb-3">
            Bem-vindo(a), <span className="text-emerald-700 dark:text-emerald-400">{displayName}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Selecione abaixo o módulo que deseja acessar para iniciar o atendimento, cadastro ou acompanhamento social.
          </p>
        </div>

        {/* Grid dos Dois Módulos Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* MÓDULO 1: Gestão de Assistidos */}
          <div
            onClick={() => navigate('/dashboard')}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between cursor-pointer overflow-hidden transform hover:-translate-y-1"
          >
            {/* Faixa Decorativa Superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

            <div>
              {/* Ícone e Selo */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Serviço Social
                </span>
              </div>

              {/* Título & Descrição */}
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Gestão de Assistidos
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Acolhimento socioeconômico, controle de fichas sociais completas, registro da Avaliação de 4 Meses (120 dias) e relatórios de oficinas da instituição.
              </p>

              {/* Funcionalidades Chave */}
              <ul className="space-y-2.5 mb-8 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Ficha Socioeconômica & Vulnerabilidades (5 Etapas)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Monitoramento e Alerta de 4 Meses (120 dias)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Exportação Completa para Planilhas CSV / Excel</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Filtros Avançados por Bairro, Renda e Oficina</span>
                </li>
              </ul>
            </div>

            {/* Botão de Ação */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
              <span>Acessar Módulo de Assistidos</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* MÓDULO 2: Gestão de Voluntários */}
          <div
            onClick={() => navigate('/voluntarios')}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between cursor-pointer overflow-hidden transform hover:-translate-y-1"
          >
            {/* Faixa Decorativa Superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600" />

            <div>
              {/* Ícone e Selo */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Voluntariado
                </span>
              </div>

              {/* Título & Descrição */}
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                Gestão de Voluntários
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Cadastro de colaboradores voluntários, banco de talentos e habilidades especiais, organização de escalas de atuação e apoio nos projetos da Fundação.
              </p>

              {/* Funcionalidades Chave */}
              <ul className="space-y-2.5 mb-8 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Banco de Habilidades Especiais (Multi-tags)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Gestão de Projetos e Atividades de Apoio</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Controle de Turnos e Dias da Semana (Escalas)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Busca Rápida por Nome, Profissão ou Habilidade</span>
                </li>
              </ul>
            </div>

            {/* Botão de Ação */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300">
              <span>Acessar Módulo de Voluntários</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé Institucional */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="max-w-7xl mx-auto px-4">
          Fundação Lar Harmonia • Sistema Integrado de Acolhimento Social e Voluntariado
        </p>
      </footer>
    </div>
  );
}
