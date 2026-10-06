"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { FiltrosBusca } from "@/types";
import { useAsync } from "@/hooks/useAsync";
import { anuncios } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormFields";
import { Container } from "@/components/ui/Misc";
import { EstadoErro, EstadoVazio } from "@/components/ui/States";
import { AdCard, AdGrid, AdGridSkeleton } from "@/components/anuncios/AdCard";
import { AdFilters, filtrosDaUrl, filtrosParaUrl } from "@/components/anuncios/AdFilters";
import { CompareBar } from "@/components/anuncios/CompareBar";

export const ORDENS = [
  { valor: "recentes", texto: "Mais recentes" }, { valor: "menorPreco", texto: "Menor preço" },
  { valor: "maiorPreco", texto: "Maior preço" }, { valor: "menorKm", texto: "Menor km" }, { valor: "maisNovo", texto: "Mais novos" },
];

/** Tela Comprar: lista de veículos com filtros sincronizados com a URL */
export function BuscaVeiculos() {
  const router = useRouter();
  const params = useSearchParams();
  const [filtros, setFiltros] = useState<FiltrosBusca>(() => filtrosDaUrl(params));
  const [painel, setPainel] = useState(false);
  // espera o usuário parar de digitar antes de buscar
  const [aplicados, setAplicados] = useState(filtros);
  useEffect(() => {
    const t = setTimeout(() => {
      setAplicados(filtros);
      const qs = filtrosParaUrl(filtros);
      router.replace(`/comprar${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 350);
    return () => clearTimeout(t);
  }, [filtros, router]);

  const { data, error, loading, recarregar } = useAsync(() => anuncios.listar(aplicados), [JSON.stringify(aplicados)]);
  const temFiltro = Object.keys(filtros).some((k) => k !== "ordem");

  return (
    <Container>
      <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr]">
        <aside className={`${painel ? "block" : "hidden"} rounded-2xl bg-cinza-claro p-5 lg:sticky lg:top-24 lg:block`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">Filtros</h2>
            {temFiltro && <button onClick={() => setFiltros({ ordem: filtros.ordem })} className="text-sm font-semibold text-brand hover:underline">Limpar</button>}
          </div>
          <AdFilters filtros={filtros} aoMudar={setFiltros} />
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl">Veículos à venda</h1>
              <p className="text-sm text-cinza" aria-live="polite">{loading ? "Buscando..." : data ? `${data.length} veículo${data.length !== 1 ? "s" : ""} encontrado${data.length !== 1 ? "s" : ""}` : ""}</p>
            </div>
            <div className="flex items-end gap-2">
              <Button variante="secundario" tamanho="sm" className="lg:hidden" onClick={() => setPainel((v) => !v)} icone={painel ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}>Filtros</Button>
              <Select aria-label="Ordenar" opcoes={ORDENS} value={filtros.ordem ?? "recentes"} onChange={(e) => setFiltros({ ...filtros, ordem: e.target.value as FiltrosBusca["ordem"] })} className="w-44" />
            </div>
          </div>
          {loading ? <AdGridSkeleton quantidade={6} />
            : error ? <EstadoErro mensagem={error} aoTentarDeNovo={recarregar} />
            : !data?.length ? <EstadoVazio icone={<Search />} titulo="Nenhum veículo encontrado" texto="Tente ampliar os filtros da sua busca."
                acao={temFiltro ? <Button variante="secundario" onClick={() => setFiltros({})}>Limpar filtros</Button> : undefined} />
            : <AdGrid>{data.map((a) => <AdCard key={a.id} anuncio={a} />)}</AdGrid>}
        </section>
      </div>
      <CompareBar />
    </Container>
  );
}
