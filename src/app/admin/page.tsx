"use client";

import Link from "next/link";
import { useState } from "react";
import { RefreshCw, Shield } from "lucide-react";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/contexts/ToastContext";
import { consulta, moderacao, restaurarDadosDeExemplo, usuarios } from "@/services/api";
import { formatarData } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Avatar, Badge, Card, Container, PageHeader } from "@/components/ui/Misc";
import { ConfirmModal } from "@/components/ui/Modal";
import { Carregando, EstadoErro, EstadoVazio, Skeleton } from "@/components/ui/States";

export default function PaginaAdmin() {
  const { usuario, pronto } = useExigirLogin();
  const { mostrar } = useToast();
  const { data, error, loading, recarregar } = useAsync(() => moderacao.painel(), [], { ativo: pronto && !!usuario?.admin, aoVivo: true });
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [restaurar, setRestaurar] = useState(false);
  if (!pronto || !usuario) return <Carregando />;
  if (!usuario.admin) return <Container><EstadoVazio icone={<Shield />} titulo="Acesso restrito" texto="Esta área é só para a equipe de moderação." acao={<Button href="/">Voltar ao início</Button>} /></Container>;

  async function acao(chave: string, fn: () => Promise<unknown>, msg: string) {
    setOcupado(chave);
    try { await fn(); mostrar(msg); } catch (e) { mostrar((e as Error).message, "erro"); } finally { setOcupado(null); }
  }
  const alvo = (tipo: string, alvoId: string) => {
    if (tipo === "anúncio") { const a = consulta.anuncio(alvoId); return a ? <Link href={`/anuncios/${a.id}`} className="font-semibold hover:text-brand">{a.marca} {a.modelo} {a.ano}</Link> : <span className="text-cinza">removido</span>; }
    if (tipo === "usuário") { const u = consulta.usuario(alvoId); return u ? <Link href={`/usuarios/${u.id}`} className="font-semibold hover:text-brand">{u.nome}</Link> : "—"; }
    return <Link href={`/encontros/${alvoId}`} className="font-semibold hover:text-brand">Ver encontro</Link>;
  };

  return (
    <Container>
      <PageHeader titulo="Painel de moderação" subtitulo="Denúncias, usuários e números da plataforma." acao={<Button variante="secundario" tamanho="sm" icone={<RefreshCw className="size-4" />} onClick={() => setRestaurar(true)}>Restaurar dados de exemplo</Button>} />
      {loading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-6">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        : error ? <EstadoErro mensagem={error} aoTentarDeNovo={recarregar} />
        : data && <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {Object.entries({ usuários: data.numeros.usuarios, "anúncios ativos": data.numeros.anuncios, encontros: data.numeros.encontros, propostas: data.numeros.propostas, mensagens: data.numeros.mensagens, "denúncias abertas": data.numeros.denuncias }).map(([t, n]) => (
              <div key={t} className="rounded-2xl bg-cinza-claro p-5"><p className={`font-display text-3xl font-extrabold ${t === "denúncias abertas" && n ? "text-brand" : ""}`}>{n}</p><p className="text-sm text-cinza">{t}</p></div>
            ))}
          </div>

          <h2 className="mb-3 mt-10 text-xl">Denúncias</h2>
          <Card className="overflow-x-auto">
            {!data.denuncias.length ? <EstadoVazio titulo="Nenhuma denúncia" className="py-8" /> : (
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-cinza-claro text-left text-xs uppercase tracking-wider text-cinza"><tr><th className="p-3">Data</th><th className="p-3">Tipo</th><th className="p-3">Alvo</th><th className="p-3">Motivo</th><th className="p-3">Situação</th><th className="p-3" /></tr></thead>
                <tbody>
                  {data.denuncias.map((d) => (
                    <tr key={d.id} className="border-t border-linha">
                      <td className="p-3">{formatarData(d.criadoEm)}</td><td className="p-3 capitalize">{d.tipo}</td><td className="p-3">{alvo(d.tipo, d.alvoId)}</td><td className="p-3">{d.motivo}</td>
                      <td className="p-3">{d.resolvida ? <Badge>Resolvida</Badge> : <Badge cor="alerta">Aberta</Badge>}</td>
                      <td className="whitespace-nowrap p-3 text-right">{!d.resolvida && <>
                        <Button tamanho="sm" variante="perigo" carregando={ocupado === `r${d.id}`} onClick={() => acao(`r${d.id}`, () => moderacao.resolver(d.id, true), "Conteúdo removido.")}>Remover conteúdo</Button>{" "}
                        <Button tamanho="sm" variante="secundario" carregando={ocupado === `i${d.id}`} onClick={() => acao(`i${d.id}`, () => moderacao.resolver(d.id, false), "Denúncia ignorada.")}>Ignorar</Button>
                      </>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <h2 className="mb-3 mt-10 text-xl">Usuários</h2>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-cinza-claro text-left text-xs uppercase tracking-wider text-cinza"><tr><th className="p-3">Usuário</th><th className="p-3">E-mail</th><th className="p-3">Cidade</th><th className="p-3">Reputação</th><th className="p-3" /></tr></thead>
              <tbody>
                {data.usuarios.map((u) => { const r = usuarios.reputacao(u.id); return (
                  <tr key={u.id} className="border-t border-linha">
                    <td className="p-3"><Link href={`/usuarios/${u.id}`} className="flex items-center gap-2 font-semibold"><Avatar nome={u.nome} tamanho={28} /> {u.nome}</Link></td>
                    <td className="p-3">{u.email}</td><td className="p-3">{u.cidade} - {u.uf}</td><td className="p-3">{r.total ? `${r.media.toFixed(1)} ★` : "—"}</td>
                    <td className="p-3 text-right">{u.admin ? <Badge cor="escuro">admin</Badge>
                      : <Button tamanho="sm" variante={u.bloqueado ? "secundario" : "perigo"} carregando={ocupado === `b${u.id}`}
                          onClick={() => acao(`b${u.id}`, () => usuarios.alternarBloqueio(u.id), u.bloqueado ? "Usuário desbloqueado." : "Usuário bloqueado.")}>{u.bloqueado ? "Desbloquear" : "Bloquear"}</Button>}</td>
                  </tr>
                ); })}
              </tbody>
            </table>
          </Card>
        </>}
      <ConfirmModal aberto={restaurar} aoFechar={() => setRestaurar(false)} titulo="Restaurar dados de exemplo" texto="Todos os dados criados neste navegador serão apagados e os exemplos voltarão. Você será desconectado."
        botao="Restaurar" aoConfirmar={() => { restaurarDadosDeExemplo(); setRestaurar(false); mostrar("Dados restaurados.", "info"); }} />
    </Container>
  );
}
