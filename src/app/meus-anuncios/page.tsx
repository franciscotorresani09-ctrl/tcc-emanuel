"use client";

import Link from "next/link";
import { Car, Eye, Plus, Tag } from "lucide-react";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useAsync } from "@/hooks/useAsync";
import { anuncios, propostas } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Container, PageHeader } from "@/components/ui/Misc";
import { Carregando, EstadoErro, EstadoVazio, Skeleton } from "@/components/ui/States";
import { AdCard, AdGrid, AdGridSkeleton } from "@/components/anuncios/AdCard";

export default function PaginaMeusAnuncios() {
  const { usuario, pronto } = useExigirLogin();
  const lista = useAsync(() => anuncios.doUsuario(usuario!.id), [usuario?.id], { ativo: pronto });
  const recebidas = useAsync(() => propostas.listar(usuario!.id, "recebidas"), [usuario?.id], { ativo: pronto });
  if (!pronto) return <Carregando />;

  const meus = lista.data ?? [];
  const pendentes = (recebidas.data ?? []).filter((p) => p.status === "pendente");
  const numeros = [
    { n: meus.filter((a) => a.status === "ativo").length, t: "ativos" },
    { n: meus.filter((a) => a.status === "vendido").length, t: "vendidos" },
    { n: meus.reduce((s, a) => s + a.views, 0), t: "visualizações" },
    { n: pendentes.length, t: "propostas pendentes" },
  ];

  return (
    <Container>
      <PageHeader titulo="Meus anúncios" acao={<Button href="/anunciar" icone={<Plus className="size-4" />}>Novo anúncio</Button>} />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {numeros.map(({ n, t }) => (
          <div key={t} className="rounded-2xl bg-cinza-claro p-5">
            {lista.loading ? <Skeleton className="h-8 w-12" /> : <p className="font-display text-3xl font-extrabold">{n}</p>}
            <p className="text-sm text-cinza">{t}</p>
          </div>
        ))}
      </div>
      {lista.loading ? <AdGridSkeleton quantidade={4} />
        : lista.error ? <EstadoErro mensagem={lista.error} aoTentarDeNovo={lista.recarregar} />
        : !meus.length ? <EstadoVazio icone={<Car />} titulo="Você ainda não tem anúncios" texto="Anuncie seu veículo gratuitamente." acao={<Button href="/anunciar">Anunciar agora</Button>} />
        : (
          <AdGrid>
            {meus.map((a) => (
              <AdCard key={a.id} anuncio={a} semComparar rodape={
                <div className="mt-3 flex items-center justify-between text-xs text-cinza">
                  <span className="inline-flex items-center gap-3"><span className="inline-flex items-center gap-1"><Eye className="size-3.5" />{a.views}</span>
                    <span className="inline-flex items-center gap-1"><Tag className="size-3.5" />{pendentes.filter((p) => p.anuncioId === a.id).length}</span></span>
                  <Link href={`/anuncios/${a.id}/editar`} className="font-semibold text-brand hover:underline">Editar</Link>
                </div>
              } />
            ))}
          </AdGrid>
        )}
    </Container>
  );
}
