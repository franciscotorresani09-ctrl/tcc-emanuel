"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/format";

type TipoToast = "sucesso" | "erro" | "info";
interface Toast { id: number; tipo: TipoToast; texto: string }

const Contexto = createContext<{ mostrar: (texto: string, tipo?: TipoToast) => void } | null>(null);

const estilos: Record<TipoToast, { icone: typeof Info; cor: string }> = {
  sucesso: { icone: CircleCheck, cor: "text-emerald-400" },
  erro: { icone: CircleAlert, cor: "text-brand" },
  info: { icone: Info, cor: "text-sky-300" },
};

/** Mensagens de feedback que aparecem no canto da tela e somem sozinhas */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Toast[]>([]);

  const fechar = useCallback((tid: number) => setLista((l) => l.filter((t) => t.id !== tid)), []);
  const mostrar = useCallback((texto: string, tipo: TipoToast = "sucesso") => {
    const tid = Date.now() + Math.random();
    setLista((l) => [...l.slice(-3), { id: tid, tipo, texto }]);
    setTimeout(() => fechar(tid), 3800);
  }, [fechar]);

  return (
    <Contexto.Provider value={{ mostrar }}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-96" role="status" aria-live="polite">
        {lista.map((t) => {
          const { icone: Icone, cor } = estilos[t.tipo];
          return (
            <div key={t.id} className={cn("flex items-start gap-3 rounded-xl bg-navy text-white px-4 py-3 shadow-2xl animate-subir border-l-4",
              t.tipo === "erro" ? "border-brand" : t.tipo === "sucesso" ? "border-emerald-400" : "border-sky-300")}>
              <Icone className={cn("size-5 shrink-0 mt-0.5", cor)} aria-hidden />
              <p className="flex-1 text-sm">{t.texto}</p>
              <button onClick={() => fechar(t.id)} aria-label="Fechar aviso" className="text-white/60 hover:text-white"><X className="size-4" /></button>
            </div>
          );
        })}
      </div>
    </Contexto.Provider>
  );
}

export function useToast() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useToast precisa estar dentro do ToastProvider");
  return c;
}
