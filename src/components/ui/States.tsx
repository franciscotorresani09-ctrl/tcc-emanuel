// Estados visuais reutilizáveis: carregando, vazio e erro
import type { ReactNode } from "react";
import { Inbox, LoaderCircle, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/format";
import { Button } from "./Button";

/** Bloco cinza pulsando no lugar do conteúdo enquanto carrega */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-gray-200", className)} aria-hidden />;
}

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-cinza" role="status">
      <LoaderCircle className="size-8 animate-spin text-brand" aria-hidden />
      <p className="text-sm">{texto}</p>
    </div>
  );
}

export function EstadoVazio({ icone, titulo, texto, acao, className }: { icone?: ReactNode; titulo: string; texto?: string; acao?: ReactNode; className?: string }) {
  return (
    <div className={cn("col-span-full flex flex-col items-center text-center gap-2 py-14 px-4", className)}>
      <div className="grid size-16 place-items-center rounded-full bg-cinza-claro text-gray-400 [&>svg]:size-8 mb-2">{icone ?? <Inbox />}</div>
      <h3 className="text-lg">{titulo}</h3>
      {texto && <p className="text-sm text-cinza max-w-sm">{texto}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  );
}

export function EstadoErro({ mensagem, aoTentarDeNovo }: { mensagem: string; aoTentarDeNovo?: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center text-center gap-2 py-14 px-4" role="alert">
      <div className="grid size-16 place-items-center rounded-full bg-red-50 text-brand mb-2"><WifiOff className="size-8" /></div>
      <h3 className="text-lg">Algo deu errado</h3>
      <p className="text-sm text-cinza max-w-sm">{mensagem}</p>
      {aoTentarDeNovo && <Button variante="secundario" className="mt-3" onClick={aoTentarDeNovo} icone={<RefreshCw className="size-4" />}>Tentar de novo</Button>}
    </div>
  );
}
