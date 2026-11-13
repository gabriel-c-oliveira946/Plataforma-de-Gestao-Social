import { FILTRO_AVALIACAO_4_MESES } from '../../utils/avaliacao4Meses';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  User as UserIcon,
  MapPin,
  X,
  ClipboardList,
  Camera
} from 'lucide-react';
import {
  COMPOSICAO_LIST,
  FILHOS_LIST,
  FAIXAS_RENDA_LIST,
  SAUDE_FAMILIA_LIST,
  SERVICOS_FLH_LIST,
  OCUPACAO_LIST,
  INTERNET_LIST,
  OFICINAS_LIST,
  STATUS_LIST,
  ANOS_LIST,
  USO_IMAGEM_LIST,
  FAIXA_ETARIA_LIST
} from './opcoesFiltros';
import type { DashboardCtx } from './useDashboard';

/** Busca textual, localidade e filtros detalhados. */
export function FiltrosPainel({ ctx }: { ctx: DashboardCtx }) {
  const {
    searchTerm,
    setSearchTerm,
    filterLocalidade,
    setFilterLocalidade,
    showFilters,
    setShowFilters,
    filterComposicao,
    setFilterComposicao,
    filterFilhos,
    setFilterFilhos,
    filterFaixaRenda,
    setFilterFaixaRenda,
    filterSaudeFamilia,
    setFilterSaudeFamilia,
    filterServicosFLH,
    setFilterServicosFLH,
    filterOcupacao,
    setFilterOcupacao,
    filterInternet,
    setFilterInternet,
    filterUsoImagem,
    setFilterUsoImagem,
    filterFaixaEtaria,
    setFilterFaixaEtaria,
    filterOficina,
    setFilterOficina,
    filterStatus,
    setFilterStatus,
    filterAvaliacao,
    setFilterAvaliacao,
    filterAno,
    setFilterAno,
    filterDataInicial,
    setFilterDataInicial,
    filterDataFinal,
    setFilterDataFinal,
    metrics,
    handleResetFilters,
    activeFiltersCount
  } = ctx;

  return (
    <>
        {/* BARRA DE BUSCA E FILTROS */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-4 sm:p-5 mb-6 space-y-4 transition-colors">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Campo de Busca Rápida (Nome, CPF ou RG) */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por Nome Completo, CPF ou RG..."
                className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 outline-none transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Limpar busca textual"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Campo de Filtro Dinâmico por Localidade (Bairro / Cidade) */}
            <div className="relative flex-1 lg:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              <input
                type="text"
                value={filterLocalidade}
                onChange={(e) => setFilterLocalidade(e.target.value)}
                placeholder="Buscar por Bairro / Localidade..."
                className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 outline-none transition"
              />
              {filterLocalidade && (
                <button
                  type="button"
                  onClick={() => setFilterLocalidade('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Limpar filtro de localidade"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Botão Expandir/Recolher Filtros */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Painel de Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center bg-emerald-700 text-white rounded-full text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Botão Limpar Filtros */}
              {(activeFiltersCount > 0 || searchTerm || filterLocalidade) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 transition cursor-pointer"
                  title="Restaurar todos os filtros"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* PAINEL EXPANSÍVEL DE FILTROS AVANÇADOS */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 animate-in fade-in duration-200">
              {/* 1. Composição Familiar */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Composição Familiar
                </label>
                <select
                  value={filterComposicao}
                  onChange={(e) => setFilterComposicao(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {COMPOSICAO_LIST.map((c) => (
                    <option key={c} value={c} className="dark:bg-slate-800 dark:text-slate-100">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Filhos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Filhos
                </label>
                <select
                  value={filterFilhos}
                  onChange={(e) => setFilterFilhos(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {FILHOS_LIST.map((f) => (
                    <option key={f} value={f} className="dark:bg-slate-800 dark:text-slate-100">
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Faixa de Renda */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Faixa de Renda
                </label>
                <select
                  value={filterFaixaRenda}
                  onChange={(e) => setFilterFaixaRenda(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {FAIXAS_RENDA_LIST.map((r) => (
                    <option key={r} value={r} className="dark:bg-slate-800 dark:text-slate-100">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Saúde na Família */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Saúde na Família
                </label>
                <select
                  value={filterSaudeFamilia}
                  onChange={(e) => setFilterSaudeFamilia(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {SAUDE_FAMILIA_LIST.map((s) => (
                    <option key={s} value={s} className="dark:bg-slate-800 dark:text-slate-100">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Serviços Utilizados na FLH */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Serviços da FLH Utilizados
                </label>
                <select
                  value={filterServicosFLH}
                  onChange={(e) => setFilterServicosFLH(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {SERVICOS_FLH_LIST.map((s) => (
                    <option key={s} value={s} className="dark:bg-slate-800 dark:text-slate-100">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Ocupação / Trabalho */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ocupação / Trabalho
                </label>
                <select
                  value={filterOcupacao}
                  onChange={(e) => setFilterOcupacao(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {OCUPACAO_LIST.map((o) => (
                    <option key={o} value={o} className="dark:bg-slate-800 dark:text-slate-100">
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7. Acesso à Internet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Acesso à Internet
                </label>
                <select
                  value={filterInternet}
                  onChange={(e) => setFilterInternet(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {INTERNET_LIST.map((i) => (
                    <option key={i} value={i} className="dark:bg-slate-800 dark:text-slate-100">
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Oficina / Curso Pretendido */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Oficina / Curso
                </label>
                <select
                  value={filterOficina}
                  onChange={(e) => setFilterOficina(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {OFICINAS_LIST.map((o) => (
                    <option key={o} value={o} className="dark:bg-slate-800 dark:text-slate-100">
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* 9. Status Atendimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Status do Acompanhamento
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s} className="dark:bg-slate-800 dark:text-slate-100">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 10. Filtro Dedicado: Avaliação de 4 Meses */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-heading">
                    <ClipboardList className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    Avaliação 4 Meses
                  </span>
                  {metrics.pendentes4Meses > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold leading-none">
                      {metrics.pendentes4Meses}
                    </span>
                  )}
                </label>
                <select
                  value={filterAvaliacao}
                  onChange={(e) => setFilterAvaliacao(e.target.value)}
                  className="w-full p-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {FILTRO_AVALIACAO_4_MESES.map((a) => (
                    <option key={a} value={a} className="dark:bg-slate-800 dark:text-slate-100">
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* 11. Ano de Entrada */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ano de Ingresso
                </label>
                <select
                  value={filterAno}
                  onChange={(e) => setFilterAno(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {ANOS_LIST.map((a) => (
                    <option key={a} value={a} className="dark:bg-slate-800 dark:text-slate-100">
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* 12. Data de entrada depois de: */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Data de entrada depois de:
                </label>
                <input
                  type="date"
                  value={filterDataInicial}
                  onChange={(e) => setFilterDataInicial(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                />
              </div>

              {/* 13. Data de entrada antes de: */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Data de entrada antes de:
                </label>
                <input
                  type="date"
                  value={filterDataFinal}
                  onChange={(e) => setFilterDataFinal(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                />
              </div>

              {/* 14. Termo de Uso de Imagem */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Uso de Imagem</span>
                </label>
                <select
                  value={filterUsoImagem}
                  onChange={(e) => setFilterUsoImagem(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {USO_IMAGEM_LIST.map((u) => (
                    <option key={u} value={u} className="dark:bg-slate-800 dark:text-slate-100">
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* 15. Faixa Etária */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Faixa Etária (Idade)</span>
                </label>
                <select
                  value={filterFaixaEtaria}
                  onChange={(e) => setFilterFaixaEtaria(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-700 outline-none"
                >
                  {FAIXA_ETARIA_LIST.map((f) => (
                    <option key={f} value={f} className="dark:bg-slate-800 dark:text-slate-100">
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
    </>
  );
}
