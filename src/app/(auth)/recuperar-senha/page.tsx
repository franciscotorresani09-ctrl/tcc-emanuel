"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, Mail } from "lucide-react";
import { useForm } from "@/hooks/useForm";
import { auth } from "@/services/api";
import { email, obrigatorio } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";
import { AuthCard } from "@/components/layout/AuthCard";

export default function PaginaRecuperarSenha() {
  const [enviadoPara, setEnviadoPara] = useState("");
  const [erro, setErro] = useState("");
  const form = useForm({ email: "" }, { email: [obrigatorio("Informe seu e-mail."), email] });

  const enviar = form.enviar(async (v) => {
    setErro("");
    try { await auth.recuperarSenha(v.email); setEnviadoPara(v.email); } catch (e) { setErro((e as Error).message); }
  });

  if (enviadoPara) return (
    <AuthCard titulo="Verifique seu e-mail" subtitulo="Enviamos as instruções para criar uma nova senha.">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-cinza-claro p-6 text-center">
        <CircleCheck className="size-12 text-emerald-500" />
        <p className="text-sm">Se existir uma conta para <b>{enviadoPara}</b>, você vai receber um link em alguns minutos.</p>
      </div>
      <Button href="/login" bloco className="mt-5">Voltar para o login</Button>
    </AuthCard>
  );

  return (
    <AuthCard titulo="Recuperar senha" subtitulo="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {erro && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-brand-dark" role="alert">{erro}</p>}
        <Input rotulo="E-mail" type="email" icone={<Mail />} placeholder="voce@email.com" {...form.campo("email")} />
        <Button type="submit" bloco tamanho="lg" carregando={form.enviando}>Enviar link</Button>
      </form>
      <p className="mt-5 text-center text-sm"><Link href="/login" className="font-semibold text-brand hover:underline">Voltar para o login</Link></p>
    </AuthCard>
  );
}
