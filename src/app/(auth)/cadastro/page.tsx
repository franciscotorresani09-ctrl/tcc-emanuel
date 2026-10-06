import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/ui/States";
import { FormCadastro } from "./FormCadastro";

export const metadata: Metadata = { title: "Criar conta" };

export default function PaginaCadastro() {
  return <Suspense fallback={<Carregando />}><FormCadastro /></Suspense>;
}
