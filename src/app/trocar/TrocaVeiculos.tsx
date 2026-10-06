"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Plus, SlidersHorizontal } from "lucide-react";
import type { Anuncio, FiltrosBusca } from "@/types";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/contexts/AuthContext";
import { anuncios } from "@/services/api";
import { cn, formatarPreco } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormFields";
import { Container } from "@/components/ui/Misc";
import { EstadoErro, EstadoVazio } from "@/components/ui/States";
import { AdCard, AdGrid, AdGridSkeleton } from "@/components/anuncios/AdCard";
import { AdFilters, filtrosDaUrl } from "@/components/anuncios/AdFilters";
import { TradeModal } from "@/components/anuncios/ProposalModals";

/** Tela Trocar: só carros que aceitam troca, com a diferença em relação ao carro do usuário */
export function TrocaVeiculos() {
  const params = useSearchParams();
  const router = useRouter();
  const { usuario } = useAuth();
  const [filtros, setFiltros] = useState<FiltrosBusca>(() => ({ ...filtrosDaUrl(params), troca: true }));
  const [aplicados, setAplicados] = useState(filtros);
  const [painel, setPainel] = useState(false);
  const [meuCarro, setMeuCarro] = useState("");
  const [proposta, setProposta] = useState<Anuncio | null>(null);
  useEffect(() => { const t = setTimeout(() => setAplicados(filtros), 350); return () => clearTimeout(t); }, [filtros]);

  const lista = useAsync(() => anuncios.listar(aplicados), [JSON.stringify(aplicados)]);
  const meus = useAsync(() => anuncios.doUsuario(usuario!.id), [usuario?.id], { ativo: !!usuario });
  const meusAtivos = meus.data?.filter((a) => a.status === "ativo") ?? [];
  const carro = meusAtivos.find((a) => a.id === meuCarro) ?? meusAtivos[0];

  const semOsMeus = (lista.data ?? []).filter((a) => a.userId !== usuario?.id);
  const resultados = carro ? [...semOsMeus].sort((a, b) => Number(b.destaque) - Number(a.destaque) || Math.abs(a.preco - carro.preco) - Math.abs(b.preco - carro.preco)) : semOsMeus;

  return (
    <Container>
      <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr]">
        <aside className={`${painel ? "block" : "hidden"} rounded-2xl bg-cinza-claro p-5 lg:sticky lg:top-24 lg:block`}>
          <h2 className="mb-4 text-lg">Filtros</h2>
          <AdFilters filtros={filtros} aoMudar={(f) => setFiltros({ ...f, troca: true })} esconderTroca />
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl">Veículos para troca</h1>
              <p className="text-sm text-cinza">{lista.loading ? "Buscando..." : `${resultados.length} veículo${resultados.length !== 1 ? "s aceitam" : " aceita"} troca`}</p>
            </div>
            <Button variante="secundario" tamanho="sm" className="lg:hidden" onClick={() => setPainel((v) => !v)} icone={<SlidersHorizontal className="size-4" />}>Filtros</Button>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-l-4 border-brand bg-navy p-5 text-white">
            <div className="min-w-60 flex-1">
              <h2 className="flex items-center gap-2 text-lg"><ArrowLeftRight className="size-5 text-brand" /> Qual carro você vai dar na troca?</h2>
              <p className="text-sm text-slate-300">Mostramos quanto você completa ou recebe em cada negócio.</p>
            </div>
            {!usuario ? <Button href="/login?volta=/trocar">Entrar para trocar</Button>
              : meus.loading ? <p className="text-sm text-slate-300">Carregando seus carros...</p>
              : meusAtivos.length ? (
                <Select aria-label="Seu carro" className="min-w-64" value={carro?.id} onChange={(e) => setMeuCarro(e.target.value)}
                  opcoes={meusAtivos.map((a) => ({ valor: a.id, texto: `${a.marca} ${a.modelo} ${a.ano} — ${formatarPreco(a.preco)}` }))} />
              ) : <Button href="/anunciar" icone={<Plus className="size-4" />}>Anunciar meu carro</Button>}
          </div>

          {lista.loading ? <AdGridSkeleton quantidade={6} />
            : lista.error ? <EstadoErro mensagem={lista.error} aoTentarDeNovo={lista.recarregar} />
            : !resultados.length ? <EstadoVazio icone={<ArrowLeftRight />} titulo="Nenhum veículo para troca" texto="Tente mudar os filtros." />
            : (
              <AdGrid>
                {resultados.map((a) => {
                  const dif = carro ? a.preco - carro.preco : null;
                  return (
                    <AdCard key={a.id} anuncio={a} rodape={
                      <div className="mt-3 flex flex-col gap-2">
                        {dif !== null && (
                          <p className="rounded-lg bg-cinza-claro px-3 py-2 text-center text-sm">
                            {dif > 0 ? <>Você completa <b>{formatarPreco(dif)}</b></> : dif < 0 ? <>Você recebe <b className="text-brand">{formatarPreco(-dif)}</b></> : <b>Troca direta</b>}
                          </p>
                        )}
                        <Button tamanho="sm" bloco icone={<ArrowLeftRight className="size-4" />} className={cn(!usuario && "opacity-90")}
                          onClick={() => (usuario ? setProposta(a) : router.push("/login?volta=/trocar"))}>Propor troca</Button>
                      </div>
                    } />
                  );
                })}
              </AdGrid>
            )}
        </section>
      </div>
      {proposta && usuario && (
        <TradeModal anuncio={proposta} usuarioId={usuario.id} meusAnuncios={meusAtivos} carroInicial={carro?.id} aberto aoFechar={() => setProposta(null)} />
      )}
    </Container>
  );
}
