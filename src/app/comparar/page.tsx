"use client";

import Link from "next/link";
import { Columns2 } from "lucide-react";
import type { Anuncio } from "@/types";
import { useComparar } from "@/hooks/useComparar";
import { useAsync } from "@/hooks/useAsync";
import { anuncios, consulta, usuarios } from "@/services/api";
import { cn, formatarKm, formatarPreco } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, Container, Estrelas, PageHeader } from "@/components/ui/Misc";
import { EstadoErro, EstadoVazio, Skeleton } from "@/components/ui/States";
import { AdImage } from "@/components/anuncios/AdImage";

type Linha = { nome: string; mostrar: (a: Anuncio) => React.ReactNode; valor?: (a: Anuncio) => number; melhor?: "min" | "max" };
const linhas: Linha[] = [
  { nome: "Preço", mostrar: (a) => formatarPreco(a.preco), valor: (a) => a.preco, melhor: "min" },
  { nome: "Ano", mostrar: (a) => a.ano, valor: (a) => a.ano, melhor: "max" },
  { nome: "Quilometragem", mostrar: (a) => formatarKm(a.km), valor: (a) => a.km, melhor: "min" },
  { nome: "Câmbio", mostrar: (a) => a.cambio },
  { nome: "Combustível", mostrar: (a) => a.combustivel },
  { nome: "Carroceria", mostrar: (a) => a.carroceria },
  { nome: "Local", mostrar: (a) => `${a.cidade} - ${a.uf}` },
  { nome: "Aceita troca", mostrar: (a) => (a.aceitaTroca ? "Sim" : "Não") },
  { nome: "Vendedor", mostrar: (a) => { const u = consulta.usuario(a.userId); const r = usuarios.reputacao(a.userId); return <>{u?.nome}<br /><Estrelas media={r.media} total={r.total} /></>; } },
];

export default function PaginaComparar() {
  const { lista, alternar } = useComparar();
  const { data, error, loading, recarregar } = useAsync(() => anuncios.porIds(lista), [lista.join()]);

  return (
    <Container>
      <PageHeader titulo="Comparar veículos" subtitulo="Em vermelho, o melhor valor de cada item." />
      {loading ? <Skeleton className="h-96 w-full rounded-2xl" /> : error ? <EstadoErro mensagem={error} aoTentarDeNovo={recarregar} />
        : (data?.length ?? 0) < 2 ? <EstadoVazio icone={<Columns2 />} titulo="Selecione pelo menos 2 veículos" texto='Marque "Comparar" nos anúncios (até 3).' acao={<Button href="/comprar">Buscar veículos</Button>} />
        : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className="w-36" />
                  {data!.map((a) => (
                    <th key={a.id} className="p-4 text-left align-top">
                      <Link href={`/anuncios/${a.id}`}><AdImage anuncio={a} className="mb-2 aspect-[16/10] rounded-xl" /><span className="font-display text-base">{a.marca} {a.modelo}</span></Link>
                      <p className="font-normal text-cinza">{a.versao}</p>
                      <button onClick={() => alternar(a.id)} className="mt-1 text-xs font-semibold text-brand hover:underline">remover</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => {
                  const valores = l.valor ? data!.map(l.valor) : [];
                  const melhor = l.melhor === "min" ? Math.min(...valores) : l.melhor === "max" ? Math.max(...valores) : null;
                  return (
                    <tr key={l.nome} className="border-t border-linha">
                      <th className="p-4 text-left font-semibold text-cinza">{l.nome}</th>
                      {data!.map((a) => <td key={a.id} className={cn("p-4", melhor !== null && l.valor!(a) === melhor && "font-bold text-brand")}>{l.mostrar(a)}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
    </Container>
  );
}
