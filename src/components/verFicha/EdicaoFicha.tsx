import {
  User,
  Home,
  Briefcase,
  HeartPulse,
  GraduationCap,
  Save,
  ArrowRight,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { TabIdentificacao } from '../cadastro/TabIdentificacao';
import { TabTrabalhoRenda } from '../cadastro/TabTrabalhoRenda';
import { TabMoradiaFamilia } from '../cadastro/TabMoradiaFamilia';
import { TabVulnerabilidades } from '../cadastro/TabVulnerabilidades';
import { TabMotivacoes } from '../cadastro/TabMotivacoes';
import type { FichaCtx } from './useVerFicha';

/** Modo de edição: formulário completo das 5 abas. */
export function EdicaoFicha({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    editActiveTab,
    setEditActiveTab,
    editFormData,
    setEditFormData,
    fotoPreview,
    savingEdit,
    handleCancelEdit,
    handleFileSelect,
    handleRemoveFoto,
    handleSaveFullEdit
  } = ctx;

  return (
    <>
            <div className="space-y-6">
              {editActiveTab === 1 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>
                      Aba 1: Atualize os dados civis, documentos, endereço/bairro e a foto do assistido.
                    </span>
                  </div>
                  <TabIdentificacao
                    formData={editFormData}
                    setFormData={setEditFormData}
                    fotoPreview={fotoPreview}
                    onFileSelect={handleFileSelect}
                    onRemoveFoto={handleRemoveFoto}
                    assistidoId={assistido.id}
                  />
                </div>
              )}

              {editActiveTab === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>
                      Aba 2: Atualize atividade remunerada, ocupação, dias trabalhados, desemprego, faixa de renda e programas sociais.
                    </span>
                  </div>
                  <TabTrabalhoRenda
                    formData={editFormData}
                    setFormData={setEditFormData}
                  />
                </div>
              )}

              {editActiveTab === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex items-center gap-2">
                    <Home className="w-4 h-4 text-indigo-600" />
                    <span>
                      Aba 3: Atualize composição familiar, número de filhos, internet, tipo de moradia e infraestrutura básica.
                    </span>
                  </div>
                  <TabMoradiaFamilia
                    formData={editFormData}
                    setFormData={setEditFormData}
                  />
                </div>
              )}

              {editActiveTab === 4 && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>
                      Aba 4: Atualize dificuldades, saúde familiar (parentesco, condições e remédios), rede de apoio e serviços da FLH.
                    </span>
                  </div>
                  <TabVulnerabilidades
                    formData={editFormData}
                    setFormData={setEditFormData}
                  />
                </div>
              )}

              {editActiveTab === 5 && (
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>
                      Aba 5: Atualize oficinas pretendidas, objetivos nos próximos 3 meses, percepção da FLH e outras oficinas.
                    </span>
                  </div>
                  <TabMotivacoes
                    formData={editFormData}
                    setFormData={setEditFormData}
                  />
                </div>
              )}

              {/* Botões de Navegação Entre Abas da Edição */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {editActiveTab > 1 && (
                    <button
                      type="button"
                      onClick={() => setEditActiveTab((prev) => Math.max(1, prev - 1))}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Etapa Anterior ({editActiveTab - 1})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Descartar Edição
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {editActiveTab < 5 ? (
                    <button
                      type="button"
                      onClick={() => setEditActiveTab((prev) => Math.min(5, prev + 1))}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Próxima Etapa ({editActiveTab + 1})
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleSaveFullEdit}
                    disabled={savingEdit}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    {savingEdit ? 'Salvando Alterações...' : 'Salvar Alterações no Banco'}
                  </button>
                </div>
              </div>
            </div>
    </>
  );
}
