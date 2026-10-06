import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/ui/States";
import { Chat } from "./Chat";

export const metadata: Metadata = { title: "Chat" };

export default function PaginaChat() {
  return <Suspense fallback={<Carregando />}><Chat /></Suspense>;
}
