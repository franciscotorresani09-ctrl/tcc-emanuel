"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/format";

const base = "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-400 transition outline-none focus:ring-3";
const estado = (erro?: string) => (erro ? "border-brand focus:ring-brand/15" : "border-gray-300 focus:border-navy focus:ring-navy/10");

interface Comum { rotulo?: string; erro?: string; ajuda?: string; obrigatorio?: boolean; icone?: ReactNode }

function Moldura({ id, rotulo, erro, ajuda, obrigatorio, children }: Comum & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {rotulo && (
        <label htmlFor={id} className="text-sm font-semibold text-navy">
          {rotulo} {obrigatorio && <span className="text-brand" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="flex items-center gap-1 text-xs font-medium text-brand" role="alert">
          <CircleAlert className="size-3.5" aria-hidden /> {erro}
        </p>
      ) : ajuda ? <p className="text-xs text-cinza">{ajuda}</p> : null}
    </div>
  );
}

export function Input({ rotulo, erro, ajuda, obrigatorio, icone, className, ...props }: Comum & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} ajuda={ajuda} obrigatorio={obrigatorio}>
      <div className="relative">
        {icone && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cinza [&>svg]:size-4">{icone}</span>}
        <input id={id} aria-invalid={!!erro} aria-describedby={erro ? `${id}-erro` : undefined}
          className={cn(base, estado(erro), !!icone && "pl-9", className)} {...props} />
      </div>
    </Moldura>
  );
}

export function Select({ rotulo, erro, ajuda, obrigatorio, opcoes, vazio, className, ...props }:
  Comum & SelectHTMLAttributes<HTMLSelectElement> & { opcoes: (string | { valor: string; texto: string })[]; vazio?: string }) {
  const id = useId();
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} ajuda={ajuda} obrigatorio={obrigatorio}>
      <select id={id} aria-invalid={!!erro} className={cn(base, estado(erro), "appearance-auto", className)} {...props}>
        {vazio !== undefined && <option value="">{vazio}</option>}
        {opcoes.map((o) => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.valor} value={o.valor}>{o.texto}</option>)}
      </select>
    </Moldura>
  );
}

export function Textarea({ rotulo, erro, ajuda, obrigatorio, className, ...props }: Comum & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} ajuda={ajuda} obrigatorio={obrigatorio}>
      <textarea id={id} aria-invalid={!!erro} className={cn(base, estado(erro), "min-h-24 resize-y", className)} {...props} />
    </Moldura>
  );
}

export function Checkbox({ rotulo, erro, ...props }: { rotulo: ReactNode; erro?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-start gap-2.5 text-sm text-navy cursor-pointer">
        <input id={id} type="checkbox" className="mt-0.5 size-4 accent-brand shrink-0" {...props} />
        <span>{rotulo}</span>
      </label>
      {erro && <p className="flex items-center gap-1 text-xs font-medium text-brand" role="alert"><CircleAlert className="size-3.5" /> {erro}</p>}
    </div>
  );
}
