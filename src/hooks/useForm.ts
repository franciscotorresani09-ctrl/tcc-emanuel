"use client";

import { useState } from "react";
import { validar, type Regra, type Valores } from "@/lib/validators";

/**
 * Controla um formulário: valores, máscaras, erros por campo e envio.
 * - Os erros aparecem quando o campo perde o foco ou quando tenta enviar.
 * - `campo("nome")` devolve as props prontas para os componentes de formulário.
 */
export function useForm<V extends Valores>(
  iniciais: V,
  regras: Partial<Record<keyof V, Regra[]>>,
  mascaras: Partial<Record<keyof V, (v: string) => string>> = {},
) {
  const [valores, setValores] = useState<V>(iniciais);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);

  const validarTudo = (v: V) => validar(v, regras as Record<string, Regra[]>);

  function mudar(nome: keyof V, valor: string | boolean) {
    const m = mascaras[nome];
    const final = typeof valor === "string" && m ? m(valor) : valor;
    setValores((atual) => {
      const novo = { ...atual, [nome]: final } as V;
      if (tocados[nome as string]) setErros(validarTudo(novo));
      return novo;
    });
  }

  function campo(nome: keyof V) {
    const n = nome as string;
    return {
      name: n,
      value: valores[nome] as string,
      erro: tocados[n] ? erros[n] : undefined,
      onChange: (e: { target: { value: string } }) => mudar(nome, e.target.value),
      onBlur: () => { setTocados((t) => ({ ...t, [n]: true })); setErros(validarTudo(valores)); },
    };
  }

  function caixa(nome: keyof V) {
    const n = nome as string;
    return {
      name: n,
      checked: Boolean(valores[nome]),
      erro: tocados[n] ? erros[n] : undefined,
      onChange: (e: { target: { checked: boolean } }) => { setTocados((t) => ({ ...t, [n]: true })); mudar(nome, e.target.checked); },
    };
  }

  /** Valida tudo e, se estiver certo, executa `acao` mostrando o estado de envio */
  const enviar = (acao: (v: V) => Promise<void> | void) => async (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    const encontrados = validarTudo(valores);
    setErros(encontrados);
    setTocados(Object.fromEntries(Object.keys(regras).map((k) => [k, true])));
    if (Object.keys(encontrados).length) return false;
    setEnviando(true);
    try { await acao(valores); return true; } finally { setEnviando(false); }
  };

  return { valores, setValores, mudar, campo, caixa, erros, enviar, enviando };
}
