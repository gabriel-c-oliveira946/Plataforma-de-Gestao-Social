import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { voluntariosService } from '../services/voluntariosService';
import {
  Voluntario,
  HABILIDADES_PREDEFINIDAS,
  PROJETOS_PREDEFINIDOS,
  DIAS_SEMANA_SIGLAS,
  TURNOS_VOLUNTARIO
} from '../types/voluntario';
import { formatCPF, formatRG, formatTelefone } from '../utils/masks';
import {
  Users,
  User,
  UserPlus,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  Plus,
  FileText,
  Sparkles,
  Heart,
  Check,
  AlertCircle,
  Eye,
  Loader2,
  Tag,
  BookOpen,
  UserCheck,
  Building2,
  Printer
} from 'lucide-react';

export default function GerenciarVoluntarios() {
  const { user, canEdit, canDelete } = useAuth();
  const toast = useToast();

  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSkill, setFilterSkill] = useState<string>('Todas');
  const [filterProjeto, setFilterProjeto] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVoluntario, setEditingVoluntario] = useState<Voluntario | null>(null);
  const [viewingVoluntario, setViewingVoluntario] = useState<Voluntario | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Estado do formulário de voluntário
  const [formData, setFormData] = useState<Omit<Voluntario, 'id'>>({
    nome_completo: '',
    profissao_formacao: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    telefone: '',
    celular: '',
    email: '',
    endereco: '',
    projeto_atividade: PROJETOS_PREDEFINIDOS[0],
    dias_semana: ['Seg', 'Qua'],
    turno_horario: 'Manhã',
    data_admissao: new Date().toISOString().split('T')[0],
    habilidades: ['Artes Manuais'],
    observacoes: '',
    status: 'ativo'
  });

  const [customSkillInput, setCustomSkillInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Carrega voluntários
  const loadVoluntarios = async () => {
    setLoading(true);
    try {
      const data = await voluntariosService.getAll();
      setVoluntarios(data);
    } catch (err: any) {
      toast.error('Erro ao carregar lista de voluntários', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoluntarios();
  }, []);

  // Abrir Modal de Cadastro / Edição
  const handleOpenCreateModal = () => {
    setEditingVoluntario(null);
    setFormData({
      nome_completo: '',
      profissao_formacao: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      telefone: '',
      celular: '',
      email: '',
      endereco: '',
      projeto_atividade: PROJETOS_PREDEFINIDOS[0],
      dias_semana: ['Seg', 'Qua'],
      turno_horario: 'Manhã',
      data_admissao: new Date().toISOString().split('T')[0],
      habilidades: ['Artes Manuais'],
      observacoes: '',
      status: 'ativo'
    });
    setCustomSkillInput('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: Voluntario) => {
    setEditingVoluntario(v);
    setFormData({
      nome_completo: v.nome_completo || '',
      profissao_formacao: v.profissao_formacao || '',
      cpf: v.cpf || '',
      rg: v.rg || '',
      data_nascimento: v.data_nascimento || '',
      telefone: v.telefone || '',
      celular: v.celular || '',
      email: v.email || '',
      endereco: v.endereco || '',
      projeto_atividade: v.projeto_atividade || PROJETOS_PREDEFINIDOS[0],
      dias_semana: Array.isArray(v.dias_semana) ? v.dias_semana : [],
      turno_horario: v.turno_horario || 'Manhã',
      data_admissao: v.data_admissao || new Date().toISOString().split('T')[0],
      habilidades: Array.isArray(v.habilidades) ? v.habilidades : [],
      observacoes: v.observacoes || '',
      status: v.status || 'ativo'
    });
    setCustomSkillInput('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submissão do formulário
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nome_completo.trim()) {
      setFormError('Por favor, informe o Nome Completo do voluntário.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        ...formData,
        nome_completo: formData.nome_completo.trim(),
        cpf: formData.cpf ? formatCPF(formData.cpf) : null,
        rg: formData.rg ? formatRG(formData.rg) : null,
        celular: formData.celular ? formatTelefone(formData.celular) : null,
        telefone: formData.telefone ? formatTelefone(formData.telefone) : null,
        email: formData.email ? formData.email.trim().toLowerCase() : null,
        criado_por: user?.id || null,
        atualizado_por: user?.id || null
      };

      if (editingVoluntario) {
        const updated = await voluntariosService.update(editingVoluntario.id, payload);
        setVoluntarios((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        toast.success('Voluntário atualizado', `${updated.nome_completo} foi alterado com sucesso.`);
      } else {
        const created = await voluntariosService.insert(payload);
        setVoluntarios((prev) => [created, ...prev]);
        toast.success('Voluntário cadastrado', `${created.nome_completo} registrado na Fundação Lar Harmonia.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar dados do voluntário.');
      toast.error('Erro ao salvar', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Alternar Dia da Semana
  const toggleDiaSemana = (dia: string) => {
    setFormData((prev) => {
      const current = prev.dias_semana || [];
      if (current.includes(dia)) {
        return { ...prev, dias_semana: current.filter((d) => d !== dia) };
      }
      return { ...prev, dias_semana: [...current, dia] };
    });
  };

  // Alternar Habilidade Preset
  const toggleHabilidade = (hab: string) => {
    setFormData((prev) => {
      const current = prev.habilidades || [];
      if (current.includes(hab)) {
        return { ...prev, habilidades: current.filter((h) => h !== hab) };
      }
      return { ...prev, habilidades: [...current, hab] };
    });
  };

  // Adicionar Habilidade Personalizada
  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const current = prev.habilidades || [];
      if (!current.includes(trimmed)) {
        return { ...prev, habilidades: [...current, trimmed] };
      }
      return prev;
    });
    setCustomSkillInput('');
  };

  // Alternar Status Ativo / Inativo
  const handleToggleStatus = async (voluntario: Voluntario) => {
    const newStatus = voluntario.status === 'inativo' ? 'ativo' : 'inativo';
    try {
      const updated = await voluntariosService.update(voluntario.id, { status: newStatus });
      setVoluntarios((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      toast.info(
        newStatus === 'ativo' ? 'Voluntário reativado' : 'Voluntário desativado',
        `Status de ${voluntario.nome_completo} alterado para ${newStatus}.`
      );
    } catch (err: any) {
      toast.error('Erro ao alterar status', err.message);
    }
  };

  // Excluir Voluntário
  const handleDeleteVoluntario = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o cadastro do voluntário "${nome}"?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await voluntariosService.delete(id);
      setVoluntarios((prev) => prev.filter((v) => v.id !== id));
      toast.success('Voluntário removido', `O cadastro de ${nome} foi excluído.`);
    } catch (err: any) {
      toast.error('Erro ao excluir voluntário', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtros aplicados
  const filteredVoluntarios = useMemo(() => {
    return voluntarios.filter((v) => {
      // 1. Busca por texto (Nome, Profissão, E-mail, Projeto ou Habilidades)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const nomeMatch = v.nome_completo?.toLowerCase().includes(term);
        const profMatch = v.profissao_formacao?.toLowerCase().includes(term);
        const emailMatch = v.email?.toLowerCase().includes(term);
        const projMatch = v.projeto_atividade?.toLowerCase().includes(term);
        const skillMatch = Array.isArray(v.habilidades) && v.habilidades.some((h) => h.toLowerCase().includes(term));
        if (!nomeMatch && !profMatch && !emailMatch && !projMatch && !skillMatch) {
          return false;
        }
      }

      // 2. Filtro por Habilidade
      if (filterSkill !== 'Todas') {
        if (!Array.isArray(v.habilidades) || !v.habilidades.includes(filterSkill)) {
          return false;
        }
      }

      // 3. Filtro por Projeto
      if (filterProjeto !== 'Todos') {
        if (v.projeto_atividade !== filterProjeto) {
          return false;
        }
      }

      // 4. Filtro por Status
      if (filterStatus === 'ativos' && v.status === 'inativo') return false;
      if (filterStatus === 'inativos' && v.status !== 'inativo') return false;

      return true;
    });
  }, [voluntarios, searchTerm, filterSkill, filterProjeto, filterStatus]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = voluntarios.length;
    const ativos = voluntarios.filter((v) => v.status !== 'inativo').length;
    const inativos = total - ativos;
    const skillsSet = new Set<string>();
    voluntarios.forEach((v) => {
      if (Array.isArray(v.habilidades)) {
        v.habilidades.forEach((h) => skillsSet.add(h));
      }
    });
    return { total, ativos, inativos, totalSkills: skillsSet.size };
  }, [voluntarios]);

  const formatDateDisplay = (dStr?: string | null) => {
    if (!dStr) return 'Não registrada';
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      return d.toLocaleDateString('pt-BR');
    } catch {
      return dStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* Banner de Topo com Estatísticas e Título do Módulo */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 sm:py-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold mb-2">
                <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Fundação Lar Harmonia • Módulo de Voluntariado</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                Gestão de Voluntários & Banco de Talentos
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
                Cadastro oficial de apoiadores, controle de habilidades especiais, escalas por dia da semana e atribuição nos projetos da instituição.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm hover:shadow-md cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Voluntário</span>
            </button>
          </div>

          {/* Cards de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total de Cadastros
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 block font-heading">
                {stats.total}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Voluntários Ativos
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5 block font-heading">
                {stats.ativos}
              </span>
            </div>

            <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">
                Habilidades Mapeadas
              </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-0.5 block font-heading">
                {stats.totalSkills}
              </span>
            </div>

            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                Inativos / Pausados
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5 block font-heading">
                {stats.inativos}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal & Filtros */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Barra de Filtro e Busca Rápida */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            {/* Campo de Busca por Texto */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar voluntário por nome, profissão ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtro por Habilidade */}
            <div className="md:col-span-3">
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Todas">Todas as Habilidades</option>
                {HABILIDADES_PREDEFINIDAS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Projeto */}
            <div className="md:col-span-4">
              <select
                value={filterProjeto}
                onChange={(e) => setFilterProjeto(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Todos">Todos os Projetos de Apoio</option>
                {PROJETOS_PREDEFINIDOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Abas Rápidas de Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterStatus('todos')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'todos'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos ({voluntarios.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('ativos')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'ativos'
                    ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ativos ({stats.ativos})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('inativos')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'inativos'
                    ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Inativos ({stats.inativos})
              </button>
            </div>

            {(searchTerm || filterSkill !== 'Todas' || filterProjeto !== 'Todos' || filterStatus !== 'todos') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterSkill('Todas');
                  setFilterProjeto('Todos');
                  setFilterStatus('todos');
                }}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Voluntários */}
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              Carregando lista de voluntários da Fundação Lar Harmonia...
            </p>
          </div>
        ) : filteredVoluntarios.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-heading">
              Nenhum voluntário encontrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Nenhum registro atendeu aos critérios de busca ou filtros selecionados. Tente ajustar os parâmetros ou cadastrar um novo voluntário.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Voluntário Agora</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredVoluntarios.map((vol) => {
              const isInactive = vol.status === 'inativo';

              return (
                <div
                  key={vol.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                    isInactive
                      ? 'border-slate-200 dark:border-slate-800 opacity-75'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  } p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
                >
                  <div>
                    {/* Cabeçalho do Card (Nome, Badge Status & Ações) */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 font-heading border border-indigo-200 dark:border-indigo-800">
                          {vol.nome_completo.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="font-bold text-slate-900 dark:text-white text-sm truncate font-heading hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                            onClick={() => setViewingVoluntario(vol)}
                          >
                            {vol.nome_completo}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {vol.profissao_formacao || 'Profissão não informada'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          isInactive
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isInactive ? 'bg-amber-600' : 'bg-emerald-600 animate-pulse'
                          }`}
                        />
                        {isInactive ? 'Inativo' : 'Ativo'}
                      </span>
                    </div>

                    {/* Projeto / Atuação */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/80 space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="truncate">{vol.projeto_atividade || 'Apoio Geral FLH'}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 shrink-0 font-medium">
                          {vol.turno_horario || 'Turno Geral'}
                        </span>
                      </div>

                      {/* Dias da Semana */}
                      {Array.isArray(vol.dias_semana) && vol.dias_semana.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {vol.dias_semana.map((d) => (
                            <span
                              key={d}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Habilidades (Tags) */}
                    {Array.isArray(vol.habilidades) && vol.habilidades.length > 0 && (
                      <div className="space-y-1 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Habilidades Especiais:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {vol.habilidades.map((hab) => (
                            <span
                              key={hab}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {hab}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contatos Rápidos */}
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {(vol.celular || vol.telefone) && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{vol.celular || vol.telefone}</span>
                        </p>
                      )}
                      {vol.email && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{vol.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Barra Inferior de Ações do Card */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingVoluntario(vol)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                      title="Visualizar Ficha do Voluntário"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Ficha</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(vol)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Editar cadastro do voluntário"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(vol)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isInactive
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                        title={isInactive ? 'Reativar voluntário' : 'Desativar voluntário'}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>

                        </>
                      )}

                      {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteVoluntario(vol.id, vol.nome_completo)}
                        disabled={deletingId === vol.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer disabled:opacity-50"
                        title="Excluir voluntário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: FORMULÁRIO DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
                    {editingVoluntario ? 'Editar Cadastro de Voluntário' : 'Novo Cadastro de Voluntário'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Preencha os dados oficiais do voluntário apoiador da Fundação Lar Harmonia.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Rolagem */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SEÇÃO 1: Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2 font-heading">
                  <User className="w-4 h-4" />
                  1. Dados Pessoais & Documentação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dra. Elena Vasconcelos de Souza"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Formação / Profissão
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Enfermeira / Artesã"
                      value={formData.profissao_formacao || ''}
                      onChange={(e) => setFormData({ ...formData, profissao_formacao: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CPF (apenas números)
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf || ''}
                      onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      RG / Registro
                    </label>
                    <input
                      type="text"
                      placeholder="Número do RG"
                      value={formData.rg || ''}
                      onChange={(e) => setFormData({ ...formData, rg: formatRG(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.data_nascimento || ''}
                      onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Celular (WhatsApp)
                    </label>
                    <input
                      type="text"
                      placeholder="(71) 90000-0000"
                      value={formData.celular || ''}
                      onChange={(e) => setFormData({ ...formData, celular: formatTelefone(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Telefone Fixo
                    </label>
                    <input
                      type="text"
                      placeholder="(71) 3000-0000"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      placeholder="voluntario@email.com"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-12">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Endereço Completo (Rua, Número, Bairro, Cidade)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Rua das Hortênsias, 120, Pituba, Salvador - BA"
                      value={formData.endereco || ''}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: Atuação na Fundação Lar Harmonia */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2 font-heading">
                  <Briefcase className="w-4 h-4" />
                  2. Atuação & Escala na Fundação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Atividade / Projeto de Apoio
                    </label>
                    <select
                      value={formData.projeto_atividade || ''}
                      onChange={(e) => setFormData({ ...formData, projeto_atividade: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    >
                      {PROJETOS_PREDEFINIDOS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Turno / Horário
                    </label>
                    <select
                      value={formData.turno_horario || 'Manhã'}
                      onChange={(e) => setFormData({ ...formData, turno_horario: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    >
                      {TURNOS_VOLUNTARIO.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Data de Admissão
                    </label>
                    <input
                      type="date"
                      value={formData.data_admissao || ''}
                      onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Checkboxes para Dias da Semana */}
                  <div className="sm:col-span-12">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Dias da Semana de Atuação
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DIAS_SEMANA_SIGLAS.map((d) => {
                        const isSelected = (formData.dias_semana || []).includes(d);
                        return (
                          <button
                            type="button"
                            key={d}
                            onClick={() => toggleDiaSemana(d)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            <span>{d}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: Habilidades Especiais (Multi-select / Tagging) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2 font-heading">
                  <Sparkles className="w-4 h-4" />
                  3. Habilidades Especiais & Banco de Talentos
                </h3>

                <p className="text-slate-500 dark:text-slate-400">
                  Selecione as habilidades predefinidas do voluntário ou adicione novas tags personalizadas:
                </p>

                {/* Seleção em Múltiplas Tags Predefinidas */}
                <div className="flex flex-wrap gap-1.5">
                  {HABILIDADES_PREDEFINIDAS.map((hab) => {
                    const isSelected = (formData.habilidades || []).includes(hab);
                    return (
                      <button
                        type="button"
                        key={hab}
                        onClick={() => toggleHabilidade(hab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{hab}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Adição de Tag Personalizada */}
                <div className="flex items-center gap-2 max-w-md pt-2">
                  <input
                    type="text"
                    placeholder="Outra habilidade ex: Costura Industrial, Violão..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer shrink-0"
                  >
                    Adicionar Tag
                  </button>
                </div>

                {/* Tags Atuais Selecionadas */}
                {Array.isArray(formData.habilidades) && formData.habilidades.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Habilidades Selecionadas no Cadastro ({formData.habilidades.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.habilidades.map((h) => (
                        <span
                          key={h}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
                        >
                          <span>{h}</span>
                          <button
                            type="button"
                            onClick={() => toggleHabilidade(h)}
                            className="text-indigo-500 hover:text-red-600 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SEÇÃO 4: Observações do Serviço Social */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-2 font-heading">
                  <FileText className="w-4 h-4" />
                  4. Observações & Anotações do Serviço Social
                </h3>
                <textarea
                  rows={3}
                  placeholder="Anotações internas sobre disponibilidade, restrições ou histórico do voluntário..."
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Footer de Ações do Form */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingVoluntario ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VISUALIZAÇÃO DE FICHA DO VOLUNTÁRIO */}
      {viewingVoluntario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Cabeçalho da Ficha */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl font-heading shadow-md">
                  {viewingVoluntario.nome_completo.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    {viewingVoluntario.nome_completo}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {viewingVoluntario.profissao_formacao || 'Voluntário Apoiador'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Imprimir Ficha do Voluntário"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewingVoluntario(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo Detalhado da Ficha */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
              {/* Card de Atuação Principal */}
              <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                <span className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                  Projeto & Escala de Atuação
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-900 dark:text-slate-100">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Atividade / Projeto:</span>
                    <strong className="font-bold text-indigo-950 dark:text-indigo-200">
                      {viewingVoluntario.projeto_atividade || 'Geral'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Turno / Horário:</span>
                    <span className="font-semibold">{viewingVoluntario.turno_horario || 'Geral'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Data de Admissão:</span>
                    <span className="font-medium">{formatDateDisplay(viewingVoluntario.data_admissao)}</span>
                  </div>
                </div>

                {Array.isArray(viewingVoluntario.dias_semana) && viewingVoluntario.dias_semana.length > 0 && (
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">Dias de Apoio:</span>
                    <div className="flex flex-wrap gap-1">
                      {viewingVoluntario.dias_semana.map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded font-bold bg-indigo-600 text-white text-[10px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Habilidades Especiais */}
              {Array.isArray(viewingVoluntario.habilidades) && viewingVoluntario.habilidades.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-heading">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Habilidades Especiais Mapeadas
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingVoluntario.habilidades.map((h) => (
                      <span
                        key={h}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dados Pessoais e Documentos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5 font-heading">
                  Dados Cadastrais & Contatos
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 font-semibold block">CPF:</span>
                    <span className="font-mono font-medium">{viewingVoluntario.cpf || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">RG:</span>
                    <span className="font-mono font-medium">{viewingVoluntario.rg || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Data de Nascimento:</span>
                    <span className="font-medium">{formatDateDisplay(viewingVoluntario.data_nascimento)}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block">Celular:</span>
                    <span className="font-medium">{viewingVoluntario.celular || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Telefone Fixo:</span>
                    <span className="font-medium">{viewingVoluntario.telefone || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">E-mail:</span>
                    <span className="font-medium">{viewingVoluntario.email || 'Não informado'}</span>
                  </div>

                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 font-semibold block">Endereço Residencial:</span>
                    <span className="font-medium">{viewingVoluntario.endereco || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Observações do Serviço Social */}
              {viewingVoluntario.observacoes && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                    Observações do Serviço Social:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed whitespace-pre-wrap">
                    "{viewingVoluntario.observacoes}"
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé da Ficha */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  const v = viewingVoluntario;
                  setViewingVoluntario(null);
                  handleOpenEditModal(v);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Ficha</span>
              </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => setViewingVoluntario(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
