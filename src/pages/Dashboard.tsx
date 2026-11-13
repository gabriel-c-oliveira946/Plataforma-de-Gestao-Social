import type { Assistido } from '../components/VerFichaModal';
import { isPendenteAvaliacao4Meses, hasAvaliacao4Meses } from '../utils/avaliacao4Meses';
import { useDashboard } from './dashboard/useDashboard';
import { CabecalhoPainel } from './dashboard/CabecalhoPainel';
import { AvisosPainel } from './dashboard/AvisosPainel';
import { MetricasPainel } from './dashboard/MetricasPainel';
import { FiltrosPainel } from './dashboard/FiltrosPainel';
import { ResumoResultados } from './dashboard/ResumoResultados';
import { EstadosLista } from './dashboard/EstadosLista';
import { GradeCards } from './dashboard/GradeCards';
import { TabelaAssistidos } from './dashboard/TabelaAssistidos';
import { ModaisPainel } from './dashboard/ModaisPainel';

export type { Assistido };
export { isPendenteAvaliacao4Meses, hasAvaliacao4Meses };
export { getAssistidoDataSaida, getAssistidoFilhos, getAssistidoFaixaRenda } from '../utils/camposAssistido';

/** Painel de assistidos: métricas, filtros e listagem (cards ou tabela). */
export default function Dashboard() {
  const ctx = useDashboard();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 pt-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        <CabecalhoPainel ctx={ctx} />

        <AvisosPainel ctx={ctx} />

        <MetricasPainel ctx={ctx} />

        <FiltrosPainel ctx={ctx} />

        <ResumoResultados ctx={ctx} />

        <EstadosLista ctx={ctx} />

        <GradeCards ctx={ctx} />

        <TabelaAssistidos ctx={ctx} />
      </div>

      <ModaisPainel ctx={ctx} />
    </div>
  );
}
