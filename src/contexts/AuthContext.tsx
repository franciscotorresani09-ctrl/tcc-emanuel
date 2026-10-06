"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { aoMudar, auth, versaoDosDados } from "@/services/api";
import type { Usuario } from "@/types";

interface ContextoAuth {
  usuario: Usuario | null;
  carregando: boolean;
  sair: () => void;
}

const Contexto = createContext<ContextoAuth | null>(null);

/** Guarda quem está logado e avisa toda a aplicação quando muda */
export function AuthProvider({ children }: { children: ReactNode }) {
  // -1 no servidor: ainda não sabemos quem está logado (a sessão fica no navegador)
  const versao = useSyncExternalStore(aoMudar, versaoDosDados, () => -1);
  const valor = useMemo<ContextoAuth>(() => ({
    usuario: versao < 0 ? null : auth.usuarioLogado(),
    carregando: versao < 0,
    sair: auth.sair,
  }), [versao]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useAuth precisa estar dentro do AuthProvider");
  return c;
}
