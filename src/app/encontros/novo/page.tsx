"use client";

import { useRouter } from "next/navigation";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/contexts/ToastContext";
import { encontros } from "@/services/api";
import { CATEGORIAS_ENCONTRO, CIDADES, UFS } from "@/lib/constants";
import { mascaraMilhar, paraNumero } from "@/lib/masks";
import { dataFutura, maximo, minimo, numeroEntre, obrigatorio } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormFields";
import { Card, Container, PageHeader } from "@/components/ui/Misc";
import { Carregando } from "@/components/ui/States";

export default function PaginaNovoEncontro() {
  const { usuario, pronto } = useExigirLogin();
  if (!pronto || !usuario) return <Carregando />;
  return <Formulario usuarioId={usuario.id} uf={usuario.uf} cidade={usuario.cidade} />;
}

function Formulario({ usuarioId, uf, cidade }: { usuarioId: string; uf: string; cidade: string }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const hoje = new Date().toISOString().slice(0, 10);
  const form = useForm(
    { titulo: "", categoria: "Encontro", data: "", hora: "19:00", local: "", uf, cidade, capacidade: "", descricao: "" },
    {
      titulo: [obrigatorio("Dê um título ao encontro."), minimo(5), maximo(80)],
      data: [obrigatorio("Escolha a data."), dataFutura],
      hora: [obrigatorio("Escolha o horário.")],
      local: [obrigatorio("Informe o endereço ou ponto de encontro."), maximo(120)],
      cidade: [obrigatorio()],
      capacidade: [numeroEntre(2, 100000, "O limite precisa ser de pelo menos 2 pessoas.")],
      descricao: [obrigatorio("Conte o que vai rolar no encontro."), minimo(10), maximo(1500)],
    },
    { capacidade: mascaraMilhar },
  );

  const enviar = form.enviar(async (v) => {
    try {
      const novo = await encontros.criar({ organizadorId: usuarioId, titulo: v.titulo.trim(), categoria: v.categoria, data: v.data, hora: v.hora, local: v.local.trim(),
        uf: v.uf, cidade: v.cidade, capacidade: v.capacidade ? paraNumero(v.capacidade) : null, descricao: v.descricao.trim() });
      mostrar("Encontro publicado!");
      router.push(`/encontros/${novo.id}`);
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });

  return (
    <Container estreito>
      <PageHeader titulo="Criar encontro" subtitulo="Divulgue seu evento para a comunidade automotiva." />
      <Card className="p-6">
        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          <Input rotulo="Título" obrigatorio placeholder="Ex.: Encontro de Hatches de Blumenau" {...form.campo("titulo")} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select rotulo="Categoria" opcoes={CATEGORIAS_ENCONTRO} {...form.campo("categoria")} />
            <Input rotulo="Data" obrigatorio type="date" min={hoje} {...form.campo("data")} />
            <Input rotulo="Horário" obrigatorio type="time" {...form.campo("hora")} />
          </div>
          <Input rotulo="Endereço / ponto de encontro" obrigatorio placeholder="Rua, número ou referência" {...form.campo("local")} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select rotulo="Estado" opcoes={UFS} value={form.valores.uf} onChange={(e) => form.setValores((x) => ({ ...x, uf: e.target.value, cidade: CIDADES[e.target.value][0] }))} />
            <Select rotulo="Cidade" obrigatorio opcoes={CIDADES[form.valores.uf] ?? []} {...form.campo("cidade")} />
            <Input rotulo="Limite de pessoas" inputMode="numeric" placeholder="Sem limite" {...form.campo("capacidade")} />
          </div>
          <Textarea rotulo="Descrição" obrigatorio placeholder="O que vai rolar, regras, estrutura do local..." {...form.campo("descricao")} />
          <div className="flex justify-end gap-2">
            <Button type="button" variante="secundario" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" carregando={form.enviando}>Publicar encontro</Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
