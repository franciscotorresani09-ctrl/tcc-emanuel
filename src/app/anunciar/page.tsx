"use client";

import { useExigirLogin } from "@/hooks/useExigirLogin";
import { Container, PageHeader } from "@/components/ui/Misc";
import { Carregando } from "@/components/ui/States";
import { AdForm } from "@/components/anuncios/AdForm";

export default function PaginaAnunciar() {
  const { usuario, pronto } = useExigirLogin();
  if (!pronto || !usuario) return <Carregando />;
  return (
    <Container>
      <PageHeader titulo="Anunciar meu veículo" subtitulo="Preencha com atenção: você é responsável pela veracidade das informações." />
      <AdForm usuarioId={usuario.id} cidadePadrao={usuario.cidade} ufPadrao={usuario.uf} />
    </Container>
  );
}
