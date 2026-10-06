"use client";

import { Columns2, X } from "lucide-react";
import { useComparar } from "@/hooks/useComparar";
import { Button } from "@/components/ui/Button";

/** Barra flutuante que aparece quando há carros marcados para comparar */
export function CompareBar() {
  const { lista, limpar } = useComparar();
  if (!lista.length) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-navy py-2 pl-5 pr-2 text-white shadow-2xl animate-subir">
      <Columns2 className="size-4" />
      <span className="hidden text-sm sm:inline">{lista.length} veículo{lista.length > 1 && "s"} para comparar</span>
      <Button href="/comparar" tamanho="sm">Comparar agora</Button>
      <button onClick={limpar} aria-label="Limpar comparação" className="grid size-8 place-items-center rounded-full hover:bg-white/10"><X className="size-4" /></button>
    </div>
  );
}
