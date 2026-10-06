"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import type { Anuncio, Cambio, Carroceria, Combustivel } from "@/types";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/contexts/ToastContext";
import { anuncios } from "@/services/api";
import { CAMBIOS, CARROCERIAS, CIDADES, COMBUSTIVEIS, MARCAS, UFS } from "@/lib/constants";
import { mascaraAno, mascaraMilhar, mascaraMoeda, mascaraPlaca, paraNumero } from "@/lib/masks";
import { maximo, numeroEntre, obrigatorio, placa } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/FormFields";
import { Card } from "@/components/ui/Misc";
import { AdCard } from "./AdCard";

const anoMax = new Date().getFullYear() + 1;

/** Reduz a foto antes de guardar (para não estourar o armazenamento) */
function reduzirFoto(arquivo: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!arquivo.type.startsWith("image/")) return reject(new Error("O arquivo precisa ser uma imagem."));
    if (arquivo.size > 10 * 1024 * 1024) return reject(new Error("Imagem muito grande (máximo 10 MB)."));
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    img.src = URL.createObjectURL(arquivo);
  });
}

export function AdForm({ usuarioId, anuncio, cidadePadrao = "Blumenau", ufPadrao = "SC" }: { usuarioId: string; anuncio?: Anuncio; cidadePadrao?: string; ufPadrao?: string }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [fotos, setFotos] = useState<string[]>(anuncio?.fotos ?? []);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const form = useForm(
    {
      marca: anuncio?.marca ?? "", modelo: anuncio?.modelo ?? "", versao: anuncio?.versao ?? "",
      ano: anuncio ? String(anuncio.ano) : "", km: anuncio ? mascaraMilhar(String(anuncio.km)) : "", preco: anuncio ? mascaraMoeda(String(anuncio.preco)) : "",
      placa: anuncio?.placa ?? "", carroceria: anuncio?.carroceria ?? "Hatch", cambio: anuncio?.cambio ?? "Manual", combustivel: anuncio?.combustivel ?? "Flex",
      cor: anuncio?.cor ?? "#e30613", uf: anuncio?.uf ?? ufPadrao, cidade: anuncio?.cidade ?? cidadePadrao, descricao: anuncio?.descricao ?? "", aceitaTroca: anuncio?.aceitaTroca ?? false,
    },
    {
      marca: [obrigatorio("Escolha a marca.")],
      modelo: [obrigatorio("Informe o modelo."), maximo(40)],
      versao: [maximo(60)],
      ano: [obrigatorio("Informe o ano."), numeroEntre(1900, anoMax, `Ano entre 1900 e ${anoMax}.`)],
      km: [obrigatorio("Informe a quilometragem."), numeroEntre(0, 2_000_000, "Quilometragem inválida.")],
      preco: [obrigatorio("Informe o preço."), numeroEntre(1000, 50_000_000, "O preço precisa ser de pelo menos R$ 1.000.")],
      placa: [placa],
      cidade: [obrigatorio("Escolha a cidade.")],
      descricao: [maximo(2000)],
    },
    { ano: mascaraAno, km: mascaraMilhar, preco: mascaraMoeda, placa: mascaraPlaca },
  );
  const v = form.valores;

  async function adicionarFotos(e: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []).slice(0, 6 - fotos.length);
    e.target.value = "";
    setEnviandoFoto(true);
    for (const arq of arquivos) {
      try { const f = await reduzirFoto(arq); setFotos((l) => [...l, f]); } catch (err) { mostrar((err as Error).message, "erro"); }
    }
    setEnviandoFoto(false);
  }

  const enviar = form.enviar(async (val) => {
    try {
      const salvo = await anuncios.salvar({
        id: anuncio?.id, userId: usuarioId, marca: val.marca, modelo: val.modelo.trim(), versao: val.versao.trim(), ano: paraNumero(val.ano), km: paraNumero(val.km),
        preco: paraNumero(val.preco), placa: val.placa, carroceria: val.carroceria as Carroceria, cambio: val.cambio as Cambio, combustivel: val.combustivel as Combustivel,
        cor: val.cor, cidade: val.cidade, uf: val.uf, descricao: val.descricao.trim(), aceitaTroca: Boolean(val.aceitaTroca), fotos,
      });
      mostrar(anuncio ? "Anúncio atualizado!" : "Anúncio publicado!");
      router.push(`/anuncios/${salvo.id}`);
    } catch (e) { mostrar((e as Error).message, "erro"); }
  });

  const previa: Anuncio = {
    id: anuncio?.id ?? "previa", userId: usuarioId, marca: v.marca || "Marca", modelo: v.modelo || "Modelo", versao: v.versao, ano: paraNumero(v.ano) || anoMax - 1,
    km: paraNumero(v.km), preco: paraNumero(v.preco), placa: v.placa, carroceria: v.carroceria as Carroceria, cambio: v.cambio as Cambio, combustivel: v.combustivel as Combustivel,
    cor: v.cor, cidade: v.cidade, uf: v.uf, descricao: "", fotos, aceitaTroca: Boolean(v.aceitaTroca), destaque: false, status: "ativo", views: 0, criadoEm: anuncio?.criadoEm ?? 0,
  };

  return (
    <form onSubmit={enviar} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-lg">Veículo</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select rotulo="Marca" obrigatorio vazio="Selecione" opcoes={MARCAS} {...form.campo("marca")} />
            <Input rotulo="Modelo" obrigatorio placeholder="Ex.: Civic" {...form.campo("modelo")} />
            <Input rotulo="Versão" placeholder="Ex.: EXL 2.0" {...form.campo("versao")} />
            <Input rotulo="Ano" obrigatorio inputMode="numeric" placeholder="2020" {...form.campo("ano")} />
            <Input rotulo="Quilometragem" obrigatorio inputMode="numeric" placeholder="Ex.: 85.000" {...form.campo("km")} />
            <Input rotulo="Preço" obrigatorio inputMode="numeric" placeholder="R$" {...form.campo("preco")} />
            <Input rotulo="Placa" placeholder="ABC1D23" ajuda="Só o final aparece no anúncio." {...form.campo("placa")} />
            <Select rotulo="Carroceria" opcoes={CARROCERIAS} {...form.campo("carroceria")} />
            <Select rotulo="Câmbio" opcoes={CAMBIOS} {...form.campo("cambio")} />
            <Select rotulo="Combustível" opcoes={COMBUSTIVEIS} {...form.campo("combustivel")} />
            <Input rotulo="Cor" type="color" className="h-11 p-1" {...form.campo("cor")} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-lg">Localização e detalhes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select rotulo="Estado" opcoes={UFS} value={v.uf} onChange={(e) => form.setValores((x) => ({ ...x, uf: e.target.value, cidade: CIDADES[e.target.value][0] }))} />
            <Select rotulo="Cidade" obrigatorio opcoes={CIDADES[v.uf] ?? []} {...form.campo("cidade")} />
          </div>
          <div className="mt-4 space-y-4">
            <Textarea rotulo="Descrição" placeholder="Estado de conservação, revisões, opcionais..." ajuda={`${v.descricao.length}/2000`} {...form.campo("descricao")} />
            <Checkbox rotulo="Aceito propostas de troca" {...form.caixa("aceitaTroca")} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-1 text-lg">Fotos <span className="text-sm font-normal text-cinza">(até 6)</span></h2>
          <p className="mb-4 text-sm text-cinza">Sem fotos, o anúncio mostra uma ilustração na cor e carroceria escolhidas.</p>
          <div className="flex flex-wrap gap-3">
            {fotos.map((f, i) => (
              <div key={i} className="relative h-24 w-32 overflow-hidden rounded-xl border border-linha">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-brand px-1.5 text-[10px] font-bold text-white">Capa</span>}
                <button type="button" onClick={() => setFotos((l) => l.filter((_, j) => j !== i))} aria-label="Remover foto" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-navy text-white"><X className="size-3.5" /></button>
              </div>
            ))}
            {fotos.length < 6 && (
              <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-cinza-claro text-sm text-cinza hover:border-navy hover:text-navy">
                <ImagePlus className="size-6" /> {enviandoFoto ? "Enviando..." : "Adicionar"}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={adicionarFotos} disabled={enviandoFoto} />
              </label>
            )}
          </div>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variante="secundario" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" tamanho="lg" carregando={form.enviando}>{anuncio ? "Salvar alterações" : "Publicar anúncio"}</Button>
        </div>
      </div>
      <aside className="lg:sticky lg:top-24">
        <p className="mb-2 text-sm font-semibold text-cinza">Pré-visualização</p>
        <div className="pointer-events-none"><AdCard anuncio={previa} semComparar /></div>
      </aside>
    </form>
  );
}
