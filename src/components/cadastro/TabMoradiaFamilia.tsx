import React, { useState } from 'react';
import {
  Home,
  Users,
  Wifi,
  Droplet,
  Zap,
  CheckCircle,
  HelpCircle,
  Baby,
  ShieldAlert,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Award,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  CadastroFormData,
  MembroFamilia,
  TIPOS_MORADIA,
  VINCULOS_FAMILIARES,
  PROJETOS_OFICINAS_FAMILIA
} from '../../types/cadastro';
import { handleIntegerKeyDown } from '../../utils/masks';

interface TabMoradiaFamiliaProps {
  formData: CadastroFormData;
  setFormData: React.Dispatch<React.SetStateAction<CadastroFormData>>;
}

export const TabMoradiaFamilia: React.FC<TabMoradiaFamiliaProps> = ({
  formData,
  setFormData
}) => {
  const isRua =
    formData.em_situacao_rua ||
    formData.tipo_moradia === 'Situação de Rua / Sem Moradia Fixa' ||
    formData.tipo_moradia === 'Em situação de rua';

  // Estado para formulário de membro familiar (Adicionar / Editar)
  const [showMemberForm, setShowMemberForm] = useState<boolean>(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MembroFamilia>({
    nome_membro: '',
    data_nasc_idade: '',
    vinculo: 'Filho(a)',
    projeto_oficina: 'Crescer Preciso',
    outro_vinculo: '',
    outro_projeto: ''
  });
  const [memberError, setMemberError] = useState<string | null>(null);

  const handleMoraSozinho = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      mora_sozinho: checked,
      composicao_familiar: checked ? 1 : prev.composicao_familiar === 1 ? 1 : prev.composicao_familiar
    }));
  };

  const handleSelectTipoMoradia = (tipo: string) => {
    const isSituacaoRua =
      tipo === 'Situação de Rua / Sem Moradia Fixa' || tipo === 'Em situação de rua';

    if (isSituacaoRua) {
      setFormData((prev) => ({
        ...prev,
        tipo_moradia: 'Situação de Rua / Sem Moradia Fixa',
        em_situacao_rua: true,
        mora_sozinho: true,
        composicao_familiar: 1,
        endereco: 'Em situação de rua',
        bairro: 'Sem moradia fixa',
        agua_regularidade: 'Irregular',
        energia_regularidade: 'Irregular',
        servicos_basicos_gerais: 'Irregular'
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tipo_moradia: tipo,
        em_situacao_rua: false,
        endereco: prev.endereco === 'Em situação de rua' ? '' : prev.endereco,
        bairro: prev.bairro === 'Sem moradia fixa' ? '' : prev.bairro
      }));
    }
  };

  // Funções de Gerenciamento do Núcleo Familiar
  const handleOpenAddMember = () => {
    setEditingMemberId(null);
    setMemberForm({
      nome_membro: '',
      data_nasc_idade: '',
      vinculo: 'Filho(a)',
      projeto_oficina: 'Crescer Preciso',
      outro_vinculo: '',
      outro_projeto: ''
    });
    setMemberError(null);
    setShowMemberForm(true);
  };

  const handleOpenEditMember = (member: MembroFamilia, index: number) => {
    const id = member.id || `temp_${index}`;
    setEditingMemberId(id);
    setMemberForm({
      id: member.id,
      nome_membro: member.nome_membro || '',
      data_nasc_idade: member.data_nasc_idade || '',
      vinculo: member.vinculo || 'Filho(a)',
      projeto_oficina: member.projeto_oficina || 'Crescer Preciso',
      outro_vinculo: member.outro_vinculo || '',
      outro_projeto: member.outro_projeto || ''
    });
    setMemberError(null);
    setShowMemberForm(true);
  };

  const handleSaveMember = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!memberForm.nome_membro.trim()) {
      setMemberError('Por favor, informe o Nome Completo do membro ou dependente.');
      return;
    }

    const currentList = Array.isArray(formData.membros_familia) ? [...formData.membros_familia] : [];

    if (editingMemberId) {
      // Atualização
      const updatedList = currentList.map((m, idx) => {
        const currentId = m.id || `temp_${idx}`;
        if (currentId === editingMemberId) {
          return {
            ...memberForm,
            id: m.id || editingMemberId,
            nome_membro: memberForm.nome_membro.trim(),
            data_nasc_idade: memberForm.data_nasc_idade.trim()
          };
        }
        return m;
      });
      setFormData((prev) => ({ ...prev, membros_familia: updatedList }));
    } else {
      // Novo membro
      const newMember: MembroFamilia = {
        ...memberForm,
        id: `mf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        nome_membro: memberForm.nome_membro.trim(),
        data_nasc_idade: memberForm.data_nasc_idade.trim()
      };
      setFormData((prev) => ({
        ...prev,
        membros_familia: [...currentList, newMember]
      }));
    }

    setShowMemberForm(false);
    setEditingMemberId(null);
    setMemberError(null);
  };

  const handleRemoveMember = (indexToRemove: number) => {
    const currentList = Array.isArray(formData.membros_familia) ? [...formData.membros_familia] : [];
    const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({ ...prev, membros_familia: updatedList }));
  };

  const getProjetoBadgeClass = (projeto: string) => {
    const p = projeto.toLowerCase();
    if (p.includes('crescer')) {
      return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
    }
    if (p.includes('balé') || p.includes('bale')) {
      return 'bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-700';
    }
    if (p.includes('capoeira')) {
      return 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    }
    if (p.includes('informática') || p.includes('informatica')) {
      return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    }
    if (p.includes('nenhuma') || p.includes('não participa')) {
      return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600';
    }
    return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Composição Familiar e Filhos */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6 transition-colors">
        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Composição Familiar e Contagem Geral
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Pessoas no domicílio */}
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Quantas pessoas moram no domicílio? (Composição Familiar)
            </label>
            <input
              type="number"
              min="1"
              max="25"
              disabled={isRua || formData.mora_sozinho}
              value={isRua || formData.mora_sozinho ? 1 : formData.composicao_familiar}
              onKeyDown={handleIntegerKeyDown}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  composicao_familiar: e.target.value === '' ? '' : Math.max(1, Number(e.target.value))
                })
              }
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 outline-none disabled:bg-slate-100 dark:disabled:bg-slate-750 disabled:text-slate-500 dark:disabled:text-slate-400"
            />
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isRua || formData.mora_sozinho}
                disabled={isRua}
                onChange={(e) => handleMoraSozinho(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Mora sozinho(a) / Em situação de rua (bloqueia em 1 pessoa)</span>
            </label>
          </div>

          {/* Quantidade de filhos */}
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-pink-500" />
              Quantidade de Filhos Dependentes
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={formData.quantidade_filhos}
              onKeyDown={handleIntegerKeyDown}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantidade_filhos: e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                })
              }
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Informe 0 caso o assistido não tenha filhos dependentes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TABELA DINÂMICA: Membros do Núcleo Familiar e Dependentes */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-600/50 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Membros do Núcleo Familiar e Dependentes</span>
              {Array.isArray(formData.membros_familia) && formData.membros_familia.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-700">
                  {formData.membros_familia.length} cadastrado(s)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identificação nominal de filhos, cônjuge, crianças e adolescentes com vinculação aos projetos sociais e oficinas da FLH.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddMember}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Membro da Família</span>
          </button>
        </div>

        {/* Painel Inline para Adicionar / Editar Membro (div em vez de form para evitar aninhamento inválido de form) */}
        {showMemberForm && (
          <div
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveMember();
              }
            }}
            className="p-4 sm:p-5 bg-emerald-50/70 dark:bg-slate-900/90 border border-emerald-300 dark:border-emerald-700 rounded-xl space-y-4 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-emerald-200 dark:border-slate-700 pb-2.5">
              <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{editingMemberId ? 'Editar Membro Familiar' : 'Novo Membro do Núcleo Familiar'}</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowMemberForm(false);
                  setEditingMemberId(null);
                  setMemberError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {memberError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-lg text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{memberError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5 text-xs">
              {/* Nome Completo */}
              <div className="sm:col-span-2 md:col-span-4 space-y-1.5">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Henrique Santos"
                  value={memberForm.nome_membro}
                  onChange={(e) => setMemberForm({ ...memberForm, nome_membro: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Data Nasc ou Idade */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Data Nasc. ou Idade
                </label>
                <input
                  type="text"
                  placeholder="Ex: 10 anos ou 12/03/2016"
                  value={memberForm.data_nasc_idade}
                  onChange={(e) => setMemberForm({ ...memberForm, data_nasc_idade: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Vínculo */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Vínculo com Responsável
                </label>
                <select
                  value={memberForm.vinculo}
                  onChange={(e) => setMemberForm({ ...memberForm, vinculo: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {VINCULOS_FAMILIARES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                {memberForm.vinculo === 'Outro' && (
                  <input
                    type="text"
                    placeholder="Especifique o vínculo (ex: Irmão)"
                    value={memberForm.outro_vinculo || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, outro_vinculo: e.target.value })}
                    className="w-full mt-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                )}
              </div>

              {/* Projeto / Oficina que Participa */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  Projeto / Oficina FLH
                </label>
                <select
                  value={memberForm.projeto_oficina}
                  onChange={(e) => setMemberForm({ ...memberForm, projeto_oficina: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  {PROJETOS_OFICINAS_FAMILIA.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {memberForm.projeto_oficina === 'Outro' && (
                  <input
                    type="text"
                    placeholder="Especifique o projeto / oficina"
                    value={memberForm.outro_projeto || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, outro_projeto: e.target.value })}
                    className="w-full mt-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowMemberForm(false);
                  setEditingMemberId(null);
                  setMemberError(null);
                }}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveMember()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingMemberId ? 'Salvar Alterações do Membro' : 'Adicionar Membro à Lista'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tabela de Membros Cadastrados */}
        {Array.isArray(formData.membros_familia) && formData.membros_familia.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-100/80 dark:bg-slate-700/80 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-2.5">Nome Completo</th>
                  <th className="px-3 py-2.5">Vínculo</th>
                  <th className="px-3 py-2.5">Idade / Data Nasc.</th>
                  <th className="px-3 py-2.5">Projeto / Oficina FLH</th>
                  <th className="px-3 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {formData.membros_familia.map((membro, index) => {
                  const vinculoLabel =
                    membro.vinculo === 'Outro' && membro.outro_vinculo
                      ? `Outro (${membro.outro_vinculo})`
                      : membro.vinculo || 'Familiar';

                  const projetoLabel =
                    membro.projeto_oficina === 'Outro' && membro.outro_projeto
                      ? `Outro (${membro.outro_projeto})`
                      : membro.projeto_oficina || 'Não informado';

                  return (
                    <tr
                      key={membro.id || index}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition"
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {membro.nome_membro}
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-md border border-slate-200 dark:border-slate-600">
                          {vinculoLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-600 dark:text-slate-300">
                        {membro.data_nasc_idade || 'Não informada'}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${getProjetoBadgeClass(
                            membro.projeto_oficina
                          )}`}
                        >
                          <Award className="w-3 h-3 shrink-0" />
                          <span>{projetoLabel}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMember(membro, index)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                            title="Editar membro"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            className="p-1.5 text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                            title="Remover membro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          !showMemberForm && (
            <div className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/40">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Nenhum membro ou dependente familiar adicionado individualmente ainda.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 max-w-md mx-auto">
                Clique no botão "Adicionar Membro da Família" acima para cadastrar os filhos ou dependentes que residem no lar e vinculá-los às oficinas da FLH.
              </p>
            </div>
          )
        )}
      </div>

      {/* 3. Acesso à Internet */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 transition-colors">
        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Acesso à Internet
        </h3>

        <div className="p-4 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Possui acesso à internet regular? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 font-bold cursor-pointer">
              <input
                type="radio"
                name="acesso_internet"
                value="Sim"
                checked={formData.acesso_internet === 'Sim'}
                onChange={() => setFormData({ ...formData, acesso_internet: 'Sim' })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              Sim, possui internet
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 font-bold cursor-pointer">
              <input
                type="radio"
                name="acesso_internet"
                value="Não"
                checked={formData.acesso_internet === 'Não'}
                onChange={() => setFormData({ ...formData, acesso_internet: 'Não' })}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              Não possui internet
            </label>
          </div>
        </div>
      </div>

      {/* 4. Moradia e Infraestrutura Básica */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6 transition-colors">
        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          Moradia e Infraestrutura Básica
        </h3>

        <div className="space-y-6">
          {/* Tipo de Moradia */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Tipo de Moradia
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {TIPOS_MORADIA.map((tipo) => {
                const isSelected =
                  formData.tipo_moradia === tipo ||
                  (tipo === 'Situação de Rua / Sem Moradia Fixa' && isRua);

                return (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleSelectTipoMoradia(tipo)}
                    className={`p-3 rounded-lg border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 dark:bg-amber-500 text-white border-amber-700 dark:border-amber-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{tipo}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regra Inteligente: Se for Situação de Rua, oculta/desativa perguntas de infraestrutura com badge explicativo */}
          {isRua ? (
            <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Pessoa em Situação de Rua / Sem Moradia Fixa</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                As perguntas de infraestrutura residencial (abastecimento de água, energia elétrica e saneamento básico) foram dispensadas e desativadas automaticamente.
              </p>
            </div>
          ) : (
            /* Serviços Básicos: Água, Energia e Gerais para Moradia Fixa */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl animate-fadeIn">
              {/* Água */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-emerald-600" />
                  Abastecimento de Água
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="agua_regularidade"
                      value="Regular"
                      checked={formData.agua_regularidade === 'Regular'}
                      onChange={() => setFormData({ ...formData, agua_regularidade: 'Regular' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Regular
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="agua_regularidade"
                      value="Irregular"
                      checked={formData.agua_regularidade === 'Irregular'}
                      onChange={() => setFormData({ ...formData, agua_regularidade: 'Irregular' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Irregular / Poço
                  </label>
                </div>
              </div>

              {/* Energia */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Energia Elétrica
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="energia_regularidade"
                      value="Regular"
                      checked={formData.energia_regularidade === 'Regular'}
                      onChange={() => setFormData({ ...formData, energia_regularidade: 'Regular' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Regular
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="energia_regularidade"
                      value="Irregular"
                      checked={formData.energia_regularidade === 'Irregular'}
                      onChange={() => setFormData({ ...formData, energia_regularidade: 'Irregular' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Irregular
                  </label>
                </div>
              </div>

              {/* Serviços Gerais */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  Saneamento e Serviços Gerais
                </label>
                <select
                  value={formData.servicos_basicos_gerais}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      servicos_basicos_gerais: e.target.value as any
                    })
                  }
                  className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-800 dark:text-white outline-none"
                >
                  <option value="Sim">Sim (Completos e Regulares)</option>
                  <option value="Parcialmente">Parcialmente Regulares</option>
                  <option value="Irregular">Irregulares / Precários</option>
                </select>
              </div>
            </div>
          )}

          {/* Observações Relevantes de Moradia */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Observações Relevantes sobre Moradia e Território:
            </label>
            <textarea
              rows={3}
              value={formData.observacoes_moradia}
              onChange={(e) =>
                setFormData({ ...formData, observacoes_moradia: e.target.value })
              }
              placeholder="Ex: Área de risco de alagamento/deslizamento, coabitação com parentes, abrigo institucional..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 rounded-lg border border-slate-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
