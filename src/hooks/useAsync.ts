"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { aoMudar, versaoDosDados } from "@/services/api";

interface Estado<T> { pedido: string | null; data: T | null; error: string | null }

const mensagem = (e: unknown) => (e instanceof Error ? e.message : "Erro inesperado.");

/**
 * Executa uma função assíncrona (chamada à API) e controla os estados visuais:
 * carregando → sucesso (data) ou erro (error). `recarregar` tenta de novo.
 * - `deps`: quando mudam, busca de novo (ex.: filtros).
 * - `aoVivo`: busca de novo em silêncio quando os dados mudam (ex.: chat).
 * - `ativo`: só busca quando for true (ex.: depois de confirmar o login).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], { aoVivo = false, ativo = true } = {}) {
  const [estado, setEstado] = useState<Estado<T>>({ pedido: null, data: null, error: null });
  const [tentativa, setTentativa] = useState(0);
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  // identifica a busca atual: muda quando as dependências mudam ou ao tentar de novo
  const pedido = `${JSON.stringify(deps)}#${tentativa}`;

  useEffect(() => {
    if (!ativo) return;
    let valido = true;
    fnRef.current().then(
      (data) => { if (valido) setEstado({ pedido, data, error: null }); },
      (e) => { if (valido) setEstado({ pedido, data: null, error: mensagem(e) }); },
    );
    return () => { valido = false; };
  }, [pedido, ativo]);

  useEffect(() => {
    if (!aoVivo || !ativo) return;
    return aoMudar(() => {
      fnRef.current().then((data) => setEstado((s) => (s.pedido ? { ...s, data, error: null } : s)), () => { /* mantém o que já está na tela */ });
    });
  }, [aoVivo, ativo]);

  // está carregando enquanto o resultado guardado não é o da busca atual
  const loading = ativo && estado.pedido !== pedido;
  return {
    data: loading ? null : estado.data,
    error: loading ? null : estado.error,
    loading,
    recarregar: () => setTentativa((n) => n + 1),
    setData: (data: T) => setEstado((s) => ({ ...s, data })),
  };
}

/** Re-renderiza o componente quando qualquer dado da API muda (contadores do cabeçalho) */
export function useDadosAoVivo() {
  return useSyncExternalStore(aoMudar, versaoDosDados, () => -1);
}
