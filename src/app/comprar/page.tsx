import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/ui/States";
import { BuscaVeiculos } from "./BuscaVeiculos";

export const metadata: Metadata = { title: "Comprar" };

export default function PaginaComprar() {
  return (
    <Suspense fallback={<Carregando />}>
      <BuscaVeiculos />
    </Suspense>
  );
}
