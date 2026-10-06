"use client";

import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import type { Usuario } from "@/types";
import { useAsync } from "@/hooks/useAsync";
import { anuncios, avaliacoes, consulta, usuarios } from "@/services/api";
import { tempoAtras } from "@/lib/format";
import { Avatar, Badge, Card, Estrelas, SecaoTitulo } from "@/components/ui/Misc";
import { EstadoErro, EstadoVazio, Skeleton } from "@/components/ui/States";
import { AdCard, AdGrid, AdGridSkeleton } from "@/components/anuncios/AdCard";

/** Cabeçalho, números, anúncios e avaliações de um usuário (usado no meu perfil e no perfil público) */
export function ProfileView({ usuario, acoes, extra }: { usuario: Usuario; acoes?: ReactNode; extra?: ReactNode }) {
  const lista = useAsync(() => anuncios.doUsuario(usuario.id), [usuario.id]);
  const notas = useAsync(() => avaliacoes.doUsuario(usuario.id), [usuario.id], { aoVivo: true });
  const rep = usuarios.reputacao(usuario.id);
  const ativos = (lista.data ?? []).filter((a) => a.status === "ativo");

  return (
    <>
      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar nome={usuario.nome} tamanho={88} />
        <div className="flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl">{usuario.nome} {usuario.loja && <Badge>Loja</Badge>}{usuario.admin && <Badge cor="escuro">Equipe</Badge>}</h1>
          <Estrelas media={rep.media} total={rep.total} />
          <p className="mt-1 flex items-center gap-1 text-sm text-cinza"><MapPin className="size-3.5" /> {usuario.cidade} - {usuario.uf} · membro desde {new Date(usuario.criadoEm).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
          {usuario.bio && <p className="mt-2 text-sm">{usuario.bio}</p>}
        </div>
        {acoes && <div className="flex flex-col gap-2">{acoes}</div>}
      </Card>

      <div className="my-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {[{ n: ativos.length, t: "anúncios ativos" }, { n: (lista.data ?? []).filter((a) => a.status === "vendido").length, t: "vendidos" }, { n: rep.total ? rep.media.toFixed(1) : "—", t: "reputação" }].map(({ n, t }) => (
          <div key={t} className="rounded-2xl bg-cinza-claro p-5">{lista.loading ? <Skeleton className="h-8 w-10" /> : <p className="font-display text-3xl font-extrabold">{n}</p>}<p className="text-sm text-cinza">{t}</p></div>
        ))}
      </div>

      {extra}

      <SecaoTitulo titulo="Anúncios" />
      {lista.loading ? <AdGridSkeleton quantidade={4} /> : lista.error ? <EstadoErro mensagem={lista.error} aoTentarDeNovo={lista.recarregar} />
        : ativos.length ? <AdGrid>{ativos.map((a) => <AdCard key={a.id} anuncio={a} />)}</AdGrid> : <EstadoVazio titulo="Nenhum anúncio ativo" className="py-8" />}

      <SecaoTitulo titulo="Avaliações" />
      {notas.loading ? <Skeleton className="h-28 w-full rounded-2xl" /> : notas.error ? <EstadoErro mensagem={notas.error} aoTentarDeNovo={notas.recarregar} />
        : !notas.data?.length ? <EstadoVazio titulo="Ainda não há avaliações" className="py-8" />
        : (
          <div className="grid gap-3 md:grid-cols-2">
            {notas.data.map((r) => {
              const de = consulta.usuario(r.deId);
              return (
                <Card key={r.id} className="flex gap-3 p-4">
                  <Avatar nome={de?.nome} tamanho={36} />
                  <div><p className="text-sm font-semibold">{de?.nome ?? "Usuário"}</p><div className="flex items-center gap-2"><Estrelas media={r.nota} /><span className="text-xs text-cinza">{tempoAtras(r.criadoEm)}</span></div>
                    {r.comentario && <p className="mt-1 text-sm">{r.comentario}</p>}</div>
                </Card>
              );
            })}
          </div>
        )}
    </>
  );
}
