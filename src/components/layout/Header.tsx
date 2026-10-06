"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Car, Columns2, Heart, LogOut, Menu, MessageCircle, Shield, Tag, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useDadosAoVivo } from "@/hooks/useAsync";
import { chat, notificacoes } from "@/services/api";
import { cn } from "@/lib/format";
import { Avatar } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/comprar", texto: "Comprar" },
  { href: "/anunciar", texto: "Vender" },
  { href: "/trocar", texto: "Trocar" },
  { href: "/encontros", texto: "Encontros" },
  { href: "/chat", texto: "Chat" },
];

export function Header() {
  useDadosAoVivo();
  const { usuario, sair } = useAuth();
  const { mostrar } = useToast();
  const caminho = usePathname();
  const router = useRouter();
  const [menuMobile, setMenuMobile] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const refMenu = useRef<HTMLDivElement>(null);

  // fecha os menus ao trocar de página (ajuste de estado durante a renderização, padrão do React)
  const [caminhoAnterior, setCaminhoAnterior] = useState(caminho);
  if (caminho !== caminhoAnterior) {
    setCaminhoAnterior(caminho);
    setMenuMobile(false);
    setMenuUsuario(false);
  }
  // e ao clicar fora
  useEffect(() => {
    const fora = (e: MouseEvent) => { if (refMenu.current && !refMenu.current.contains(e.target as Node)) setMenuUsuario(false); };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  const naoLidasChat = usuario ? chat.naoLidas(usuario.id) : 0;
  const naoLidasNotif = usuario ? notificacoes.naoLidas(usuario.id) : 0;

  function deslogar() {
    sair();
    mostrar("Você saiu da sua conta.", "info");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:h-18 md:gap-8">
        <button className="grid size-10 place-items-center rounded-lg hover:bg-cinza-claro md:hidden" onClick={() => setMenuMobile((v) => !v)} aria-label="Abrir menu" aria-expanded={menuMobile}>
          {menuMobile ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
        <Link href="/" className="flex-1 md:flex-none" aria-label="StreetCar — início">
          <Image src="/img/logo-compacta.png" alt="StreetCar" width={633} height={283} priority className="h-9 w-auto md:h-11" />
        </Link>

        <nav className={cn("md:static md:flex md:flex-1 md:gap-1", menuMobile ? "absolute inset-x-0 top-16 flex flex-col border-b border-linha bg-white p-3 shadow-lg" : "hidden")} aria-label="Principal">
          {links.map((l) => {
            const ativo = caminho.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={cn("relative flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium md:py-2",
                ativo ? "text-navy font-semibold bg-cinza-claro md:bg-transparent md:after:absolute md:after:inset-x-3.5 md:after:-bottom-[17px] md:after:h-0.5 md:after:bg-brand" : "text-cinza hover:text-navy")}>
                {l.texto}
                {l.href === "/chat" && naoLidasChat > 0 && <span className="rounded-full bg-brand px-1.5 text-xs font-bold text-white">{naoLidasChat}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <Link href="/notificacoes" className="relative grid size-10 place-items-center rounded-lg hover:bg-cinza-claro" aria-label={`Notificações (${naoLidasNotif} não lidas)`}>
                <Bell className="size-5" />
                {naoLidasNotif > 0 && <span className="absolute right-1 top-1 grid min-w-4.5 place-items-center rounded-full border-2 border-white bg-brand px-1 text-[10px] font-bold text-white">{naoLidasNotif > 9 ? "9+" : naoLidasNotif}</span>}
              </Link>
              <div className="relative" ref={refMenu}>
                <button onClick={() => setMenuUsuario((v) => !v)} className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-cinza-claro" aria-haspopup="menu" aria-expanded={menuUsuario}>
                  <Avatar nome={usuario.nome} tamanho={34} />
                  <span className="hidden text-sm font-semibold sm:inline">{usuario.nome.split(" ")[0]}</span>
                </button>
                {menuUsuario && (
                  <div role="menu" className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-linha bg-white p-1.5 shadow-xl animate-entrar">
                    <div className="flex items-center gap-3 border-b border-linha px-3 pb-3 pt-2">
                      <Avatar nome={usuario.nome} />
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{usuario.nome}</p><p className="truncate text-xs text-cinza">{usuario.email}</p></div>
                    </div>
                    {[
                      { href: "/perfil", icone: User, texto: "Meu perfil" },
                      { href: "/meus-anuncios", icone: Car, texto: "Meus anúncios" },
                      { href: "/propostas", icone: Tag, texto: "Propostas" },
                      { href: "/chat", icone: MessageCircle, texto: "Mensagens" },
                      { href: "/favoritos", icone: Heart, texto: "Favoritos" },
                      { href: "/comparar", icone: Columns2, texto: "Comparar" },
                      ...(usuario.admin ? [{ href: "/admin", icone: Shield, texto: "Moderação" }] : []),
                    ].map(({ href, icone: Icone, texto }) => (
                      <Link key={href} href={href} role="menuitem" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-cinza-claro">
                        <Icone className="size-4 text-cinza" /> {texto}
                      </Link>
                    ))}
                    <button onClick={deslogar} role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-cinza-claro"><LogOut className="size-4 text-cinza" /> Sair</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button href="/login" variante="secundario" tamanho="sm" className="hidden sm:inline-flex">Entrar</Button>
              <Button href="/cadastro" tamanho="sm">Criar conta</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
