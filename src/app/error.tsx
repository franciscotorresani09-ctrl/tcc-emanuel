"use client";

import { Container } from "@/components/ui/Misc";
import { EstadoErro } from "@/components/ui/States";

/** Mostrado quando alguma tela quebra de forma inesperada */
export default function Erro({ retry }: { error: Error; retry: () => void }) {
  return (
    <Container>
      <EstadoErro mensagem="Ocorreu um erro inesperado ao exibir esta página." aoTentarDeNovo={retry} />
    </Container>
  );
}
