import type { ReactNode } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn, iniciais } from "@/lib/format";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-linha bg-white", className)}>{children}</div>;
}

const coresBadge = {
  cinza: "bg-cinza-claro text-navy",
  vermelho: "bg-brand text-white",
  escuro: "bg-navy text-white",
  branco: "bg-white text-navy shadow-sm",
  alerta: "bg-red-50 text-brand",
};
export function Badge({ cor = "cinza", children, className }: { cor?: keyof typeof coresBadge; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", coresBadge[cor], className)}>{children}</span>;
}

export function Avatar({ nome, tamanho = 40 }: { nome?: string; tamanho?: number }) {
  return (
    <span className="inline-grid shrink-0 place-items-center rounded-full bg-navy font-display font-bold text-white"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }} aria-hidden>
      {nome ? iniciais(nome) : "?"}
    </span>
  );
}

export function Estrelas({ media, total, tamanho = "size-4" }: { media: number; total?: number; tamanho?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={`${media.toFixed(1)} de 5`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn(tamanho, i <= Math.round(media) ? "fill-brand text-brand" : "text-gray-300")} aria-hidden />)}
      </span>
      {total !== undefined && <span className="text-xs text-cinza">{total ? `${media.toFixed(1)} (${total})` : "sem avaliações"}</span>}
    </span>
  );
}

export function PageHeader({ titulo, subtitulo, acao }: { titulo: string; subtitulo?: string; acao?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-cinza">{subtitulo}</p>}
      </div>
      {acao}
    </div>
  );
}

export function Tabs({ abas, ativa }: { abas: { href: string; texto: string; contador?: number; chave: string }[]; ativa: string }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-linha" role="tablist">
      {abas.map((a) => (
        <Link key={a.chave} href={a.href} role="tab" aria-selected={a.chave === ativa}
          className={cn("-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
            a.chave === ativa ? "border-brand text-navy" : "border-transparent text-cinza hover:text-navy")}>
          {a.texto}
          {!!a.contador && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{a.contador}</span>}
        </Link>
      ))}
    </div>
  );
}

export function SecaoTitulo({ titulo, link }: { titulo: string; link?: { href: string; texto: string } }) {
  return (
    <div className="mb-5 mt-14 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-3 text-xl sm:text-2xl before:h-6 before:w-1 before:rounded before:bg-brand">{titulo}</h2>
      {link && <Link href={link.href} className="text-sm font-semibold hover:text-brand">{link.texto} →</Link>}
    </div>
  );
}

export function Container({ children, className, estreito }: { children: ReactNode; className?: string; estreito?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-8", estreito ? "max-w-3xl" : "max-w-7xl", className)}>{children}</div>;
}
