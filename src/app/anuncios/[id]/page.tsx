"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Check, Eye, Flag, Heart, MapPin, MessageCircle, Pause, Pencil, Play, Shield, Tag, Trash2, Zap } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { anuncios, chat, consulta, usuarios } from "@/services/api";
import { cn, formatarData, formatarKm, formatarPreco, tempoAtras } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Avatar, Badge, Card, Container, Estrelas } from "@/components/ui/Misc";
import { ConfirmModal } from "@/components/ui/Modal";
import { EstadoErro, Skeleton } from "@/components/ui/States";
import { AdImage } from "@/components/anuncios/AdImage";
import { ProposalModal, TradeModal } from "@/components/anuncios/ProposalModals";
import { ReportModal } from "@/components/usuarios/ActionModals";

type Janela = null | "proposta" | "troca" | "denuncia" | "excluir" | "vendido";

export default function PaginaAnuncio() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const { data: a, error, loading, recarregar, setData } = useAsync(() => anuncios.buscar(id), [id]);
  const [foto, setFoto] = useState(0);
  const [janela, setJanela] = useState<Janela>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => { if (a && usuario?.id !== a.userId) anuncios.registrarVisualizacao(a.id); }, [a?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (a) document.title = `${a.marca} ${a.modelo} ${a.ano} · StreetCar`; }, [a]);

  if (loading) return (
    <Container>
      <div className="grid gap-6 lg:grid-cols-[1fr_370px]">
        <div className="space-y-5"><Skeleton className="aspect-video w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
        <div className="space-y-5"><Skeleton className="h-64 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>
      </div>
    </Container>
  );
  if (error || !a) return <Container><EstadoErro mensagem={error ?? "Anúncio não encontrado."} aoTentarDeNovo={recarregar} /></Container>;

  const dono = usuario?.id === a.userId;
  const vendedor = consulta.usuario(a.userId);
  const rep = usuarios.reputacao(a.userId);
  const favorito = !!usuario?.favoritos.includes(a.id);
  const meusCarros = usuario ? consulta.usuarioTemAnuncios(usuario.id).filter((x) => x.id !== a.id) : [];

  const exigir = (j: Janela) => { if (!usuario) return router.push(`/login?volta=/anuncios/${a.id}`); setJanela(j); };
  async function acao(fn: () => Promise<unknown>, msg: string) {
    setOcupado(true);
    try { await fn(); mostrar(msg); } catch (e) { mostrar((e as Error).message, "erro"); } finally { setOcupado(false); setJanela(null); }
  }
  async function conversar() {
    if (!usuario) return router.push(`/login?volta=/anuncios/${a!.id}`);
    try { const c = await chat.abrirConversa(usuario.id, a!.userId, a!.id); router.push(`/chat?c=${c.id}`); } catch (e) { mostrar((e as Error).message, "erro"); }
  }

  const ficha = [
    ["Ano", a.ano], ["Quilometragem", formatarKm(a.km)], ["Câmbio", a.cambio], ["Combustível", a.combustivel],
    ["Carroceria", a.carroceria], ["Final da placa", a.placa ? a.placa.slice(-1) : "—"], ["Localização", `${a.cidade} - ${a.uf}`], ["Aceita troca", a.aceitaTroca ? "Sim" : "Não"],
  ];

  return (
    <Container>
      <nav className="mb-4 text-sm text-cinza" aria-label="Você está em">
        <Link href="/comprar" className="hover:text-brand">Veículos</Link> / <Link href={`/comprar?marca=${a.marca}`} className="hover:text-brand">{a.marca}</Link> / {a.modelo}
      </nav>
      {a.status !== "ativo" && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-brand-dark">{a.status === "vendido" ? "Este veículo já foi vendido." : "Este anúncio está pausado."}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_370px]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <AdImage anuncio={a} indice={foto} className="aspect-video" />
            {a.fotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {a.fotos.map((f, i) => (
                  <button key={i} onClick={() => setFoto(i)} className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2", i === foto ? "border-brand" : "border-transparent")} aria-label={`Foto ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="mb-2 text-lg">Ficha técnica</h2>
            <dl className="grid sm:grid-cols-2 sm:gap-x-6">
              {ficha.map(([k, v]) => (
                <div key={String(k)} className="border-b border-linha py-3"><dt className="text-xs uppercase tracking-wider text-cinza">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
            </dl>
          </Card>
          <Card className="p-6">
            <h2 className="mb-2 text-lg">Descrição</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed">{a.descricao || <span className="text-cinza">Sem descrição.</span>}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-cinza"><Eye className="size-3.5" /> {a.views} visualizações · publicado {tempoAtras(a.criadoEm)}</p>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-6">
            {a.destaque && <Badge cor="vermelho"><Zap className="size-3" /> Destaque</Badge>}
            <h1 className="mt-2 text-2xl">{a.marca} {a.modelo}</h1>
            <p className="text-cinza">{a.versao}</p>
            <p className="my-4 font-display text-4xl font-extrabold">{formatarPreco(a.preco)}</p>
            {dono ? (
              <div className="flex flex-col gap-2">
                <Button href={`/anuncios/${a.id}/editar`} icone={<Pencil className="size-4" />}>Editar anúncio</Button>
                <Button href="/propostas" variante="secundario" icone={<Tag className="size-4" />}>Ver propostas</Button>
                {a.status === "ativo" && !a.destaque && <Button variante="escuro" carregando={ocupado} icone={<Zap className="size-4" />}
                  onClick={() => acao(async () => { await anuncios.destacar(a.id); setData({ ...a, destaque: true }); }, "Anúncio destacado! (pagamento simulado)")}>Destacar anúncio</Button>}
                {a.status !== "vendido" && <>
                  <Button variante="secundario" icone={a.status === "ativo" ? <Pause className="size-4" /> : <Play className="size-4" />}
                    onClick={() => acao(async () => { const s = a.status === "ativo" ? "pausado" : "ativo"; await anuncios.mudarStatus(a.id, s); setData({ ...a, status: s }); }, a.status === "ativo" ? "Anúncio pausado." : "Anúncio reativado.")}>
                    {a.status === "ativo" ? "Pausar anúncio" : "Reativar anúncio"}</Button>
                  <Button variante="secundario" icone={<Check className="size-4" />} onClick={() => setJanela("vendido")}>Marcar como vendido</Button>
                </>}
                <Button variante="perigo" icone={<Trash2 className="size-4" />} onClick={() => setJanela("excluir")}>Excluir</Button>
              </div>
            ) : a.status === "ativo" ? (
              <div className="flex flex-col gap-2">
                <Button onClick={conversar} icone={<MessageCircle className="size-4" />} tamanho="lg">Conversar com o vendedor</Button>
                <Button variante="secundario" onClick={() => exigir("proposta")} icone={<Tag className="size-4" />}>Fazer proposta</Button>
                {a.aceitaTroca && <Button variante="secundario" onClick={() => exigir("troca")} icone={<ArrowLeftRight className="size-4" />}>Propor troca</Button>}
                <Button variante="secundario" tamanho="sm" icone={<Heart className={cn("size-4", favorito && "fill-brand text-brand")} />}
                  onClick={() => { if (!usuario) return router.push("/login"); const r = usuarios.alternarFavorito(usuario.id, a.id); mostrar(r ? "Adicionado aos favoritos." : "Removido dos favoritos."); }}>
                  {favorito ? "Favoritado" : "Favoritar"}</Button>
              </div>
            ) : null}
          </Card>
          {vendedor && (
            <Card className="p-6">
              <Link href={`/usuarios/${vendedor.id}`} className="flex items-center gap-3">
                <Avatar nome={vendedor.nome} tamanho={52} />
                <div><p className="font-semibold">{vendedor.nome} {vendedor.loja && <Badge>Loja</Badge>}</p><Estrelas media={rep.media} total={rep.total} /></div>
              </Link>
              <p className="mt-3 flex items-center gap-1 text-sm text-cinza"><MapPin className="size-3.5" /> {vendedor.cidade} - {vendedor.uf} · desde {formatarData(vendedor.criadoEm).slice(-4)}</p>
            </Card>
          )}
          <Card className="border-0 bg-cinza-claro p-6">
            <h3 className="flex items-center gap-2"><Shield className="size-4 text-brand" /> Negocie com segurança</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-cinza">
              <li>Nunca pague antes de ver o veículo.</li>
              <li>Confira a documentação e faça vistoria.</li>
              <li>Prefira encontros em locais públicos.</li>
            </ul>
            {!dono && <button onClick={() => exigir("denuncia")} className="mt-3 inline-flex items-center gap-1.5 text-sm text-cinza hover:text-brand"><Flag className="size-3.5" /> Denunciar anúncio</button>}
          </Card>
        </aside>
      </div>

      {usuario && <>
        {janela === "proposta" && <ProposalModal anuncio={a} usuarioId={usuario.id} aberto aoFechar={() => setJanela(null)} />}
        {janela === "troca" && <TradeModal anuncio={a} usuarioId={usuario.id} meusAnuncios={meusCarros} aberto aoFechar={() => setJanela(null)} />}
        {janela === "denuncia" && <ReportModal tipo="anúncio" alvoId={a.id} usuarioId={usuario.id} aberto aoFechar={() => setJanela(null)} />}
      </>}
      <ConfirmModal aberto={janela === "excluir"} aoFechar={() => setJanela(null)} titulo="Excluir anúncio" texto="Tem certeza? Essa ação não pode ser desfeita." botao="Excluir" carregando={ocupado}
        aoConfirmar={() => acao(async () => { await anuncios.excluir(a.id); router.push("/meus-anuncios"); }, "Anúncio excluído.")} />
      <ConfirmModal aberto={janela === "vendido"} aoFechar={() => setJanela(null)} titulo="Marcar como vendido" texto="O anúncio deixará de aparecer nas buscas." botao="Marcar como vendido" carregando={ocupado}
        aoConfirmar={() => acao(async () => { await anuncios.mudarStatus(a.id, "vendido"); setData({ ...a, status: "vendido" }); }, "Parabéns pela venda!")} />
    </Container>
  );
}
