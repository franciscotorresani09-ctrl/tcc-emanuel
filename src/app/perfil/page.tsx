"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Usuario } from "@/types";
import { useExigirLogin } from "@/hooks/useExigirLogin";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/contexts/ToastContext";
import { usuarios } from "@/services/api";
import { CIDADES, UFS } from "@/lib/constants";
import { mascaraTelefone } from "@/lib/masks";
import { maximo, minimo, obrigatorio, telefone } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormFields";
import { Container } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Modal";
import { Carregando } from "@/components/ui/States";
import { ProfileView } from "@/components/usuarios/ProfileView";

export default function PaginaPerfil() {
  const { usuario, pronto } = useExigirLogin();
  const [editando, setEditando] = useState(false);
  if (!pronto || !usuario) return <Carregando />;
  return (
    <Container>
      <ProfileView usuario={usuario} acoes={<Button variante="secundario" icone={<Pencil className="size-4" />} onClick={() => setEditando(true)}>Editar perfil</Button>} />
      {editando && <EditarPerfil usuario={usuario} aoFechar={() => setEditando(false)} />}
    </Container>
  );
}

function EditarPerfil({ usuario, aoFechar }: { usuario: Usuario; aoFechar: () => void }) {
  const { mostrar } = useToast();
  const form = useForm(
    { nome: usuario.nome, telefone: usuario.telefone, uf: usuario.uf, cidade: usuario.cidade, bio: usuario.bio },
    { nome: [obrigatorio("Informe seu nome."), minimo(3), maximo(60)], telefone: [telefone], cidade: [obrigatorio()], bio: [maximo(300)] },
    { telefone: mascaraTelefone },
  );
  const enviar = form.enviar(async (v) => {
    try {
      await usuarios.atualizar(usuario.id, { nome: v.nome.trim(), telefone: v.telefone, uf: v.uf, cidade: v.cidade, bio: v.bio.trim() });
      mostrar("Perfil atualizado.");
      aoFechar();
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });
  return (
    <Modal aberto aoFechar={aoFechar} titulo="Editar perfil">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Input rotulo="Nome" obrigatorio {...form.campo("nome")} />
        <Input rotulo="E-mail" value={usuario.email} disabled ajuda="O e-mail é o da sua conta de login." />
        <Input rotulo="Telefone" inputMode="tel" placeholder="(47) 99999-9999" {...form.campo("telefone")} />
        <div className="grid grid-cols-2 gap-3">
          <Select rotulo="Estado" opcoes={UFS} value={form.valores.uf} onChange={(e) => form.setValores((x) => ({ ...x, uf: e.target.value, cidade: CIDADES[e.target.value][0] }))} />
          <Select rotulo="Cidade" opcoes={CIDADES[form.valores.uf] ?? []} {...form.campo("cidade")} />
        </div>
        <Textarea rotulo="Sobre você" ajuda={`${form.valores.bio.length}/300`} {...form.campo("bio")} />
        <div className="flex justify-end gap-2">
          <Button type="button" variante="secundario" onClick={aoFechar}>Cancelar</Button>
          <Button type="submit" carregando={form.enviando}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
