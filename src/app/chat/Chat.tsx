"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, MessageCircle, Plus, Search, Send } from "lucide-react";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/contexts/ToastContext";
import { chat, consulta, usuarios } from "@/services/api";
import { cn, formatarHora, formatarPreco, tempoAtras } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/FormFields";
import { Carregando, EstadoErro, EstadoVazio, Skeleton } from "@/components/ui/States";
import { AdImage } from "@/components/anuncios/AdImage";

export function Chat() {
  const { usuario, pronto } = useExigirLogin();
  const router = useRouter();
  const { mostrar } = useToast();
  const conversaId = useSearchParams().get("c");
  const conversas = useAsync(() => chat.conversas(usuario!.id), [usuario?.id], { ativo: pronto, aoVivo: true });
  const mensagens = useAsync(() => chat.mensagens(conversaId!, usuario!.id), [conversaId, usuario?.id], { ativo: pronto && !!conversaId, aoVivo: true });
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [nova, setNova] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => { fim.current?.scrollIntoView({ block: "end" }); }, [mensagens.data?.length]);
  if (!pronto || !usuario) return <Carregando />;

  const conversa = conversas.data?.find((c) => c.id === conversaId);
  const outro = conversa ? consulta.usuario(conversa.participantes.find((x) => x !== usuario.id)!) : null;
  const anuncio = conversa?.anuncioId ? consulta.anuncio(conversa.anuncioId) : null;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const t = texto.trim();
    if (!t || !conversaId) return;
    if (t.length > 1000) return mostrar("A mensagem pode ter no máximo 1000 caracteres.", "erro");
    setEnviando(true);
    try { await chat.enviar(conversaId, usuario!.id, t); setTexto(""); } catch (err) { mostrar((err as Error).message, "erro"); } finally { setEnviando(false); }
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-4rem)] max-w-7xl gap-4 px-4 py-6 md:h-[calc(100vh-4.5rem)] md:grid-cols-[330px_1fr]">
      {/* lista de conversas */}
      <aside className={cn("flex min-h-0 flex-col rounded-2xl border border-linha bg-white", conversaId && "hidden md:flex")}>
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl">Conversas</h1>
          <Button tamanho="sm" icone={<Plus className="size-4" />} onClick={() => setNova(true)}>Nova</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {conversas.loading ? [1, 2, 3].map((i) => <div key={i} className="flex gap-3 p-3"><Skeleton className="size-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div>)
            : conversas.error ? <EstadoErro mensagem={conversas.error} aoTentarDeNovo={conversas.recarregar} />
            : !conversas.data?.length ? <EstadoVazio icone={<MessageCircle />} titulo="Nenhuma conversa" texto="Clique em Nova ou em “Conversar” num anúncio." />
            : conversas.data.map((c) => {
                const o = consulta.usuario(c.participantes.find((x) => x !== usuario.id)!);
                const ad = c.anuncioId ? consulta.anuncio(c.anuncioId) : null;
                return (
                  <Link key={c.id} href={`/chat?c=${c.id}`} className={cn("flex items-center gap-3 rounded-xl p-3 hover:bg-cinza-claro", c.id === conversaId && "bg-cinza-claro shadow-[inset_3px_0_0_var(--color-brand)]")}>
                    <Avatar nome={o?.nome} tamanho={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{o?.nome ?? "Usuário"}</p>
                      {ad && <p className="truncate text-xs text-brand">{ad.marca} {ad.modelo}</p>}
                      <p className="truncate text-xs text-cinza">{c.ultima ? `${c.ultima.deId === usuario.id ? "Você: " : ""}${c.ultima.texto}` : "Nova conversa"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {c.ultima && <span className="text-[11px] text-cinza">{tempoAtras(c.ultima.criadoEm)}</span>}
                      {c.naoLidas > 0 && <span className="rounded-full bg-brand px-1.5 text-xs font-bold text-white">{c.naoLidas}</span>}
                    </div>
                  </Link>
                );
              })}
        </div>
      </aside>

      {/* conversa aberta */}
      <section className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-linha bg-white", !conversaId && "hidden md:flex")}>
        {!conversaId ? <div className="m-auto"><EstadoVazio icone={<MessageCircle />} titulo="Selecione uma conversa" texto="Converse com vendedores e organizadores em tempo real." /></div>
          : conversas.loading ? <Carregando />
          : !conversa ? <div className="m-auto"><EstadoErro mensagem="Conversa não encontrada." /></div>
          : <>
            <header className="flex items-center gap-3 border-b border-linha px-4 py-3">
              <button onClick={() => router.push("/chat")} className="grid size-9 place-items-center rounded-lg hover:bg-cinza-claro md:hidden" aria-label="Voltar"><ArrowLeft className="size-5" /></button>
              <Link href={`/usuarios/${outro?.id}`} className="flex min-w-0 flex-1 items-center gap-3"><Avatar nome={outro?.nome} /><div className="min-w-0"><p className="truncate font-semibold">{outro?.nome}</p><p className="text-xs text-cinza">{outro?.cidade} - {outro?.uf}</p></div></Link>
              {anuncio && <Link href={`/anuncios/${anuncio.id}`} className="hidden items-center gap-2 rounded-xl bg-cinza-claro p-1.5 pr-3 sm:flex"><AdImage anuncio={anuncio} className="h-10 w-16 rounded-lg bg-white" /><span className="text-sm"><b>{anuncio.marca} {anuncio.modelo}</b><br /><span className="text-xs text-cinza">{formatarPreco(anuncio.preco)}</span></span></Link>}
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-cinza-claro p-4" aria-live="polite">
              {mensagens.loading && !mensagens.data ? <Carregando texto="Carregando mensagens..." />
                : mensagens.error ? <EstadoErro mensagem={mensagens.error} aoTentarDeNovo={mensagens.recarregar} />
                : !mensagens.data?.length ? <p className="py-10 text-center text-sm text-cinza">Envie a primeira mensagem 👋</p>
                : <div className="flex flex-col gap-2">
                    {mensagens.data.map((m) => {
                      const minha = m.deId === usuario.id;
                      return (
                        <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm animate-entrar sm:max-w-[65%]", minha ? "self-end rounded-br-sm bg-navy text-white" : "self-start rounded-bl-sm bg-white")}>
                          <p className="whitespace-pre-wrap break-words text-sm">{m.texto}</p>
                          <p className={cn("mt-0.5 text-right text-[11px]", minha ? "text-slate-400" : "text-cinza")}>{formatarHora(m.criadoEm)}{minha && (m.lida ? " ✓✓" : " ✓")}</p>
                        </div>
                      );
                    })}
                    <div ref={fim} />
                  </div>}
            </div>
            <form onSubmit={enviar} className="flex gap-2 border-t border-linha p-3">
              <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva uma mensagem..." aria-label="Mensagem" maxLength={1000}
                className="min-w-0 flex-1 rounded-full bg-cinza-claro px-5 py-3 text-sm outline-none focus:ring-3 focus:ring-navy/10" />
              <Button type="submit" className="size-12 rounded-full! p-0!" carregando={enviando} disabled={!texto.trim()} aria-label="Enviar">{!enviando && <Send className="size-5" />}</Button>
            </form>
          </>}
      </section>

      <NovaConversa aberto={nova} aoFechar={() => setNova(false)} meuId={usuario.id} aoEscolher={async (uid) => {
        setNova(false);
        const c = await chat.abrirConversa(usuario.id, uid);
        router.push(`/chat?c=${c.id}`);
      }} />
    </div>
  );
}

function NovaConversa({ aberto, aoFechar, meuId, aoEscolher }: { aberto: boolean; aoFechar: () => void; meuId: string; aoEscolher: (uid: string) => void }) {
  const [busca, setBusca] = useState("");
  const lista = useAsync(() => usuarios.listar(), [aberto], { ativo: aberto });
  const pessoas = (lista.data ?? []).filter((u) => u.id !== meuId && !u.bloqueado && `${u.nome} ${u.cidade}`.toLowerCase().includes(busca.toLowerCase()));
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Nova conversa" largura="max-w-md">
      <Input icone={<Search />} placeholder="Buscar pelo nome..." value={busca} onChange={(e) => setBusca(e.target.value)} autoFocus />
      <div className="mt-3 max-h-80 overflow-y-auto">
        {lista.loading ? <Carregando /> : lista.error ? <EstadoErro mensagem={lista.error} aoTentarDeNovo={lista.recarregar} />
          : !pessoas.length ? <p className="py-6 text-center text-sm text-cinza">Ninguém encontrado com esse nome.</p>
          : pessoas.map((u) => (
            <button key={u.id} onClick={() => aoEscolher(u.id)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-cinza-claro">
              <Avatar nome={u.nome} /><span><b className="text-sm">{u.nome}</b><br /><span className="text-xs text-cinza">{u.cidade} - {u.uf}</span></span>
            </button>
          ))}
      </div>
    </Modal>
  );
}
