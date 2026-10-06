"use client";

import { useParams } from "next/navigation";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useAsync } from "@/hooks/useAsync";
import { anuncios } from "@/services/api";
import { Container, PageHeader } from "@/components/ui/Misc";
import { Carregando, EstadoErro } from "@/components/ui/States";
import { AdForm } from "@/components/anuncios/AdForm";

export default function PaginaEditarAnuncio() {
  const { id } = useParams<{ id: string }>();
  const { usuario, pronto } = useExigirLogin();
  const { data, error, loading, recarregar } = useAsync(() => anuncios.buscar(id), [id], { ativo: pronto });

  if (!pronto || loading) return <Carregando />;
  if (error || !data) return <Container><EstadoErro mensagem={error ?? "Anúncio não encontrado."} aoTentarDeNovo={recarregar} /></Container>;
  if (data.userId !== usuario!.id && !usuario!.admin) return <Container><EstadoErro mensagem="Você não tem permissão para editar este anúncio." /></Container>;

  return (
    <Container>
      <PageHeader titulo="Editar anúncio" subtitulo={`${data.marca} ${data.modelo} ${data.ano}`} />
      <AdForm usuarioId={data.userId} anuncio={data} />
    </Container>
  );
}
