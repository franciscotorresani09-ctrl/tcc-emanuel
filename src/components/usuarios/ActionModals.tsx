"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/FormFields";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/contexts/ToastContext";
import { maximo, obrigatorio } from "@/lib/validators";
import { MOTIVOS_DENUNCIA } from "@/lib/constants";
import { avaliacoes, moderacao } from "@/services/api";
import { cn } from "@/lib/format";
import type { Denuncia } from "@/types";

/** Denunciar anúncio, encontro ou usuário */
export function ReportModal({ tipo, alvoId, usuarioId, aberto, aoFechar }: { tipo: Denuncia["tipo"]; alvoId: string; usuarioId: string; aberto: boolean; aoFechar: () => void }) {
  const { mostrar } = useToast();
  const form = useForm({ motivo: "", detalhes: "" }, { motivo: [obrigatorio("Escolha um motivo.")], detalhes: [maximo(400)] });
  const enviar = form.enviar(async (v) => {
    try {
      await moderacao.denunciar({ tipo, alvoId, userId: usuarioId, motivo: v.detalhes ? `${v.motivo} — ${v.detalhes}` : v.motivo });
      mostrar("Denúncia enviada. A moderação vai analisar.");
      aoFechar();
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={`Denunciar ${tipo}`} largura="max-w-md">
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <Select rotulo="Motivo" obrigatorio vazio="Selecione" opcoes={MOTIVOS_DENUNCIA} {...form.campo("motivo")} />
        <Textarea rotulo="Detalhes (opcional)" {...form.campo("detalhes")} />
        <div className="flex justify-end gap-2">
          <Button type="button" variante="secundario" onClick={aoFechar}>Cancelar</Button>
          <Button type="submit" carregando={form.enviando}>Enviar denúncia</Button>
        </div>
      </form>
    </Modal>
  );
}

/** Avaliar um usuário com 1 a 5 estrelas */
export function ReviewModal({ deId, paraId, nome, aberto, aoFechar }: { deId: string; paraId: string; nome: string; aberto: boolean; aoFechar: () => void }) {
  const { mostrar } = useToast();
  const [nota, setNota] = useState(0);
  const [sobre, setSobre] = useState(0);
  const [erroNota, setErroNota] = useState(false);
  const form = useForm({ comentario: "" }, { comentario: [maximo(400)] });
  const enviar = form.enviar(async (v) => {
    if (!nota) { setErroNota(true); return; }
    try {
      await avaliacoes.enviar({ deId, paraId, nota, comentario: v.comentario });
      mostrar("Obrigado pela avaliação!");
      aoFechar();
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });
  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={`Avaliar ${nome}`} largura="max-w-md">
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col items-center gap-1">
          <div className="flex" role="radiogroup" aria-label="Nota" onMouseLeave={() => setSobre(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={nota === n} aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                onMouseEnter={() => setSobre(n)} onClick={() => { setNota(n); setErroNota(false); }} className="p-1">
                <Star className={cn("size-9 transition", n <= (sobre || nota) ? "fill-brand text-brand" : "text-gray-300")} />
              </button>
            ))}
          </div>
          {erroNota && <p className="text-xs font-medium text-brand" role="alert">Escolha de 1 a 5 estrelas.</p>}
        </div>
        <Textarea rotulo="Comentário" placeholder="Como foi a negociação?" {...form.campo("comentario")} />
        <div className="flex justify-end gap-2">
          <Button type="button" variante="secundario" onClick={aoFechar}>Cancelar</Button>
          <Button type="submit" carregando={form.enviando}>Enviar avaliação</Button>
        </div>
      </form>
    </Modal>
  );
}
