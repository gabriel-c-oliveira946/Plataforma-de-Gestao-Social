import { AlertTriangle, Link2, UserCheck } from 'lucide-react';
import { ResumoPessoa, cpfDigitos, usePessoasPorCpf } from '../../utils/vinculoPessoas';

type TipoFicha = 'assistido' | 'voluntario';

const ROTULO_OUTRO: Record<TipoFicha, string> = {
  assistido: 'Também é voluntário(a)',
  voluntario: 'Também é assistido(a)'
};

/** Selo exibido quando a pessoa também tem ficha no outro módulo. */
export function SeloOutroModulo({ tipoAtual, titulo }: { tipoAtual: TipoFicha; titulo?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-700 shrink-0"
      title={titulo}
    >
      <Link2 className="w-3 h-3" />
      {ROTULO_OUTRO[tipoAtual]}
    </span>
  );
}

/** Selo autônomo: busca sozinho se o CPF existe no outro módulo (usado na ficha). */
export function SeloOutroModuloPorCpf({ cpf, tipoAtual }: { cpf?: string | null; tipoAtual: TipoFicha }) {
  const indices = usePessoasPorCpf();
  const chave = cpfDigitos(cpf);
  const outros = chave ? (tipoAtual === 'assistido' ? indices.voluntarios : indices.assistidos).get(chave) : undefined;
  if (!outros?.length) return null;
  return <SeloOutroModulo tipoAtual={tipoAtual} titulo={`Ficha no outro módulo: ${outros.map((o) => o.nome).join(', ')}`} />;
}

/**
 * Aviso no formulário quando o CPF digitado já existe:
 * - no outro módulo: mostra a pessoa e oferece preencher os dados básicos;
 * - no mesmo módulo: alerta de cadastro duplicado.
 */
export function AvisoCpf({
  cpf,
  tipoAtual,
  idAtual,
  onUsarDados,
  className = ''
}: {
  cpf?: string | null;
  tipoAtual: TipoFicha;
  idAtual?: string | null;
  onUsarDados?: (pessoa: ResumoPessoa) => void;
  className?: string;
}) {
  const indices = usePessoasPorCpf();
  const chave = cpfDigitos(cpf);
  if (!chave || !indices.carregado) return null;

  const mesmoModulo = (tipoAtual === 'assistido' ? indices.assistidos : indices.voluntarios)
    .get(chave)
    ?.filter((p) => p.id !== idAtual);
  const outroModulo = (tipoAtual === 'assistido' ? indices.voluntarios : indices.assistidos).get(chave);
  if (!mesmoModulo?.length && !outroModulo?.length) return null;

  const nomeOutro = tipoAtual === 'assistido' ? 'voluntário(a)' : 'assistido(a)';
  const nomeMesmo = tipoAtual === 'assistido' ? 'assistido(a)' : 'voluntário(a)';

  return (
    <div className={`space-y-2 ${className}`}>
      {mesmoModulo && mesmoModulo.length > 0 && (
        <div className="p-2.5 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Já existe {nomeMesmo} com este CPF: {mesmoModulo.map((p) => p.nome).join(', ')}. Verifique para não duplicar
            o cadastro.
          </span>
        </div>
      )}
      {outroModulo && outroModulo.length > 0 && (
        <div className="p-2.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 text-xs flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="flex items-start gap-2 flex-1">
            <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>{outroModulo[0].nome}</strong> já está cadastrado(a) como {nomeOutro}. As duas fichas ficarão
              ligadas pelo CPF.
            </span>
          </span>
          {onUsarDados && (
            <button
              type="button"
              onClick={() => onUsarDados(outroModulo[0])}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold transition cursor-pointer"
              title="Preenche nome, nascimento, telefone e endereço apenas nos campos que estão vazios"
            >
              Usar dados básicos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
