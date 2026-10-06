"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

/** Janela sobre a tela. Fecha com o X, clicando fora ou com a tecla Esc. */
export function Modal({ aberto, aoFechar, titulo, children, largura = "max-w-lg" }: {
  aberto: boolean; aoFechar: () => void; titulo: string; children: ReactNode; largura?: string;
}) {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") aoFechar(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [aberto, aoFechar]);

  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 backdrop-blur-sm p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) aoFechar(); }}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className={`w-full ${largura} max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-entrar`}>
        <div className="sticky top-0 flex items-center justify-between border-b border-linha bg-white px-5 py-4">
          <h2 className="text-lg">{titulo}</h2>
          <button onClick={aoFechar} aria-label="Fechar" className="grid size-9 place-items-center rounded-lg hover:bg-cinza-claro"><X className="size-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/** Pergunta "tem certeza?" antes de uma ação importante */
export function ConfirmModal({ aberto, aoFechar, aoConfirmar, titulo, texto, botao = "Confirmar", carregando }: {
  aberto: boolean; aoFechar: () => void; aoConfirmar: () => void; titulo: string; texto: string; botao?: string; carregando?: boolean;
}) {
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={titulo} largura="max-w-md">
      <p className="text-sm text-cinza">{texto}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secundario" onClick={aoFechar}>Cancelar</Button>
        <Button onClick={aoConfirmar} carregando={carregando}>{botao}</Button>
      </div>
    </Modal>
  );
}
