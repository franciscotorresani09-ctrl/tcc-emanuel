"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeftRight, Check, MessageCircle, Star, Tag, X } from "lucide-react";
import type { Proposta, StatusProposta } from "@/types";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/contexts/ToastContext";
import { chat, consulta, propostas } from "@/services/api";
import { formatarPreco, tempoAtras } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Container, PageHeader, Tabs } from "@/components/ui/Misc";
import { Carregando, EstadoErro, EstadoVazio, Skeleton } from "@/components/ui/States";
import { AdImage } from "@/components/anuncios/AdImage";
import { ReviewModal } from "@/components/usuarios/ActionModals";

const rotuloStatus: Record<StatusProposta, { texto: string; cor: "cinza" | "escuro" | "alerta" }> = {
  pendente: { texto: "Pendente", cor: "alerta" }, aceita: { texto: "Aceita", cor: "escuro" },
  recusada: { texto: "Recusada", cor: "cinza" }, cancelada: { texto: "Cancelada", cor: "cinza" },
};

function descrever(p: Proposta) {
  if (p.tipo === "compra") return <><b>{formatarPreco(p.valor ?? 0)}</b> <span className="text-cinza">em dinheiro</span></>;
  const o = p.anuncioOfertadoId ? consulta.anuncio(p.anuncioOfertadoId) : null;
  const d = p.diferenca ?? 0;
  return <>Oferece {o ? <Link href={`/anuncios/${o.id}`} className="font-semibold underline decoration-linha underline-offset-4">{o.marca} {o.modelo} {o.ano}</Link> : "veículo removido"}
    {d > 0 ? ` + paga ${formatarPreco(d)}` : d < 0 ? ` e quer receber ${formatarPreco(-d)}` : " (troca direta)"}</>;
}

export function ListaPropostas() {
  const { usuario, pronto } = useExigirLogin();
  const router = useRouter();
  const { mostrar } = useToast();
  const aba = useSearchParams().get("aba") === "enviadas" ? "enviadas" : "recebidas";
  const { data, error, loading, recarregar } = useAsync(() => propostas.listar(usuario!.id, aba), [usuario?.id, aba], { ativo: pronto, aoVivo: true });
  const pendentesRecebidas = useAsync(() => propostas.listar(usuario!.id, "recebidas"), [usuario?.id], { ativo: pronto, aoVivo: true });
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [avaliar, setAvaliar] = useState<{ id: string; nome: string } | null>(null);
  if (!pronto || !usuario) return <Carregando />;

  async function mudar(p: Proposta, status: StatusProposta, msg: string) {
    setOcupado(p.id);
    try { await propostas.mudarStatus(p.id, status); mostrar(msg); } catch (e) { mostrar((e as Error).message, "erro"); } finally { setOcupado(null); }
  }
  async function conversar(p: Proposta) {
    const c = await chat.abrirConversa(p.deId, p.paraId, p.anuncioId);
    router.push(`/chat?c=${c.id}`);
  }

  return (
    <Container estreito>
      <PageHeader titulo="Propostas" subtitulo="Negocie seus veículos e acompanhe suas ofertas." />
      <Tabs ativa={aba} abas={[
        { chave: "recebidas", href: "/propostas", texto: "Recebidas", contador: pendentesRecebidas.data?.filter((p) => p.status === "pendente").length },
        { chave: "enviadas", href: "/propostas?aba=enviadas", texto: "Enviadas" },
      ]} />
      {loading ? <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}</div>
        : error ? <EstadoErro mensagem={error} aoTentarDeNovo={recarregar} />
        : !data?.length ? <EstadoVazio icone={<Tag />} titulo={aba === "recebidas" ? "Nenhuma proposta recebida" : "Nenhuma proposta enviada"}
            texto={aba === "recebidas" ? "Quando alguém fizer uma oferta nos seus anúncios, ela aparece aqui." : "Encontre um veículo e faça sua oferta."}
            acao={aba === "enviadas" ? <Button href="/comprar">Buscar veículos</Button> : undefined} />
        : (
          <div className="space-y-4">
            {data.map((p) => {
              const a = consulta.anuncio(p.anuncioId);
              const outro = consulta.usuario(aba === "recebidas" ? p.deId : p.paraId);
              if (!a || !outro) return null;
              const st = rotuloStatus[p.status];
              return (
                <Card key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row">
                  <Link href={`/anuncios/${a.id}`} className="shrink-0"><AdImage anuncio={a} className="aspect-[16/10] w-full rounded-xl sm:w-40" /></Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{p.tipo === "troca" ? <><ArrowLeftRight className="size-3" /> Troca</> : <><Tag className="size-3" /> Compra</>}</Badge>
                      <Badge cor={st.cor}>{st.texto}</Badge>
                      <span className="text-xs text-cinza">{tempoAtras(p.criadoEm)}</span>
                    </div>
                    <h3 className="mt-2"><Link href={`/anuncios/${a.id}`} className="hover:text-brand">{a.marca} {a.modelo} {a.ano}</Link> <span className="text-sm font-normal text-cinza">anunciado por {formatarPreco(a.preco)}</span></h3>
                    <p className="mt-1 text-sm">{descrever(p)}</p>
                    {p.mensagem && <blockquote className="mt-2 rounded-r-lg border-l-3 border-brand bg-cinza-claro px-3 py-2 text-sm">“{p.mensagem}”</blockquote>}
                    <p className="mt-2 text-xs text-cinza">{aba === "recebidas" ? "De" : "Para"}: <Link href={`/usuarios/${outro.id}`} className="font-semibold text-navy hover:underline">{outro.nome}</Link></p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {aba === "recebidas" && p.status === "pendente" && <>
                        <Button tamanho="sm" icone={<Check className="size-4" />} carregando={ocupado === p.id} onClick={() => mudar(p, "aceita", "Proposta aceita! Combine os detalhes pelo chat.")}>Aceitar</Button>
                        <Button tamanho="sm" variante="secundario" icone={<X className="size-4" />} disabled={ocupado === p.id} onClick={() => mudar(p, "recusada", "Proposta recusada.")}>Recusar</Button>
                      </>}
                      {aba === "enviadas" && p.status === "pendente" && <Button tamanho="sm" variante="secundario" carregando={ocupado === p.id} onClick={() => mudar(p, "cancelada", "Proposta cancelada.")}>Cancelar proposta</Button>}
                      <Button tamanho="sm" variante="secundario" icone={<MessageCircle className="size-4" />} onClick={() => conversar(p)}>Conversar</Button>
                      {p.status === "aceita" && <Button tamanho="sm" variante="secundario" icone={<Star className="size-4" />} onClick={() => setAvaliar({ id: outro.id, nome: outro.nome })}>Avaliar {outro.nome.split(" ")[0]}</Button>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      {avaliar && <ReviewModal deId={usuario.id} paraId={avaliar.id} nome={avaliar.nome} aberto aoFechar={() => setAvaliar(null)} />}
    </Container>
  );
}
