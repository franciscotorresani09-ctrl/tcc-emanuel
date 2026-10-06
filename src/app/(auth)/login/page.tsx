import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/ui/States";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaLogin() {
  return <Suspense fallback={<Carregando />}><FormLogin /></Suspense>;
}
