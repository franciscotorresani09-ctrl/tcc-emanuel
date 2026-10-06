"use client";

import { useMemo } from "react";
import type { Anuncio } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormFields";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/contexts/ToastContext";
import { mascaraMoeda, paraNumero } from "@/lib/masks";
import { maximo, numeroEntre, obrigatorio } from "@/lib/validators";
import { formatarPreco } from "@/lib/format";
import { propostas } from "@/services/api";
import { AdImage } from "./AdImage";

function Resumo({ anuncio }: { anuncio: Anuncio }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl bg-cinza-claro p-2.5">
      <AdImage anuncio={anuncio} className="h-14 w-24 rounded-lg bg-white" />
      <div><p className="font-semibold">{anuncio.marca} {anuncio.modelo} {anuncio.ano}</p><p className="text-sm text-cinza">Anunciado por {formatarPreco(anuncio.preco)}</p></div>
    </div>
  );
}

/** Proposta de compra em dinheiro */
export function ProposalModal({ anuncio, usuarioId, aberto, aoFechar }: { anuncio: Anuncio; usuarioId: string; aberto: boolean; aoFechar: () => void }) {
  const { mostrar } = useToast();
  const form = useForm(
    { valor: mascaraMoeda(String(Math.round((anuncio.preco * 0.95) / 100) * 100)), mensagem: "" },
    { valor: [obrigatorio("Informe o valor da proposta."), numeroEntre(1000, 50_000_000, "O valor precisa ser de pelo menos R$ 1.000.")], mensagem: [maximo(500)] },
    { valor: mascaraMoeda },
  );

  const enviar = form.enviar(async (v) => {
    try {
      await propostas.criar({ tipo: "compra", anuncioId: anuncio.id, deId: usuarioId, paraId: anuncio.userId, valor: paraNumero(v.valor), mensagem: v.mensagem });
      mostrar("Proposta enviada! Você será avisado da resposta.");
      aoFechar();
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Fazer proposta de compra">
      <Resumo anuncio={anuncio} />
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Input rotulo="Valor oferecido" obrigatorio inputMode="numeric" {...form.campo("valor")} />
        <Textarea rotulo="Mensagem para o vendedor" placeholder="Ex.: pagamento à vista, posso ver no sábado?" maxLength={500} {...form.campo("mensagem")} />
        <div className="flex justify-end gap-2">
          <Button type="button" variante="secundario" onClick={aoFechar}>Cancelar</Button>
          <Button type="submit" carregando={form.enviando}>Enviar proposta</Button>
        </div>
      </form>
    </Modal>
  );
}

/** Proposta de troca: oferece um carro do usuário + diferença em dinheiro */
export function TradeModal({ anuncio, usuarioId, meusAnuncios, aberto, aoFechar, carroInicial }: {
  anuncio: Anuncio; usuarioId: string; meusAnuncios: Anuncio[]; aberto: boolean; aoFechar: () => void; carroInicial?: string;
}) {
  const { mostrar } = useToast();
  const inicial = meusAnuncios.find((a) => a.id === carroInicial) ?? meusAnuncios[0];
  const sugerir = (meu?: Anuncio) => {
    const d = meu ? anuncio.preco - meu.preco : 0;
    return { lado: d > 0 ? "pago" : d < 0 ? "recebo" : "nenhuma", diferenca: d ? mascaraMoeda(String(Math.abs(d))) : "" };
  };
  const form = useForm(
    { carro: inicial?.id ?? "", ...sugerir(inicial), mensagem: "" },
    { carro: [obrigatorio("Escolha o carro que você oferece.")], mensagem: [maximo(500)] },
    { diferenca: mascaraMoeda },
  );
  const meu = meusAnuncios.find((a) => a.id === form.valores.carro);
  const dif = form.valores.lado === "nenhuma" ? 0 : paraNumero(form.valores.diferenca) * (form.valores.lado === "pago" ? 1 : -1);
  const resumo = useMemo(() => meu
    ? `Seu ${meu.modelo} (${formatarPreco(meu.preco)}) ${dif > 0 ? `+ ${formatarPreco(dif)} em dinheiro` : dif < 0 ? `− ${formatarPreco(-dif)} que você recebe` : "sem dinheiro"} = oferta de ${formatarPreco(meu.preco + dif)}`
    : "", [meu, dif]);

  const enviar = form.enviar(async (v) => {
    try {
      await propostas.criar({ tipo: "troca", anuncioId: anuncio.id, deId: usuarioId, paraId: anuncio.userId, anuncioOfertadoId: v.carro, diferenca: dif, mensagem: v.mensagem });
      mostrar("Proposta de troca enviada!");
      aoFechar();
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Propor troca">
      <Resumo anuncio={anuncio} />
      {meusAnuncios.length === 0 ? (
        <div className="text-center">
          <p className="text-sm text-cinza">Para propor uma troca, você precisa ter um veículo anunciado.</p>
          <Button href="/anunciar" className="mt-4">Anunciar meu veículo</Button>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Qual veículo você oferece?</legend>
            <div className="flex flex-col gap-2">
              {meusAnuncios.map((a) => (
                <label key={a.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 ${form.valores.carro === a.id ? "border-navy bg-cinza-claro" : "border-linha"}`}>
                  <input type="radio" name="carro" className="accent-brand" checked={form.valores.carro === a.id}
                    onChange={() => form.setValores((v) => ({ ...v, carro: a.id, ...sugerir(a) }))} />
                  <AdImage anuncio={a} className="h-11 w-18 rounded-md" />
                  <span className="text-sm"><b>{a.marca} {a.modelo} {a.ano}</b><br /><span className="text-cinza">{formatarPreco(a.preco)}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select rotulo="Diferença" opcoes={[{ valor: "pago", texto: "Eu pago a diferença" }, { valor: "recebo", texto: "Quero receber" }, { valor: "nenhuma", texto: "Troca direta" }]}
              value={form.valores.lado} onChange={(e) => form.mudar("lado", e.target.value)} />
            <Input rotulo="Valor da diferença" inputMode="numeric" disabled={form.valores.lado === "nenhuma"} {...form.campo("diferenca")} />
          </div>
          {resumo && <p className="rounded-lg bg-cinza-claro px-3 py-2 text-sm">{resumo}</p>}
          <Textarea rotulo="Mensagem" placeholder="Conte sobre o estado do seu veículo..." {...form.campo("mensagem")} />
          <div className="flex justify-end gap-2">
            <Button type="button" variante="secundario" onClick={aoFechar}>Cancelar</Button>
            <Button type="submit" carregando={form.enviando}>Enviar proposta de troca</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
