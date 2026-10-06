"use client";

import { Heart } from "lucide-react";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useAsync } from "@/hooks/useAsync";
import { anuncios } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Container, PageHeader } from "@/components/ui/Misc";
import { Carregando, EstadoErro, EstadoVazio } from "@/components/ui/States";
import { AdCard, AdGrid, AdGridSkeleton } from "@/components/anuncios/AdCard";

export default function PaginaFavoritos() {
  const { usuario, pronto } = useExigirLogin();
  const ids = usuario?.favoritos ?? [];
  const { data, error, loading, recarregar } = useAsync(() => anuncios.porIds(ids), [ids.join()], { ativo: pronto });
  if (!pronto) return <Carregando />;
  return (
    <Container>
      <PageHeader titulo="Favoritos" subtitulo="Os carros que você salvou." />
      {loading ? <AdGridSkeleton quantidade={4} /> : error ? <EstadoErro mensagem={error} aoTentarDeNovo={recarregar} />
        : !data?.length ? <EstadoVazio icone={<Heart />} titulo="Nenhum favorito ainda" texto="Toque no coração dos anúncios para salvá-los aqui." acao={<Button href="/comprar">Buscar veículos</Button>} />
        : <AdGrid>{data.map((a) => <AdCard key={a.id} anuncio={a} />)}</AdGrid>}
    </Container>
  );
}
