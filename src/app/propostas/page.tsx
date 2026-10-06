import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/ui/States";
import { ListaPropostas } from "./ListaPropostas";

export const metadata: Metadata = { title: "Propostas" };

export default function PaginaPropostas() {
  return <Suspense fallback={<Carregando />}><ListaPropostas /></Suspense>;
}
