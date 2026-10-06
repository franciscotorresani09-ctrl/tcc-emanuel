"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftRight, Calendar, Gauge, Heart, MapPin, Zap } from "lucide-react";
import type { Anuncio } from "@/types";
import { cn, formatarKm, formatarPreco } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { usuarios } from "@/services/api";
import { useComparar } from "@/hooks/useComparar";
import { Badge } from "@/components/ui/Misc";
import { Skeleton } from "@/components/ui/States";
import { AdImage } from "./AdImage";

/** Cartão de um anúncio, usado nas listas e grades */
export function AdCard({ anuncio, rodape, semComparar }: { anuncio: Anuncio; rodape?: ReactNode; semComparar?: boolean }) {
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const { lista, alternar } = useComparar();
  const favorito = !!usuario?.favoritos.includes(anuncio.id);
  const comparando = lista.includes(anuncio.id);

  function favoritar() {
    if (!usuario) return mostrar("Entre na sua conta para salvar favoritos.", "info");
    const agora = usuarios.alternarFavorito(usuario.id, anuncio.id);
    mostrar(agora ? "Adicionado aos favoritos." : "Removido dos favoritos.");
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-linha bg-white transition hover:-translate-y-0.5 hover:shadow-xl">
      <Link href={`/anuncios/${anuncio.id}`} className="relative block aspect-[16/10]">
        <AdImage anuncio={anuncio} className="size-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {anuncio.destaque && <Badge cor="vermelho"><Zap className="size-3" /> Destaque</Badge>}
          {anuncio.aceitaTroca && <Badge cor="branco"><ArrowLeftRight className="size-3" /> Aceita troca</Badge>}
          {anuncio.status !== "ativo" && <Badge cor="escuro">{anuncio.status === "vendido" ? "Vendido" : "Pausado"}</Badge>}
        </div>
      </Link>
      <button onClick={favoritar} aria-label={favorito ? "Remover dos favoritos" : "Favoritar"} aria-pressed={favorito}
        className={cn("absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white shadow transition hover:scale-110", favorito ? "text-brand" : "text-navy")}>
        <Heart className={cn("size-4.5", favorito && "fill-current")} />
      </button>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/anuncios/${anuncio.id}`} className="font-display font-bold hover:text-brand">{anuncio.marca} {anuncio.modelo}</Link>
        <p className="truncate text-sm text-cinza">{anuncio.versao || "—"}</p>
        <div className="my-2.5 flex gap-4 text-xs text-cinza">
          <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {anuncio.ano}</span>
          <span className="inline-flex items-center gap-1"><Gauge className="size-3.5" /> {formatarKm(anuncio.km)}</span>
        </div>
        <p className="mt-auto font-display text-xl font-extrabold">{formatarPreco(anuncio.preco)}</p>
        <div className="mt-3 flex items-center justify-between border-t border-linha pt-3 text-xs">
          <span className="inline-flex items-center gap-1 text-cinza"><MapPin className="size-3.5" /> {anuncio.cidade} - {anuncio.uf}</span>
          {!semComparar && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-cinza">
              <input type="checkbox" className="accent-brand" checked={comparando} onChange={() => { const r = alternar(anuncio.id); if (r === "cheio") mostrar("Você pode comparar até 3 veículos.", "erro"); }} />
              Comparar
            </label>
          )}
        </div>
        {rodape}
      </div>
    </article>
  );
}

export function AdCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-linha bg-white" aria-hidden>
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-4 h-6 w-1/2" />
      </div>
    </div>
  );
}

export function AdGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>;
}

export function AdGridSkeleton({ quantidade = 8 }: { quantidade?: number }) {
  return <AdGrid>{Array.from({ length: quantidade }, (_, i) => <AdCardSkeleton key={i} />)}</AdGrid>;
}
