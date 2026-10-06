"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";
import { alternarSimulacaoDeErro, aoMudar, simulandoErro } from "@/services/api";
import { useToast } from "@/contexts/ToastContext";

export function Footer() {
  const erro = useSyncExternalStore(aoMudar, simulandoErro, () => false);
  const { mostrar } = useToast();

  function alternar() {
    const ligado = alternarSimulacaoDeErro();
    mostrar(ligado ? "Simulação de falha ligada: as próximas buscas vão dar erro." : "Simulação de falha desligada.", "info");
  }

  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Image src="/img/logo-negativa.png" alt="StreetCar — seu próximo carro, mais perto." width={633} height={316} className="h-16 w-auto" />
          <p className="mt-3 max-w-sm text-sm text-slate-400">Conecte. Encontre. Dirija. Compre, venda e encontre seu próximo carro com confiança e praticidade.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-display text-xs font-bold uppercase tracking-wider">Plataforma</p>
          <Link href="/comprar" className="text-slate-300 hover:text-white">Comprar</Link>
          <Link href="/anunciar" className="text-slate-300 hover:text-white">Anunciar</Link>
          <Link href="/encontros" className="text-slate-300 hover:text-white">Encontros</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-display text-xs font-bold uppercase tracking-wider">Institucional</p>
          <Link href="/termos" className="text-slate-300 hover:text-white">Termos de uso e privacidade</Link>
          <span className="text-slate-400">TCC — CEDUP Hermann Hering</span>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-slate-400">
          <p>O StreetCar atua apenas como intermediador entre compradores e vendedores.</p>
          <button onClick={alternar} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 hover:border-white/40" title="Para demonstrar o estado de erro das telas">
            <WifiOff className="size-3.5" /> {erro ? "Desligar falha simulada" : "Simular falha de conexão"}
          </button>
        </div>
      </div>
    </footer>
  );
}
