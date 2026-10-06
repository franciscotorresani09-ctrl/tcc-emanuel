"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Calendar, MessageCircle, Shield, Star, Tag } from "lucide-react";
import type { TipoNotificacao } from "@/types";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/contexts/ToastContext";
import { notificacoes } from "@/services/api";
import { cn, tempoAtras } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, Container, PageHeader } from "@/components/ui/Misc";
import { Carregando, EstadoErro, EstadoVazio, Skeleton } from "@/components/ui/States";

const icones: Record<TipoNotificacao, typeof Bell> = { mensagem: MessageCircle, proposta: Tag, evento: Calendar, avaliacao: Star, sistema: Bell, moderacao: Shield };

export default function PaginaNotificacoes() {
  const { usuario, pronto } = useExigirLogin();
  const { mostrar } = useToast();
  const { data, error, loading, recarregar } = useAsync(() => notificacoes.listar(usuario!.id), [usuario?.id], { ativo: pronto, aoVivo: true });
  const [marcando, setMarcando] = useState(false);
  if (!pronto || !usuario) return <Carregando />;
  const naoLidas = (data ?? []).filter((n) => !n.lida).length;

  return (
    <Container estreito>
      <PageHeader titulo="Notificações" subtitulo={naoLidas ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}` : "Tudo em dia"}
        acao={naoLidas > 0 && <Button variante="secundario" tamanho="sm" carregando={marcando}
          onClick={async () => { setMarcando(true); try { await notificacoes.marcarTodas(usuario.id); mostrar("Todas marcadas como lidas."); } catch (e) { mostrar((e as Error).message, "erro"); } finally { setMarcando(false); } }}>
          Marcar todas como lidas</Button>} />
      <Card className="overflow-hidden">
        {loading ? [1, 2, 3, 4].map((i) => <div key={i} className="flex gap-3 border-b border-linha p-4"><Skeleton className="size-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-20" /></div></div>)
          : error ? <EstadoErro mensagem={error} aoTentarDeNovo={recarregar} />
          : !data?.length ? <EstadoVazio icone={<Bell />} titulo="Nenhuma notificação" texto="Avisos de mensagens, propostas e eventos aparecem aqui." />
          : data.map((n) => {
              const Icone = icones[n.tipo];
              return (
                <Link key={n.id} href={n.link} onClick={() => notificacoes.marcarLida(n.id)} className={cn("flex items-center gap-4 border-b border-linha px-5 py-4 last:border-0 hover:bg-cinza-claro", !n.lida && "bg-slate-50 font-medium")}>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", n.lida ? "bg-cinza-claro" : "bg-navy text-white")}><Icone className="size-4.5" /></span>
                  <span className="flex-1 text-sm">{n.texto}<span className="block text-xs font-normal text-cinza">{tempoAtras(n.criadoEm)}</span></span>
                  {!n.lida && <span className="size-2.5 rounded-full bg-brand" aria-label="Não lida" />}
                </Link>
              );
            })}
      </Card>
    </Container>
  );
}
