import type { Anuncio } from "@/types";
import { cn } from "@/lib/format";
import { CarIllustration } from "./CarIllustration";

/** Mostra a foto do anúncio ou, se não houver, a ilustração do carro */
export function AdImage({ anuncio, indice = 0, className }: { anuncio: Pick<Anuncio, "fotos" | "cor" | "carroceria" | "marca" | "modelo">; indice?: number; className?: string }) {
  const foto = anuncio.fotos[indice];
  return (
    <div className={cn("grid place-items-center overflow-hidden bg-cinza-claro", className)}>
      {foto
        // eslint-disable-next-line @next/next/no-img-element -- fotos enviadas pelo usuário (data URL)
        ? <img src={foto} alt={`${anuncio.marca} ${anuncio.modelo}`} className="size-full object-cover" />
        : <CarIllustration cor={anuncio.cor} carroceria={anuncio.carroceria} className="w-[88%]" />}
    </div>
  );
}
