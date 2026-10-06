"use client";

import { useSyncExternalStore } from "react";

const CHAVE = "streetcar_next_comparar";
const VAZIA: string[] = [];
const ouvintes = new Set<() => void>();
let cacheTexto = "";
let cacheLista: string[] = VAZIA;

/** Lê a lista do navegador, devolvendo o mesmo array enquanto não mudar */
function ler(): string[] {
  const texto = localStorage.getItem(CHAVE) || "[]";
  if (texto !== cacheTexto) {
    cacheTexto = texto;
    try { cacheLista = JSON.parse(texto); } catch { cacheLista = VAZIA; }
  }
  return cacheLista;
}

function inscrever(f: () => void) {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

function gravar(nova: string[]) {
  localStorage.setItem(CHAVE, JSON.stringify(nova));
  ouvintes.forEach((f) => f());
}

/** Lista de até 3 anúncios marcados para comparar (compartilhada entre os componentes) */
export function useComparar() {
  const lista = useSyncExternalStore(inscrever, ler, () => VAZIA);

  function alternar(idAnuncio: string): "adicionado" | "removido" | "cheio" {
    const atual = ler();
    if (atual.includes(idAnuncio)) { gravar(atual.filter((x) => x !== idAnuncio)); return "removido"; }
    if (atual.length >= 3) return "cheio";
    gravar([...atual, idAnuncio]);
    return "adicionado";
  }

  return { lista, alternar, limpar: () => gravar([]) };
}
