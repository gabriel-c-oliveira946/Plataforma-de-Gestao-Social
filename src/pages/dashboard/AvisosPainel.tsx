import {
  Home,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import type { DashboardCtx } from './useDashboard';

/** Mensagens de sucesso, erro de conexão e alerta de entrevistas pendentes. */
export function AvisosPainel({ ctx }: { ctx: DashboardCtx }) {
  const {
    assistidos,
    errorMsg,
    successMsg,
    setSuccessMsg,
    setShowFilters,
    setFilterAvaliacao,
    fetchAssistidos,
    metrics
  } = ctx;

  return (
    <>
        {/* Mensagem de Notificação de Sucesso */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-xs flex items-center justify-between text-emerald-900 dark:text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span className="text-sm font-semibold">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mensagem de Erro de Conexão */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl shadow-xs flex items-center justify-between text-red-800 dark:text-red-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => fetchAssistidos(true)}
              className="text-xs bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 font-semibold px-3 py-1 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* ALERTA DE NOTIFICAÇÃO: Entrevista Domiciliar Pendente (1 Ano) */}
        {metrics.pendentesEntrevista1Ano > 0 && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/50 border-2 border-orange-300 dark:border-orange-800 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-orange-950 dark:text-orange-200 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 rounded-lg shrink-0 mt-0.5">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-900 dark:text-orange-300 font-heading">
                  Alerta Social • Entrevistas Domiciliares Anuais
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-orange-950 dark:text-orange-100 mt-0.5">
                  Existe{metrics.pendentesEntrevista1Ano === 1 ? 'm' : 'm'} <span className="font-extrabold text-orange-800 dark:text-orange-300">{metrics.pendentesEntrevista1Ano} {metrics.pendentesEntrevista1Ano === 1 ? 'assistido' : 'assistidos'}</span> com cadastro ativo há mais de 12 meses (1 ano) que necessita{metrics.pendentesEntrevista1Ano === 1 ? '' : 'm'} de reavaliação / entrevista domiciliar anual.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterAvaliacao('Entrevista Domiciliar Pendente (1 Ano)');
                setShowFilters(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
              title="Filtrar assistidos com 1 ano+ de acompanhamento"
            >
              <span>Ver Assistidos Pendentes</span>
            </button>
          </div>
        )}
    </>
  );
}
