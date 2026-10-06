import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/format";

type Variante = "primario" | "secundario" | "escuro" | "perigo" | "texto";
type Tamanho = "sm" | "md" | "lg";

const variantes: Record<Variante, string> = {
  primario: "bg-brand text-white hover:bg-brand-dark",
  secundario: "bg-white text-navy border border-linha hover:border-navy",
  escuro: "bg-navy text-white hover:bg-navy-700",
  perigo: "bg-white text-brand border border-linha hover:border-brand",
  texto: "text-brand hover:underline px-0! py-0!",
};
const tamanhos: Record<Tamanho, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5 py-3 rounded-xl gap-2",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
  icone?: ReactNode;
  bloco?: boolean;
  href?: string;
}

/** Botão padrão da aplicação. Com `carregando`, mostra um spinner e fica desabilitado. */
export function Button({ variante = "primario", tamanho = "md", carregando, icone, bloco, href, className, children, disabled, ...props }: Props) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
    variantes[variante], tamanhos[tamanho], bloco && "w-full", className,
  );
  const conteudo = (
    <>
      {carregando ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icone}
      {children}
    </>
  );
  if (href) return <Link href={href} className={classes}>{conteudo}</Link>;
  return (
    <button className={classes} disabled={disabled || carregando} aria-busy={carregando} {...props}>
      {conteudo}
    </button>
  );
}
