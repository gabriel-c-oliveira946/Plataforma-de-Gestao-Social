import {
  GraduationCap,
  Home,
  CheckCircle2,
  X,
  Users,
  AlertTriangle,
  Clock,
  ClipboardList
} from 'lucide-react';
import type { DashboardCtx } from './useDashboard';

/** Cards de métricas rápidas (clicáveis como filtro). */
export function MetricasPainel({ ctx }: { ctx: DashboardCtx }) {
  const {
    assistidos,
    setShowFilters,
    filterStatus,
    setFilterStatus,
    filterAvaliacao,
    setFilterAvaliacao,
    metrics
  } = ctx;

  return (
    <>
        {/* CARDS DE MÉTRICAS RÁPIDAS NO TOPO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
          {/* Card 1: Entrevista Domiciliar Pendente (1 Ano) */}
          <div
            onClick={() => {
              setFilterAvaliacao('Entrevista Domiciliar Pendente (1 Ano)');
              setShowFilters(true);
            }}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm flex items-center justify-between ${
              filterAvaliacao.includes('Entrevista Domiciliar')
                ? 'bg-orange-100/90 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 ring-2 ring-orange-400'
                : 'bg-orange-50/90 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/60 hover:border-orange-300 dark:hover:border-orange-700'
            }`}
            title="Clique para filtrar assistidos ativos há mais de 12 meses (1 ano) para entrevista domiciliar"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-900 dark:text-orange-300 uppercase tracking-wider font-heading">
                <Home className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                <span>Entrevista (1 Ano)</span>
              </div>
              <div className="text-2xl font-bold text-orange-950 dark:text-orange-100 font-heading">
                {metrics.pendentesEntrevista1Ano}{' '}
                <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                  {metrics.pendentesEntrevista1Ano === 1 ? 'Pendente' : 'Pendentes'}
                </span>
              </div>
              <p className="text-[11px] text-orange-800 dark:text-orange-400 font-medium leading-tight">
                Entrevista Domiciliar (12 Meses+)
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-200 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-orange-700 dark:text-orange-400" />
            </div>
          </div>

          {/* Card 2: X Pendentes de Avaliação de 4 Meses */}
          <div
            onClick={() => {
              setFilterAvaliacao('Pendentes de Avaliação (>= 4 Meses)');
              setShowFilters(true);
            }}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm flex items-center justify-between ${
              filterAvaliacao.includes('Pendentes de Avaliação')
                ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400'
                : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 hover:border-amber-300 dark:hover:border-amber-700'
            }`}
            title="Clique para filtrar apenas os assistidos com 120+ dias ativos sem avaliação de 4 meses"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider font-heading">
                <ClipboardList className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Avaliação de 4 Meses</span>
              </div>
              <div className="text-2xl font-bold text-amber-950 dark:text-amber-100 font-heading">
                {metrics.pendentes4Meses}{' '}
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {metrics.pendentes4Meses === 1 ? 'Pendente' : 'Pendentes'}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-tight">
                Avaliação 4 Meses (120d+)
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
          </div>

          {/* Total de Assistidos */}
          <div
            onClick={() => {
              setFilterAvaliacao('Todos');
              setFilterStatus('Todos os Status');
            }}
            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs hover:shadow-sm transition cursor-pointer flex items-center justify-between"
            title="Total de fichas cadastradas no Lar Harmonia"
          >
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
                Total de Assistidos
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                {metrics.total}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cadastrados no Lar Harmonia</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Ativos / Em Acompanhamento */}
          <div
            onClick={() => {
              setFilterStatus('Apenas Ativos');
              setShowFilters(true);
            }}
            className={`p-4 rounded-xl border transition shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-between ${
              filterStatus === 'Apenas Ativos'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500'
            }`}
            title="Assistidos ativos em acompanhamento na FLH"
          >
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
                Em Acompanhamento
              </div>
              <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 font-heading">
                {metrics.ativosAcompanhamento}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assistidos com status ativo</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          {/* Avaliações Concluídas */}
          <div
            onClick={() => {
              setFilterAvaliacao('Avaliação Concluída');
              setShowFilters(true);
            }}
            className={`p-4 rounded-xl border transition shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-between ${
              filterAvaliacao.includes('Avaliação Concluída')
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            title="Assistidos com avaliação de 4 meses concluída"
          >
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
                Avaliações Concluídas
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                {metrics.avaliacoesConcluidas}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avaliações de 4 meses salvas</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
    </>
  );
}
