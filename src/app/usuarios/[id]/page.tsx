"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Flag, MessageCircle, Star } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { chat, consulta, usuarios } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Misc";
import { Carregando, EstadoErro } from "@/components/ui/States";
import { ProfileView } from "@/components/usuarios/ProfileView";
import { ReportModal, ReviewModal } from "@/components/usuarios/ActionModals";

export default function PaginaUsuario() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario: eu } = useAuth();
  const { mostrar } = useToast();
  const { data: u, error, loading, recarregar } = useAsync(() => usuarios.buscar(id), [id]);
  const [janela, setJanela] = useState<null | "avaliar" | "denunciar">(null);
  // o próprio perfil abre na página /perfil
  useEffect(() => { if (u && eu?.id === u.id) router.replace("/perfil"); }, [u, eu, router]);

  if (loading) return <Carregando />;
  if (error || !u) return <Container><EstadoErro mensagem={error ?? "Usuário não encontrado."} aoTentarDeNovo={recarregar} /></Container>;
  if (eu?.id === u.id) return <Carregando />;

  const exigir = (f: () => void) => (eu ? f() : router.push(`/login?volta=/usuarios/${u.id}`));

  return (
    <Container>
      <ProfileView usuario={u} acoes={<>
        <Button icone={<MessageCircle className="size-4" />} onClick={() => exigir(async () => { const c = await chat.abrirConversa(eu!.id, u.id); router.push(`/chat?c=${c.id}`); })}>Enviar mensagem</Button>
        <Button variante="secundario" icone={<Star className="size-4" />} onClick={() => exigir(() => {
          if (!consulta.podeAvaliar(eu!.id, u.id)) return mostrar("Você só pode avaliar quem já conversou ou negociou com você.", "info");
          setJanela("avaliar");
        })}>Avaliar</Button>
        <button onClick={() => exigir(() => setJanela("denunciar"))} className="inline-flex items-center justify-center gap-1.5 text-sm text-cinza hover:text-brand"><Flag className="size-3.5" /> Denunciar</button>
      </>} />
      {eu && janela === "avaliar" && <ReviewModal deId={eu.id} paraId={u.id} nome={u.nome} aberto aoFechar={() => setJanela(null)} />}
      {eu && janela === "denunciar" && <ReportModal tipo="usuário" alvoId={u.id} usuarioId={eu.id} aberto aoFechar={() => setJanela(null)} />}
    </Container>
  );
}
