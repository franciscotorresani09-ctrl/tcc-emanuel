import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Misc";
import { EstadoVazio } from "@/components/ui/States";

export default function NaoEncontrada() {
  return (
    <Container>
      <EstadoVazio icone={<CarFront />} titulo="Página não encontrada" texto="O conteúdo que você procura não existe ou foi removido." acao={<Button href="/">Voltar ao início</Button>} className="py-24" />
    </Container>
  );
}
