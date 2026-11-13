import { parseCondicoesSaudeParaImpressao } from '../FichaAssistido';
import type { Assistido } from './tipos';
import type { FichaCtx } from './useVerFicha';

/** Estilos e documento A4 usados apenas na impressão. */
export function ImpressaoFicha({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    operadorAtualizacao,
    existingAvaliacao,
    isPendente4Meses,
    formatDate
  } = ctx;

  return (
    <>
    {/* ESTILOS DE IMPRESSÃO EMBUTIDOS PARA GARANTIR COMPATIBILIDADE A4 */}
    <style>{`
      @media print {
        header, nav, aside, footer, .no-print, .no-print * {
          display: none !important;
          visibility: hidden !important;
        }

        button, [role="button"] {
          display: none !important;
        }

        html, body, #root, .min-h-screen {
          background: #ffffff !important;
          background-color: #ffffff !important;
          color: #111827 !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: 0 !important;
          overflow: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        #ficha-impressao-a4 {
          display: block !important;
          visibility: visible !important;
          position: relative !important;
          width: 100% !important;
          max-width: 210mm !important;
          margin: 0 auto !important;
          padding: 8mm 12mm !important;
          background: #ffffff !important;
          background-color: #ffffff !important;
          color: #111827 !important;
          box-shadow: none !important;
          border: none !important;
          z-index: 999999 !important;
        }

        #ficha-impressao-a4 * {
          visibility: visible !important;
        }

        .print-section {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          margin-bottom: 12px !important;
        }

        @page {
          size: A4 portrait;
          margin: 8mm 10mm;
        }
      }
    `}</style>

    {/* DOCUMENTO FORMATADO PARA IMPRESSÃO A4 (EXCLUSIVO @media print) */}
    <div id="ficha-impressao-a4" className="hidden print:block p-6 bg-white text-gray-900 text-xs">
      {/* Cabeçalho Institucional A4 */}
      <div className="print-section border-b-2 border-gray-900 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {assistido.foto_url && (
            <img
              src={assistido.foto_url}
              alt={assistido.nome_completo}
              className="w-16 h-16 rounded-lg object-cover border border-gray-300"
            />
          )}
          <div>
            <h1 className="text-sm font-extrabold uppercase tracking-wide text-gray-900">
              Fundação Lar Harmonia
            </h1>
            <h2 className="text-xs font-semibold text-gray-700">
              Setor de Serviço Social • Ficha Cadastral e Acompanhamento do Assistido
            </h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Protocolo Cadastral: #{assistido.id} • Emissão: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block border border-gray-800 px-2.5 py-0.5 text-xs font-bold uppercase rounded">
            {assistido.status_curso || 'Em Acompanhamento'}
          </span>
          <p className="text-[10px] text-gray-600 mt-1">
            Ingresso: {formatDate(assistido.data_ingresso || assistido.created_at)}
          </p>
        </div>
      </div>

      {/* 1. Identificação Civil & Contato (Aba 1) */}
      <div className="print-section mb-3.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 border-l-4 border-emerald-600 mb-1.5">
          1. Identificação Civil & Contato
        </h3>
        <div className="grid grid-cols-3 gap-2 border border-gray-200 p-2.5 rounded text-[11px]">
          <div>
            <span className="text-gray-500 block">Nome Completo:</span>
            <strong className="text-gray-900">{assistido.nome_completo}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">CPF:</span>
            <span>{assistido.cpf || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">RG:</span>
            <span>{assistido.rg || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Data de Nasc. / Idade:</span>
            <span>
              {assistido.data_nascimento ? formatDate(assistido.data_nascimento) : 'Não informada'}
              {assistido.idade ? ` (${assistido.idade} anos)` : ''}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Raça / Cor:</span>
            <span>{assistido.raca_cor || 'Não informada'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Estado Civil:</span>
            <span>{assistido.estado_civil || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Telefone:</span>
            <span>{assistido.telefone || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Bairro:</span>
            <span>{assistido.bairro || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">CRAS de Referência:</span>
            <span>{assistido.possui_cras ? `Sim (${assistido.bairro_cras || 'Bairro'})` : 'Não possui'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Cadastro FLH:</span>
            <span>{assistido.possui_cadastro_flh ? 'Sim (Já cadastrado)' : 'Primeiro Cadastro'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block">Endereço Completo:</span>
            <span>{assistido.endereco || 'Não informado'}</span>
          </div>
        </div>
      </div>

      {/* 2. Trabalho, Renda & Benefícios (Aba 2) */}
      <div className="print-section mb-3.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 border-l-4 border-emerald-600 mb-1.5">
          2. Trabalho, Renda & Benefícios
        </h3>
        <div className="grid grid-cols-3 gap-2 border border-gray-200 p-2.5 rounded text-[11px]">
          <div>
            <span className="text-gray-500 block">Escolaridade:</span>
            <span>{assistido.escolaridade || 'Não informada'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Profissão / Ocupação:</span>
            <span>{assistido.profissao || assistido.atividade_remunerada || 'Não informada'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Atividade Remunerada:</span>
            <span>{assistido.atividade_remunerada || 'Não informada'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Renda Familiar Aproximada:</span>
            <span>
              {assistido.renda_familiar_aproximada
                ? `R$ ${assistido.renda_familiar_aproximada}`
                : 'Sem renda informada'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block">Benefícios Sociais:</span>
            <span>
              {Array.isArray(assistido.beneficios_sociais) && assistido.beneficios_sociais.length > 0
                ? assistido.beneficios_sociais.join(', ')
                : 'Nenhum benefício social registrado'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Moradia & Família (Aba 3) */}
      <div className="print-section mb-3.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 border-l-4 border-emerald-600 mb-1.5">
          3. Moradia & Composição Familiar
        </h3>
        <div className="grid grid-cols-3 gap-2 border border-gray-200 p-2.5 rounded text-[11px]">
          <div>
            <span className="text-gray-500 block">Tipo de Moradia:</span>
            <span>{assistido.tipo_moradia || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Composição Familiar:</span>
            <span>{assistido.composicao_familiar ? `${assistido.composicao_familiar} pessoa(s)` : 'Não informada'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Quantidade de Filhos:</span>
            <span>{assistido.quantidade_filhos !== undefined && assistido.quantidade_filhos !== null ? `${assistido.quantidade_filhos} filho(s)` : 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Serviços Básicos (Água / Luz):</span>
            <span>{assistido.servicos_basicos_regulares ? 'Regulares' : 'Irregulares / Parciais'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Acesso à Internet:</span>
            <span>{assistido.acesso_internet || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Rede de Apoio:</span>
            <span>{assistido.rede_apoio || 'Não informada'}</span>
          </div>
        </div>
      </div>

      {/* 4. Saúde & Vulnerabilidades (Aba 4) */}
      <div className="print-section mb-3.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 border-l-4 border-rose-600 mb-1.5 flex items-center justify-between">
          <span>4. Vulnerabilidades e Saúde Familiar</span>
          {(() => {
            const conds = parseCondicoesSaudeParaImpressao(assistido.doencas_cronicas_familia);
            return (
              <span className="text-[10px] font-semibold text-gray-600">
                {conds.length > 0 ? `${conds.length} condição(ões) cadastrada(s)` : 'Sem patologias cadastradas'}
              </span>
            );
          })()}
        </h3>

        {/* Tabela Formatada de Condições de Saúde para Impressão */}
        {(() => {
          const condicoes = parseCondicoesSaudeParaImpressao(assistido.doencas_cronicas_familia);
          if (condicoes.length > 0) {
            return (
              <div className="border border-gray-300 rounded overflow-hidden mb-2">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold">
                      <th className="py-1.5 px-2.5 w-1/4">Categoria & Diagnóstico</th>
                      <th className="py-1.5 px-2.5 w-1/5">Quem Possui</th>
                      <th className="py-1.5 px-2.5 w-1/4">Medicamento / Tratamento</th>
                      <th className="py-1.5 px-2.5">Observações & Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {condicoes.map((cond, i) => (
                      <tr key={cond.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="py-1.5 px-2.5 align-top">
                          <span className="font-bold text-gray-950 block">{cond.nomeDoenca}</span>
                          <span className="text-[10px] text-rose-700 font-medium">{cond.categoria}</span>
                        </td>
                        <td className="py-1.5 px-2.5 align-top">
                          <span className="font-semibold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] inline-block">
                            {cond.quemPossui}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 align-top text-gray-800">
                          {cond.medicamento}
                        </td>
                        <td className="py-1.5 px-2.5 align-top text-gray-700">
                          {cond.observacoes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return (
            <div className="p-2 border border-gray-200 rounded text-[11px] text-gray-600 bg-gray-50 mb-2">
              Nenhuma condição crônica, dependência, sofrimento mental ou deficiência declarada.
            </div>
          );
        })()}

        <div className="grid grid-cols-2 gap-2 border border-gray-200 p-2.5 rounded text-[11px] bg-gray-50/30">
          <div>
            <span className="text-gray-500 block">Dificuldades Enfrentadas:</span>
            <span className="font-medium text-gray-900">
              {Array.isArray(assistido.dificuldades_enfrentadas) && assistido.dificuldades_enfrentadas.length > 0
                ? assistido.dificuldades_enfrentadas.join(', ')
                : 'Nenhuma informada'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Fatores de Risco de Evasão:</span>
            <span className="font-medium text-gray-900">
              {Array.isArray(assistido.fatores_risco_evasao) && assistido.fatores_risco_evasao.length > 0
                ? assistido.fatores_risco_evasao.join(', ')
                : 'Nenhum identificado'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block">Serviços de Acompanhamento Social:</span>
            <span>
              {Array.isArray(assistido.servicos_acompanhamento) && assistido.servicos_acompanhamento.length > 0
                ? assistido.servicos_acompanhamento.join(', ')
                : 'Nenhum serviço registrado'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Oficinas & Acompanhamento FLH (Aba 5) */}
      <div className="print-section mb-3.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 border-l-4 border-emerald-600 mb-1.5">
          5. Oficinas & Acompanhamento na Fundação Lar Harmonia
        </h3>
        <div className="grid grid-cols-2 gap-2 border border-gray-200 p-2.5 rounded text-[11px]">
          <div>
            <span className="text-gray-500 block">Oficina / Curso Vinculado:</span>
            <strong className="text-gray-900">{assistido.curso_pretendido || 'Geral / Acompanhamento Social'}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Data de Ingresso:</span>
            <span>{formatDate(assistido.data_ingresso || assistido.created_at)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block">Motivo da Busca & Expectativas:</span>
            <span>{assistido.motivo_busca || assistido.expectativa_curso || 'Não informado'}</span>
          </div>
          {assistido.objetivo_profissional_3_meses && (
            <div className="col-span-2">
              <span className="text-gray-500 block">Objetivo Profissional (3 Meses):</span>
              <span>{assistido.objetivo_profissional_3_meses}</span>
            </div>
          )}
          {assistido.cursos_anteriores && (
            <div className="col-span-2">
              <span className="text-gray-500 block">Cursos Anteriores na FLH:</span>
              <span>
                {Array.isArray(assistido.cursos_anteriores)
                  ? assistido.cursos_anteriores.join(', ')
                  : assistido.cursos_anteriores}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 6. Avaliação de 4 Meses */}
      <div className="print-section mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 border-l-4 border-amber-600 mb-1.5">
          6. Registro de Avaliação de 4 Meses
        </h3>
        <div className="border border-gray-200 p-2.5 rounded text-[11px]">
          {existingAvaliacao ? (
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-gray-500 block">Data da Avaliação:</span>
                  <strong>{formatDate(existingAvaliacao.data_avaliacao)}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Status Final do Curso:</span>
                  <strong>{existingAvaliacao.status_final_curso}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Impacto na Renda/Vida:</span>
                  <strong>{existingAvaliacao.impacto_gerado}</strong>
                </div>
              </div>
              {existingAvaliacao.mudanca_autonomia_qualidade_vida && (
                <div>
                  <span className="text-gray-500 block">Depoimento / Mudança na Autonomia:</span>
                  <p className="italic text-gray-800">"{existingAvaliacao.mudanca_autonomia_qualidade_vida}"</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              {isPendente4Meses
                ? 'Assistido com 4 meses de acompanhamento completos - Avaliação Pendente de Registro.'
                : 'Assistido em período regular de acompanhamento (< 120 dias). Avaliação de 4 meses ainda não realizada.'}
            </p>
          )}
        </div>
      </div>

      {/* Rodapé com Assinaturas Oficiais */}
      <div className="print-section pt-4 mt-4 border-t border-gray-300">
        <p className="text-[9px] text-gray-500 text-center mb-6">
          Declaro para os devidos fins que as informações acima foram registradas no Sistema Social da Fundação Lar Harmonia.
        </p>

        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-gray-800 pt-1.5 w-4/5 mx-auto">
              <p className="font-bold text-gray-900">{assistido.nome_completo}</p>
              <p className="text-[10px] text-gray-500">Assinatura do Assistido</p>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-800 pt-1.5 w-4/5 mx-auto">
              <p className="font-bold text-gray-900">
                {operadorAtualizacao?.nome || 'Serviço Social'}
              </p>
              <p className="text-[10px] text-gray-500">
                {operadorAtualizacao?.cargo || 'Assistente Social Responsável'} • FLH
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
