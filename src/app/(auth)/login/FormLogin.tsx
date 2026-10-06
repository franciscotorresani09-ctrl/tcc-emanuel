"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { auth } from "@/services/api";
import { email, obrigatorio } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";
import { AuthCard, Divisor, IconeGoogle } from "@/components/layout/AuthCard";

export function FormLogin() {
  const router = useRouter();
  const volta = useSearchParams().get("volta") || "/";
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const [google, setGoogle] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const form = useForm({ email: "", senha: "" }, { email: [obrigatorio("Informe seu e-mail."), email], senha: [obrigatorio("Informe sua senha.")] });

  useEffect(() => { if (usuario) router.replace(volta); }, [usuario, volta, router]);

  const enviar = form.enviar(async (v) => {
    setErroGeral("");
    try {
      const u = await auth.entrar(v.email, v.senha);
      mostrar(`Olá, ${u.nome.split(" ")[0]}!`);
    } catch (e) { setErroGeral((e as Error).message); }
  });

  async function entrarGoogle() {
    setGoogle(true);
    try { const u = await auth.entrarComGoogle(); mostrar(`Olá, ${u.nome.split(" ")[0]}! (login com Google simulado nesta entrega)`); }
    catch (e) { mostrar((e as Error).message, "erro"); } finally { setGoogle(false); }
  }

  return (
    <AuthCard titulo="Entrar" subtitulo="Bem-vindo de volta ao StreetCar.">
      <Button variante="secundario" bloco carregando={google} icone={<IconeGoogle />} onClick={entrarGoogle}>Continuar com o Google</Button>
      <Divisor />
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        {erroGeral && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-brand-dark" role="alert">{erroGeral}</p>}
        <Input rotulo="E-mail" type="email" autoComplete="email" icone={<Mail />} placeholder="voce@email.com" {...form.campo("email")} />
        <Input rotulo="Senha" type="password" autoComplete="current-password" icone={<Lock />} {...form.campo("senha")} />
        <Link href="/recuperar-senha" className="-mt-2 self-end text-sm font-semibold text-brand hover:underline">Esqueci minha senha</Link>
        <Button type="submit" bloco tamanho="lg" carregando={form.enviando}>Entrar</Button>
      </form>
      <p className="mt-5 text-center text-sm text-cinza">Não tem conta? <Link href={`/cadastro?volta=${encodeURIComponent(volta)}`} className="font-semibold text-brand hover:underline">Cadastre-se</Link></p>
      <div className="mt-5 rounded-xl bg-cinza-claro p-3 text-xs">
        <p className="mb-1 font-semibold">Contas de demonstração</p>
        <button type="button" className="block text-brand hover:underline" onClick={() => form.setValores({ email: "demo@streetcar.com", senha: "123456" })}>Usuário: demo@streetcar.com / 123456</button>
        <button type="button" className="block text-brand hover:underline" onClick={() => form.setValores({ email: "admin@streetcar.com", senha: "admin123" })}>Moderador: admin@streetcar.com / admin123</button>
      </div>
    </AuthCard>
  );
}
