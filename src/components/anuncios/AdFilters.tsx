"use client";

import type { FiltrosBusca } from "@/types";
import { CAMBIOS, CARROCERIAS, COMBUSTIVEIS, MARCAS, UFS } from "@/lib/constants";
import { Checkbox, Input, Select } from "@/components/ui/FormFields";
import { mascaraMoeda, paraNumero } from "@/lib/masks";

const anos = Array.from({ length: 2027 - 1960 }, (_, i) => String(2026 - i));

/** Painel lateral de filtros da busca */
export function AdFilters({ filtros, aoMudar, esconderTroca }: { filtros: FiltrosBusca; aoMudar: (f: FiltrosBusca) => void; esconderTroca?: boolean }) {
  const set = (k: keyof FiltrosBusca, v: string | boolean) => aoMudar({ ...filtros, [k]: v || undefined });
  return (
    <div className="flex flex-col gap-4">
      <Input rotulo="Palavra-chave" placeholder="Marca, modelo, versão..." value={filtros.q ?? ""} onChange={(e) => set("q", e.target.value)} />
      <Select rotulo="Marca" vazio="Todas" opcoes={MARCAS} value={filtros.marca ?? ""} onChange={(e) => set("marca", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Select rotulo="Ano de" vazio="Mín." opcoes={[...anos].reverse()} value={filtros.anoMin ?? ""} onChange={(e) => set("anoMin", e.target.value)} />
        <Select rotulo="até" vazio="Máx." opcoes={anos} value={filtros.anoMax ?? ""} onChange={(e) => set("anoMax", e.target.value)} />
      </div>
      <Input rotulo="Preço até" placeholder="R$" inputMode="numeric" value={filtros.precoMax ? mascaraMoeda(filtros.precoMax) : ""}
        onChange={(e) => set("precoMax", paraNumero(e.target.value) ? String(paraNumero(e.target.value)) : "")} />
      <Select rotulo="Quilometragem até" vazio="Qualquer" value={filtros.kmMax ?? ""} onChange={(e) => set("kmMax", e.target.value)}
        opcoes={[20000, 50000, 80000, 100000, 150000].map((v) => ({ valor: String(v), texto: `${v.toLocaleString("pt-BR")} km` }))} />
      <Select rotulo="Estado" vazio="Todos" opcoes={UFS} value={filtros.uf ?? ""} onChange={(e) => set("uf", e.target.value)} />
      <Select rotulo="Carroceria" vazio="Todas" opcoes={CARROCERIAS} value={filtros.carroceria ?? ""} onChange={(e) => set("carroceria", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Select rotulo="Câmbio" vazio="Todos" opcoes={CAMBIOS} value={filtros.cambio ?? ""} onChange={(e) => set("cambio", e.target.value)} />
        <Select rotulo="Combustível" vazio="Todos" opcoes={COMBUSTIVEIS} value={filtros.combustivel ?? ""} onChange={(e) => set("combustivel", e.target.value)} />
      </div>
      {!esconderTroca && <Checkbox rotulo="Aceita troca" checked={!!filtros.troca} onChange={(e) => set("troca", e.target.checked)} />}
    </div>
  );
}

/** Lê e escreve os filtros na URL (?marca=Honda&precoMax=60000) */
export function filtrosDaUrl(p: URLSearchParams): FiltrosBusca {
  const f: FiltrosBusca = {};
  (["q", "marca", "anoMin", "anoMax", "precoMax", "kmMax", "uf", "carroceria", "cambio", "combustivel"] as const).forEach((k) => { const v = p.get(k); if (v) f[k] = v; });
  if (p.get("troca") === "1") f.troca = true;
  const o = p.get("ordem");
  if (o) f.ordem = o as FiltrosBusca["ordem"];
  return f;
}

export function filtrosParaUrl(f: FiltrosBusca) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v === true) p.set(k, "1"); else if (v) p.set(k, String(v)); });
  return p.toString();
}
