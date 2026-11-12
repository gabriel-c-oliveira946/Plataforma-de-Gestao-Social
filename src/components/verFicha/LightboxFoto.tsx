import { X, User } from 'lucide-react';
import type { FichaCtx } from './useVerFicha';

/** Foto do assistido ampliada. */
export function LightboxFoto({ ctx }: { ctx: FichaCtx }) {
  const {
    assistido,
    fotoZoomUrl,
    setFotoZoomUrl
  } = ctx;

  return (
    <>
    {/* Modal Lightbox de Foto Ampliada (Visível e com z-index máximo) */}
    {fotoZoomUrl && (
      <div
        className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-zoom-out"
        onClick={() => setFotoZoomUrl(null)}
      >
        <div
          className="relative max-w-3xl w-full flex flex-col items-center cursor-default animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm sm:text-base tracking-tight text-white drop-shadow truncate">
                {assistido.nome_completo}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFotoZoomUrl(null)}
              className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Fechar ampliação (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black max-h-[78vh] flex items-center justify-center">
            <img
              src={fotoZoomUrl}
              alt={`Foto ampliada de ${assistido.nome_completo}`}
              className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-2xl"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-white/90 font-medium text-xs sm:text-sm">
              {assistido.curso_pretendido || 'Oficina Geral'} • CPF: {assistido.cpf || 'Não informado'}
            </p>
            <p className="text-white/50 text-[11px] mt-1">
              Clique fora da imagem ou no <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] text-white">X</kbd> para fechar
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
