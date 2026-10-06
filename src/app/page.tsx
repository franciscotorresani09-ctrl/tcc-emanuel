"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftRight, Car, MapPin, MessageCircle, Search, Tag, Users } from "lucide-react";
import Link from "next/link";
import { useAsync } from "@/hooks/useAsync";
import { anuncios, encontros } from "@/services/api";
import { MARCAS, UFS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select } from "@/components/ui/FormFields";
import { Container, SecaoTitulo } from "@/components/ui/Misc";
import { EstadoErro, EstadoVazio } from "@/components/ui/States";
import { AdCard, AdGrid, AdGridSkeleton } from "@/components/anuncios/AdCard";
import { EventCard, EventCardSkeleton } from "@/components/encontros/EventCard";
import { useState, type FormEvent } from "react";

const recursos = [
  { icone: Search, titulo: "Busca avançada", texto: "Filtre por marca, ano, preço e localização.", href: "/comprar" },
  { icone: Tag, titulo: "Anuncie grátis", texto: "Publique em minutos e receba propostas.", href: "/anunciar" },
  { icone: ArrowLeftRight, titulo: "Propostas de troca", texto: "Ofereça seu carro como parte do pagamento.", href: "/trocar" },
  { icone: Users, titulo: "Encontros", texto: "Crie eventos e confirme presença.", href: "/encontros" },
];

export default function Inicio() {
  const router = useRouter();
  const [busca, setBusca] = useState({ marca: "", q: "", uf: "", troca: false });
  const lista = useAsync(() => anuncios.listar(), []);
  const eventos = useAsync(() => encontros.listar(), []);

  function buscar(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (busca.marca) p.set("marca", busca.marca);
    if (busca.q) p.set("q", busca.q);
    if (busca.uf) p.set("uf", busca.uf);
    router.push(`${busca.troca ? "/trocar" : "/comprar"}${p.size ? `?${p}` : ""}`);
  }

  const destaques = lista.data?.filter((a) => a.destaque).slice(0, 4) ?? [];
  const recentes = lista.data?.filter((a) => !a.destaque).slice(0, 8) ?? [];

  return (
    <>
      <section className="border-b-4 border-brand bg-navy text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[.15em]">Conecte. Encontre. <span className="text-brand">Dirija.</span></p>
            <h1 className="mt-4 text-4xl font-extrabold uppercase leading-none sm:text-5xl lg:text-6xl">Seu próximo carro,<span className="block text-brand">mais perto.</span></h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">Compre, venda e troque carros, converse pelo chat e marque encontros — tudo em um só lugar.</p>
            <div className="mt-7 flex flex-wrap gap-5 text-sm text-slate-200">
              {[{ i: Car, t: "Compre e venda com segurança" }, { i: MessageCircle, t: "Feche negócios no chat" }, { i: MapPin, t: "Marque encontros" }].map(({ i: I, t }) => (
                <span key={t} className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-full bg-brand"><I className="size-4" /></span>{t}</span>
              ))}
            </div>
          </div>
          <form onSubmit={buscar} className="rounded-2xl bg-white p-6 text-navy shadow-2xl">
            <h2 className="mb-4 flex items-center gap-2 text-xl"><Search className="size-5 text-brand" /> Encontre seu próximo carro</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select rotulo="Marca" vazio="Todas" opcoes={MARCAS} value={busca.marca} onChange={(e) => setBusca({ ...busca, marca: e.target.value })} />
              <Input rotulo="Modelo" placeholder="Ex.: Civic" value={busca.q} onChange={(e) => setBusca({ ...busca, q: e.target.value })} />
              <Select rotulo="Estado" vazio="Todos" opcoes={UFS} value={busca.uf} onChange={(e) => setBusca({ ...busca, uf: e.target.value })} />
              <div className="flex items-end pb-2.5"><Checkbox rotulo="Só quem aceita troca" checked={busca.troca} onChange={(e) => setBusca({ ...busca, troca: e.target.checked })} /></div>
            </div>
            <Button type="submit" bloco tamanho="lg" className="mt-4" icone={<Search className="size-4" />}>Buscar veículos</Button>
          </form>
        </div>
      </section>

      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recursos.map(({ icone: I, titulo, texto, href }) => (
            <Link key={href} href={href} className="rounded-2xl bg-cinza-claro p-6 transition hover:bg-white hover:shadow-lg">
              <I className="mb-3 size-7 text-brand" />
              <h3>{titulo}</h3>
              <p className="mt-1 text-sm text-cinza">{texto}</p>
            </Link>
          ))}
        </div>

        <SecaoTitulo titulo="Destaques" link={{ href: "/comprar", texto: "Ver todos" }} />
        {lista.loading ? <AdGridSkeleton quantidade={4} /> : lista.error ? <EstadoErro mensagem={lista.error} aoTentarDeNovo={lista.recarregar} />
          : destaques.length ? <AdGrid>{destaques.map((a) => <AdCard key={a.id} anuncio={a} />)}</AdGrid>
          : <EstadoVazio titulo="Nenhum destaque no momento" />}

        <SecaoTitulo titulo="Anúncios recentes" link={{ href: "/comprar", texto: "Ver todos" }} />
        {lista.loading ? <AdGridSkeleton quantidade={4} /> : lista.error ? <EstadoErro mensagem={lista.error} aoTentarDeNovo={lista.recarregar} />
          : recentes.length ? <AdGrid>{recentes.map((a) => <AdCard key={a.id} anuncio={a} />)}</AdGrid>
          : <EstadoVazio icone={<Car />} titulo="Nenhum anúncio ainda" texto="Seja o primeiro a anunciar!" acao={<Button href="/anunciar">Anunciar</Button>} />}

        <SecaoTitulo titulo="Próximos encontros" link={{ href: "/encontros", texto: "Ver agenda" }} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventos.loading ? Array.from({ length: 3 }, (_, i) => <EventCardSkeleton key={i} />)
            : eventos.error ? <EstadoErro mensagem={eventos.error} aoTentarDeNovo={eventos.recarregar} />
            : eventos.data?.length ? eventos.data.slice(0, 3).map((e) => <EventCard key={e.id} encontro={e} />)
            : <EstadoVazio titulo="Nenhum encontro marcado" />}
        </div>

        <div className="relative mt-16 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-navy p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div><h2 className="text-2xl sm:text-3xl">Tem um carro parado na garagem?</h2><p className="mt-2 text-slate-300">Anuncie grátis e receba propostas de compra e troca.</p></div>
          <Button href="/anunciar" tamanho="lg">Anunciar meu veículo</Button>
        </div>
      </Container>
    </>
  );
}
