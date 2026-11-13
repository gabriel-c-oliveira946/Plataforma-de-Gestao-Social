import {
  User,
  Home,
  Briefcase,
  HeartPulse,
  GraduationCap,
  Users,
  Edit3,
  ArrowRight
} from 'lucide-react';
import type { FichaBase } from './useVerFicha';
import type { FichaDerivados } from './derivados';
import type { FichaAcoes } from './acoesSalvamento';
import { descreverNascimentoMembro } from '../../utils/familia';

/** Trechos visuais reutilizados entre as abas (selos e resumos da família). */
export function criarRenderizadores(ctx: FichaBase & FichaDerivados & FichaAcoes) {
  const {
    assistido,
    canEdit,
    setIsEditingData,
    setActiveTab,
    setEditActiveTab,
    membrosFamilia,
    moradiaParsed
  } = ctx;

  const renderStatusBadge = (status?: string | null) => {
    const s = status || 'Em Acompanhamento';
    if (s === 'Concluído / Formado' || s === 'Concluído/Formado') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Concluído / Formado
        </span>
      );
    }
    if (s === 'Trancado / Evasão' || s === 'Trancado/Evasão') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          Trancado / Evasão
        </span>
      );
    }
    if (s === 'Desligado') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-300">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          Desligado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        Em Acompanhamento
      </span>
    );
  };


  const getProjectBadge = (projeto?: string) => {
    if (!projeto || projeto === 'Nenhuma / Não Participa') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
          Não participa
        </span>
      );
    }
    if (projeto === 'Crescer Preciso') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          🌟 Crescer Preciso
        </span>
      );
    }
    if (projeto === 'Balé') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-pink-100 text-pink-900 border border-pink-300">
          🩰 Balé
        </span>
      );
    }
    if (projeto === 'Capoeira') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          🥋 Capoeira
        </span>
      );
    }
    if (projeto === 'Informática') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
          💻 Informática
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 text-purple-900 border border-purple-300">
        {projeto}
      </span>
    );
  };

  // Configuração das 5 Abas no Modo de Edição
  const editTabsList = [
    { id: 1, title: '1. Identificação & Foto', icon: User },
    { id: 2, title: '2. Trabalho & Renda', icon: Briefcase },
    { id: 3, title: '3. Moradia & Família', icon: Home },
    { id: 4, title: '4. Saúde & Vulnerabilidades', icon: HeartPulse },
    { id: 5, title: '5. Motivações & FLH', icon: GraduationCap }
  ];

  const renderFamilyMembersSummaryCard = () => (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
            Núcleo Familiar & Projetos FLH
          </h4>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            {membrosFamilia.length} {membrosFamilia.length === 1 ? 'membro' : 'membros'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('moradia')}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition border border-gray-200 cursor-pointer self-start sm:self-auto"
        >
          <span>Ver Tabela Completa (Aba 3)</span>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {membrosFamilia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {membrosFamilia.map((membro, mIdx) => (
            <div
              key={membro.id || mIdx}
              className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between hover:border-emerald-200 transition"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                  {membro.nome_membro ? membro.nome_membro.charAt(0).toUpperCase() : 'F'}
                </span>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-900 truncate">
                    {membro.nome_membro || 'Não informado'}
                  </h5>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="px-2 py-0.5 bg-white text-slate-700 rounded font-semibold text-[10px] border border-slate-200">
                      {membro.vinculo || 'Dependente'}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 rounded font-medium text-[10px] border border-indigo-200">
                      {descreverNascimentoMembro(membro.data_nasc_idade)}{membro.sexo ? ` · ${membro.sexo}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Projeto/Oficina:</span>
                <div>{getProjectBadge(membro.projeto_oficina)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
          <Users className="w-7 h-7 text-gray-400 mx-auto mb-1.5 opacity-60" />
          <p className="text-xs font-semibold text-gray-600">
            Nenhum membro ou dependente individual cadastrado para este núcleo familiar.
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Composição declarada: {assistido.composicao_familiar || 1} pessoa(s), {assistido.quantidade_filhos || 0} filho(s).
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditActiveTab(3);
                setIsEditingData(true);
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-emerald-700 rounded-lg text-xs font-bold transition border border-gray-300 shadow-2xs cursor-pointer"
            >
              + Adicionar Membros da Família (Aba 3)
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderFamilyMembersSection = (showMoradiaSummary: boolean = false) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
            Membros do Núcleo Familiar e Dependentes
          </h4>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            {membrosFamilia.length} {membrosFamilia.length === 1 ? 'membro' : 'membros'}
          </span>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setEditActiveTab(3);
              setIsEditingData(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition border border-emerald-200 cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Gerenciar / Adicionar Membros (Aba 3)
          </button>
        )}
      </div>

      {showMoradiaSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Tipo de Moradia</span>
            <span className="font-bold text-gray-800">{moradiaParsed.tipo}</span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Composição Domiciliar</span>
            <span className="font-bold text-gray-800">{assistido.composicao_familiar || 1} pessoas</span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Filhos Dependentes</span>
            <span className="font-bold text-pink-700">
              {moradiaParsed.filhos !== ''
                ? `${moradiaParsed.filhos} filhos`
                : assistido.quantidade_filhos !== undefined && assistido.quantidade_filhos !== null
                ? `${assistido.quantidade_filhos} filhos`
                : 'Não informado'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Internet Residencial</span>
            <span className="font-bold text-gray-800">{assistido.acesso_internet || 'Não informado'}</span>
          </div>
        </div>
      )}

      {membrosFamilia.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 text-gray-700 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">Nome do Membro</th>
                <th className="py-2.5 px-3.5">Idade / Nasc.</th>
                <th className="py-2.5 px-3.5">Vínculo com Responsável</th>
                <th className="py-2.5 px-3.5">Projeto / Oficina FLH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {membrosFamilia.map((membro, mIdx) => (
                <tr key={membro.id || mIdx} className="hover:bg-gray-50/60 transition">
                  <td className="py-2.5 px-3.5 font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {membro.nome_membro ? membro.nome_membro.charAt(0).toUpperCase() : 'F'}
                    </span>
                    <span>{membro.nome_membro || 'Não informado'}</span>
                  </td>
                  <td className="py-2.5 px-3.5 text-gray-700 font-medium">
                    {descreverNascimentoMembro(membro.data_nasc_idade)}{membro.sexo ? ` · ${membro.sexo}` : ''}
                  </td>
                  <td className="py-2.5 px-3.5 text-gray-800 font-semibold">
                    {membro.vinculo || 'Não informado'}
                  </td>
                  <td className="py-2.5 px-3.5">
                    {getProjectBadge(membro.projeto_oficina)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
          <Users className="w-7 h-7 text-gray-400 mx-auto mb-1.5 opacity-60" />
          <p className="text-xs font-semibold text-gray-600">
            Nenhum membro ou dependente individual cadastrado para este núcleo familiar.
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Composição geral informada: {assistido.composicao_familiar || 1} pessoa(s), {assistido.quantidade_filhos || 0} filho(s).
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditActiveTab(3);
                setIsEditingData(true);
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-emerald-700 rounded-lg text-xs font-bold transition border border-gray-300 shadow-2xs cursor-pointer"
            >
              + Adicionar Membros da Família (Aba 3)
            </button>
          )}
        </div>
      )}
    </div>
  );

  return {
    renderStatusBadge,
    getProjectBadge,
    editTabsList,
    renderFamilyMembersSummaryCard,
    renderFamilyMembersSection
  };
}

export type FichaRenderizadores = ReturnType<typeof criarRenderizadores>;
