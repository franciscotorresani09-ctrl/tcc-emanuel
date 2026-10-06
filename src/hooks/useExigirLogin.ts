"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/** Páginas que só funcionam logado: manda para o login e volta depois */
export function useExigirLogin() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const caminho = usePathname();

  useEffect(() => {
    if (!carregando && !usuario) router.replace(`/login?volta=${encodeURIComponent(caminho)}`);
  }, [carregando, usuario, router, caminho]);

  return { usuario, pronto: !carregando && !!usuario };
}
