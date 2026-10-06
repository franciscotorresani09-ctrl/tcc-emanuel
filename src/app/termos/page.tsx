import type { Metadata } from "next";
import { Card, Container } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Termos de uso e privacidade" };

const secoes = [
  { t: "1. Sobre a plataforma", p: "O StreetCar conecta compradores, vendedores e entusiastas automotivos. Atuamos apenas como intermediadores: não somos parte das negociações e não nos responsabilizamos pela conclusão de compras, vendas ou trocas entre usuários." },
  { t: "2. Responsabilidades do usuário", p: "Fornecer informações verdadeiras no cadastro e nos anúncios, não publicar conteúdo falso ou ofensivo e tratar os demais usuários com respeito." },
  { t: "3. Encontros", p: "Eventos criados por usuários são de responsabilidade dos organizadores, que devem respeitar a legislação de trânsito e as normas locais." },
  { t: "4. Dados pessoais (LGPD — Lei nº 13.709/2018)", p: "Coletamos nome, e-mail, telefone, cidade, anúncios, mensagens, propostas e avaliações para exibir anúncios, permitir a comunicação entre usuários e manter a segurança da plataforma. E-mail e telefone não são exibidos publicamente. Você pode corrigir ou excluir seus dados a qualquer momento." },
  { t: "5. Moderação", p: "Qualquer usuário pode denunciar anúncios, encontros ou perfis. A moderação pode remover conteúdos e bloquear contas que violem estes termos." },
];

export default function PaginaTermos() {
  return (
    <Container estreito>
      <Card className="p-6 sm:p-10">
        <h1 className="text-3xl">Termos de Uso e Política de Privacidade</h1>
        {secoes.map((s) => (
          <section key={s.t} className="mt-7"><h2 className="text-lg">{s.t}</h2><p className="mt-2 text-sm leading-relaxed text-cinza">{s.p}</p></section>
        ))}
        <p className="mt-8 text-xs text-cinza">Protótipo acadêmico StreetCar — CEDUP Hermann Hering, 2026.</p>
      </Card>
    </Container>
  );
}
