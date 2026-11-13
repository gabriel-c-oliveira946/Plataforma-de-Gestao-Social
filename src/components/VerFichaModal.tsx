import React from 'react';
import {
  isPendenteAvaliacao4Meses,
  isPendenteEntrevistaDomiciliar1Ano,
  hasAvaliacao4Meses,
  hasEntrevistaDomiciliar1Ano,
  getEntrevistaDomiciliar1Ano,
  isStatusAtivo,
  getDiasIngresso,
  getAvaliacao4Meses,
  getAssistidoMotivoEvasao,
  getAssistidoDataSaida
} from '../utils/avaliacao4Meses';
import { useVerFicha, VerFichaModalProps } from './verFicha/useVerFicha';
import { CabecalhoFicha } from './verFicha/CabecalhoFicha';
import { NavegacaoFicha } from './verFicha/NavegacaoFicha';
import { EdicaoFicha } from './verFicha/EdicaoFicha';
import { AbaGeral } from './verFicha/AbaGeral';
import { AbaIdentificacao } from './verFicha/AbaIdentificacao';
import { AbaTrabalho } from './verFicha/AbaTrabalho';
import { AbaMoradia } from './verFicha/AbaMoradia';
import { AbaSaude } from './verFicha/AbaSaude';
import { AbaOficina } from './verFicha/AbaOficina';
import { AbaAvaliacao } from './verFicha/AbaAvaliacao';
import { RodapeFicha } from './verFicha/RodapeFicha';
import { ImpressaoFicha } from './verFicha/ImpressaoFicha';
import { ModalConfirmarExclusao } from './verFicha/ModalConfirmarExclusao';
import { ModalEntrevista } from './verFicha/ModalEntrevista';
import { LightboxFoto } from './verFicha/LightboxFoto';
/**
 * Ficha completa do assistido (visualização, edição, avaliação e impressão).
 * A lógica fica em ./verFicha/useVerFicha e cada parte visual em ./verFicha/*.
 */
export {
  isPendenteAvaliacao4Meses,
  isPendenteEntrevistaDomiciliar1Ano,
  hasAvaliacao4Meses,
  hasEntrevistaDomiciliar1Ano,
  getEntrevistaDomiciliar1Ano,
  isStatusAtivo,
  getDiasIngresso,
  getAvaliacao4Meses,
  getAssistidoMotivoEvasao,
  getAssistidoDataSaida
};
export type { Assistido, Avaliacao4MesesParsed } from './verFicha/tipos';
export { convertAssistidoToFormData } from './verFicha/converterParaFormulario';

export const VerFichaModal: React.FC<VerFichaModalProps> = (props) => {
  const ctx = useVerFicha(props);
  const {
    isEditingData
  } = ctx;

  return (
    <>
      <div className="no-print fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl max-w-6xl w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border-0 sm:border border-gray-100 dark:border-slate-800">
        
        <CabecalhoFicha ctx={ctx} />

        <NavegacaoFicha ctx={ctx} />

        {/* ÁREA DE CONTEÚDO PRINCIPAL (COM SCROLL E EXPANSÃO TOTAL NO MOBILE) */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-sm text-gray-800 dark:text-slate-200 bg-gray-50/30 dark:bg-slate-900">
          
          {/* ================================================================= */}
          {/* MODO DE EDIÇÃO: AS 5 ABAS FORMULÁRIO COMPLETO */}
          {/* ================================================================= */}
          {isEditingData ? (
            <EdicaoFicha ctx={ctx} />
          ) : (
            /* =============================================================== */
            /* MODO DE LEITURA (VISUALIZAÇÃO COMPLETA DA FICHA) */
            /* =============================================================== */
            <div>
              <AbaGeral ctx={ctx} />

              <AbaIdentificacao ctx={ctx} />

              <AbaTrabalho ctx={ctx} />

              <AbaMoradia ctx={ctx} />

              <AbaSaude ctx={ctx} />

              <AbaOficina ctx={ctx} />

              <AbaAvaliacao ctx={ctx} />
            </div>
          )}
        </div>

        <RodapeFicha ctx={ctx} />
      </div>
    </div>

    <ImpressaoFicha ctx={ctx} />

    <ModalConfirmarExclusao ctx={ctx} />

    <ModalEntrevista ctx={ctx} />

    <LightboxFoto ctx={ctx} />
  </>
  );
};
