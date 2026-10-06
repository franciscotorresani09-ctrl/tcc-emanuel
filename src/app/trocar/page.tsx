import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/ui/States";
import { TrocaVeiculos } from "./TrocaVeiculos";

export const metadata: Metadata = { title: "Trocar" };

export default function PaginaTrocar() {
  return <Suspense fallback={<Carregando />}><TrocaVeiculos /></Suspense>;
}
