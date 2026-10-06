"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Clock, ExternalLink, Flag, MapPin, MessageCircle, Share2, X } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { chat, consulta, encontros } from "@/services/api";
import { dataDoEncontro } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Avatar, Badge, Card, Container } from "@/components/ui/Misc";
import { ConfirmModal } from "@/components/ui/Modal";
import { EstadoErro, Skeleton } from "@/components/ui/States";
import { DataEncontro } from "@/components/encontros/EventCard";
import { ReportModal } from "@/components/usuarios/ActionModals";

export default function PaginaEncontro() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const { data: e, error, loading, recarregar, setData } = useAsync(() => encontros.buscar(id), [id]);
  const [ocupado, setOcupado] = useState(false);
  const [janela, setJanela] = useState<null | "cancelar" | "denuncia">(null);

  if (loading) return <Container><Skeleton className="h-40 w-full rounded-2xl" /><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]"><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-56 rounded-2xl" /></div></Container>;
  if (error || !e) return <Container><EstadoErro mensagem={error ?? "Encontro não encontrado."} aoTentarDeNovo={recarregar} /></Container>;

  const d = dataDoEncontro(e.data, e.hora);
  const org = consulta.usuario(e.organizadorId);
  const souOrg = usuario?.id === e.organizadorId;
  const vou = !!usuario && e.confirmados.includes(usuario.id);
  const lotado = !!e.capacidade && e.confirmados.length >= e.capacidade;
  const pct = e.capacidade ? Math.min(100, (e.confirmados.length / e.capacidade) * 100) : 0;

  async function presenca() {
    if (!usuario) return router.push(`/login?volta=/encontros/${e!.id}`);
    setOcupado(true);
    try {
      const foi = await encontros.alternarPresenca(e!.id, usuario.id);
      setData({ ...e!, confirmados: foi ? [...e!.confirmados, usuario.id] : e!.confirmados.filter((x) => x !== usuario.id) });
      mostrar(foi ? "Presença confirmada! Te esperamos lá." : "Presença cancelada.");
    } catch (err) { mostrar((err as Error).message, "erro"); } finally { setOcupado(false); }
  }
  async function compartilhar() {
    try {
      if (navigator.share) await navigator.share({ title: e!.titulo, url: location.href });
      else { await navigator.clipboard.writeText(location.href); mostrar("Link copiado!"); }
    } catch { /* cancelado */ }
  }

  return (
    <Container>
      <nav className="mb-4 text-sm text-cinza"><Link href="/encontros" className="hover:text-brand">Encontros</Link> / {e.titulo}</nav>
      {d.passou && <p className="mb-5 rounded-xl bg-cinza-claro px-4 py-3 text-sm">Este encontro já aconteceu.</p>}
      <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-navy p-6 text-white sm:flex-row sm:items-center">
        <DataEncontro data={e.data} hora={e.hora} grande />
        <div><Badge className="bg-white/15! text-white!">{e.categoria}</Badge><h1 className="mt-2 text-2xl sm:text-3xl">{e.titulo}</h1><p className="mt-1 flex items-center gap-1.5 capitalize text-slate-300"><Clock className="size-4" /> {d.completa}</p></div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="mb-2 text-lg">Sobre o encontro</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed">{e.descricao}</p>
            <h3 className="mt-5 flex items-center gap-1.5"><MapPin className="size-4 text-brand" /> Local</h3>
            <p className="text-sm">{e.local}<br /><span className="text-cinza">{e.cidade} - {e.uf}</span></p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.local}, ${e.cidade} - ${e.uf}`)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">Abrir no mapa <ExternalLink className="size-3.5" /></a>
          </Card>
          <Card className="p-6">
            <h2 className="mb-3 text-lg">Quem vai ({e.confirmados.length})</h2>
            {e.confirmados.length ? (
              <div className="flex flex-wrap gap-4">
                {e.confirmados.map((uid) => { const u = consulta.usuario(uid); return u && <Link key={uid} href={`/usuarios/${uid}`} className="flex flex-col items-center gap-1 text-xs"><Avatar nome={u.nome} tamanho={44} />{u.nome.split(" ")[0]}</Link>; })}
              </div>
            ) : <p className="text-sm text-cinza">Ninguém confirmou ainda. Seja o primeiro!</p>}
          </Card>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-6">
            {e.capacidade && <div className="mb-4"><div className="h-2 overflow-hidden rounded-full bg-cinza-claro"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div><p className="mt-1.5 text-xs text-cinza">{e.confirmados.length} de {e.capacidade} vagas preenchidas</p></div>}
            <div className="flex flex-col gap-2">
              {!d.passou && (souOrg
                ? <Button variante="perigo" onClick={() => setJanela("cancelar")}>Cancelar encontro</Button>
                : <Button variante={vou ? "secundario" : "primario"} carregando={ocupado} disabled={lotado && !vou} onClick={presenca} icone={vou ? <X className="size-4" /> : <Check className="size-4" />}>
                    {vou ? "Cancelar presença" : lotado ? "Encontro lotado" : "Confirmar presença"}</Button>)}
              <Button variante="secundario" onClick={compartilhar} icone={<Share2 className="size-4" />}>Compartilhar</Button>
              {!souOrg && org && <Button variante="secundario" icone={<MessageCircle className="size-4" />}
                onClick={async () => { if (!usuario) return router.push("/login"); const c = await chat.abrirConversa(usuario.id, org.id); router.push(`/chat?c=${c.id}`); }}>Falar com o organizador</Button>}
            </div>
          </Card>
          {org && <Card className="p-6"><p className="text-xs text-cinza">Organizado por</p><Link href={`/usuarios/${org.id}`} className="mt-2 flex items-center gap-3"><Avatar nome={org.nome} /><span className="font-semibold">{org.nome}</span></Link></Card>}
          {!souOrg && usuario && <button onClick={() => setJanela("denuncia")} className="inline-flex items-center gap-1.5 text-sm text-cinza hover:text-brand"><Flag className="size-3.5" /> Denunciar encontro</button>}
        </aside>
      </div>
      <ConfirmModal aberto={janela === "cancelar"} aoFechar={() => setJanela(null)} titulo="Cancelar encontro" texto="Todos os confirmados serão avisados. Deseja continuar?" botao="Cancelar encontro" carregando={ocupado}
        aoConfirmar={async () => { setOcupado(true); try { await encontros.cancelar(e.id); mostrar("Encontro cancelado."); router.push("/encontros"); } catch (err) { mostrar((err as Error).message, "erro"); } finally { setOcupado(false); setJanela(null); } }} />
      {janela === "denuncia" && usuario && <ReportModal tipo="encontro" alvoId={e.id} usuarioId={usuario.id} aberto aoFechar={() => setJanela(null)} />}
    </Container>
  );
}
