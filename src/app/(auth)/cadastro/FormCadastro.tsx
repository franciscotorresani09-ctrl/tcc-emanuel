"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, Mail, Phone, User } from "lucide-react";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { auth } from "@/services/api";
import { CIDADES, UFS } from "@/lib/constants";
import { mascaraTelefone } from "@/lib/masks";
import { email, igualA, maximo, minimo, obrigatorio, telefone, type Regra } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select } from "@/components/ui/FormFields";
import { AuthCard, Divisor, IconeGoogle } from "@/components/layout/AuthCard";

/** Senha forte: letras e números */
const senhaForte: Regra = (v) => (typeof v === "string" && v && !(/[a-zA-Z]/.test(v) && /\d/.test(v)) ? "Use letras e números na senha." : null);

function forcaDaSenha(s: string) {
  let p = 0;
  if (s.length >= 6) p++;
  if (s.length >= 10) p++;
  if (/[a-z]/i.test(s) && /\d/.test(s)) p++;
  if (/[^a-z0-9]/i.test(s)) p++;
  return [{ t: "", c: "bg-linha" }, { t: "Fraca", c: "bg-brand" }, { t: "Média", c: "bg-amber-500" }, { t: "Boa", c: "bg-emerald-500" }, { t: "Forte", c: "bg-emerald-600" }][p];
}

export function FormCadastro() {
  const router = useRouter();
  const volta = useSearchParams().get("volta") || "/";
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const [google, setGoogle] = useState(false);
  const form = useForm(
    { nome: "", email: "", telefone: "", uf: "SC", cidade: "Blumenau", senha: "", confirmar: "", termos: false },
    {
      nome: [obrigatorio("Informe seu nome completo."), minimo(3), maximo(60)],
      email: [obrigatorio("Informe seu e-mail."), email],
      telefone: [telefone],
      cidade: [obrigatorio()],
      senha: [obrigatorio("Crie uma senha."), minimo(6, "A senha precisa de pelo menos 6 caracteres."), senhaForte],
      confirmar: [obrigatorio("Repita a senha."), igualA("senha", "As senhas não conferem.")],
      termos: [obrigatorio("É preciso aceitar os termos de uso.")],
    },
    { telefone: mascaraTelefone },
  );
  const forca = forcaDaSenha(form.valores.senha);

  useEffect(() => { if (usuario) router.replace(volta); }, [usuario, volta, router]);

  const enviar = form.enviar(async (v) => {
    try {
      await auth.cadastrar({ nome: v.nome.trim(), email: v.email.trim(), telefone: v.telefone, senha: v.senha, cidade: v.cidade, uf: v.uf });
      mostrar("Conta criada! Bem-vindo ao StreetCar.");
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });

  return (
    <AuthCard titulo="Criar conta" subtitulo="Compre, venda, troque e participe de encontros.">
      <Button variante="secundario" bloco carregando={google} icone={<IconeGoogle />}
        onClick={async () => { setGoogle(true); try { await auth.entrarComGoogle(); mostrar("Conta criada com o Google (simulado nesta entrega)."); } catch (e) { mostrar((e as Error).message, "erro"); } finally { setGoogle(false); } }}>
        Continuar com o Google</Button>
      <Divisor />
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Input rotulo="Nome completo" obrigatorio autoComplete="name" icone={<User />} {...form.campo("nome")} />
        <Input rotulo="E-mail" obrigatorio type="email" autoComplete="email" icone={<Mail />} placeholder="voce@email.com" {...form.campo("email")} />
        <Input rotulo="Telefone" inputMode="tel" autoComplete="tel" icone={<Phone />} placeholder="(47) 99999-9999" {...form.campo("telefone")} />
        <div className="grid grid-cols-[100px_1fr] gap-3">
          <Select rotulo="Estado" opcoes={UFS} value={form.valores.uf} onChange={(e) => form.setValores((x) => ({ ...x, uf: e.target.value, cidade: CIDADES[e.target.value][0] }))} />
          <Select rotulo="Cidade" obrigatorio opcoes={CIDADES[form.valores.uf] ?? []} {...form.campo("cidade")} />
        </div>
        <div>
          <Input rotulo="Senha" obrigatorio type="password" autoComplete="new-password" icone={<Lock />} {...form.campo("senha")} />
          {form.valores.senha && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= ["", "Fraca", "Média", "Boa", "Forte"].indexOf(forca.t) ? forca.c : "bg-linha"}`} />)}</div>
              <span className="w-12 text-xs text-cinza">{forca.t}</span>
            </div>
          )}
        </div>
        <Input rotulo="Confirmar senha" obrigatorio type="password" autoComplete="new-password" icone={<Lock />} {...form.campo("confirmar")} />
        <Checkbox rotulo={<>Li e aceito os <Link href="/termos" target="_blank" className="font-semibold text-brand hover:underline">Termos de Uso e a Política de Privacidade</Link>.</>} {...form.caixa("termos")} />
        <Button type="submit" bloco tamanho="lg" carregando={form.enviando}>Criar conta</Button>
      </form>
      <p className="mt-5 text-center text-sm text-cinza">Já tem conta? <Link href="/login" className="font-semibold text-brand hover:underline">Entrar</Link></p>
    </AuthCard>
  );
}
