"use client";

import Link from "next/link";
import { Check, MapPin, Users } from "lucide-react";
import type { Encontro } from "@/types";
import { cn, dataDoEncontro } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { consulta } from "@/services/api";
import { Badge } from "@/components/ui/Misc";
import { Skeleton } from "@/components/ui/States";

export function DataEncontro({ data, hora, grande }: { data: string; hora: string; grande?: boolean }) {
  const d = dataDoEncontro(data, hora);
  return (
    <div className={cn("flex shrink-0 flex-col items-center justify-center self-start rounded-xl border-b-4 border-brand bg-navy uppercase text-white", grande ? "w-24 py-4" : "w-16 py-2.5")}>
      <strong className={cn("font-display font-extrabold leading-none", grande ? "text-4xl" : "text-2xl")}>{d.dia}</strong>
      <span className="text-xs font-bold tracking-wider">{d.mes}</span>
      {!grande && <span className="text-[10px] opacity-75">{hora}</span>}
    </div>
  );
}

export function EventCard({ encontro: e }: { encontro: Encontro }) {
  const { usuario } = useAuth();
  const vou = !!usuario && e.confirmados.includes(usuario.id);
  const org = consulta.usuario(e.organizadorId);
  return (
    <Link href={`/encontros/${e.id}`} className="flex gap-4 rounded-2xl border border-linha bg-white p-4 transition hover:shadow-lg">
      <DataEncontro data={e.data} hora={e.hora} />
      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5"><Badge>{e.categoria}</Badge>{vou && <Badge cor="escuro"><Check className="size-3" /> Você vai</Badge>}</div>
        <h3 className="mt-2 leading-snug">{e.titulo}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-cinza"><MapPin className="size-3.5" /> {e.cidade} - {e.uf}</p>
        <p className="flex items-center gap-1 text-sm text-cinza"><Users className="size-3.5" /> {e.confirmados.length} confirmado{e.confirmados.length !== 1 && "s"}{e.capacidade ? ` de ${e.capacidade}` : ""}{org && ` · por ${org.nome}`}</p>
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-linha p-4" aria-hidden>
      <Skeleton className="h-20 w-16 rounded-xl" />
      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
    </div>
  );
}
