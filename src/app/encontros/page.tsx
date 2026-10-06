"use client";

import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useAuth } from "@/contexts/AuthContext";
import { encontros } from "@/services/api";
import { CATEGORIAS_ENCONTRO, UFS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Checkbox, Select } from "@/components/ui/FormFields";
import { Container, PageHeader } from "@/components/ui/Misc";
import { EstadoErro, EstadoVazio } from "@/components/ui/States";
import { EventCard, EventCardSkeleton } from "@/components/encontros/EventCard";

export default function PaginaEncontros() {
  const { usuario } = useAuth();
  const [f, setF] = useState({ categoria: "", uf: "", meus: false });
  const { data, error, loading, recarregar } = useAsync(() => encontros.listar({ categoria: f.categoria, uf: f.uf }), [f.categoria, f.uf]);
  const lista = (data ?? []).filter((e) => !f.meus || (usuario && (e.confirmados.includes(usuario.id) || e.organizadorId === usuario.id)));

  return (
    <Container>
      <PageHeader titulo="Encontros e eventos" subtitulo="Encontre a galera, confirme presença e leve seu carro." acao={<Button href="/encontros/novo" icone={<Plus className="size-4" />}>Criar encontro</Button>} />
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-cinza-claro p-4">
        <div className="w-48"><Select rotulo="Categoria" vazio="Todas" opcoes={CATEGORIAS_ENCONTRO} value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} /></div>
        <div className="w-36"><Select rotulo="Estado" vazio="Todos" opcoes={UFS} value={f.uf} onChange={(e) => setF({ ...f, uf: e.target.value })} /></div>
        {usuario && <div className="pb-2.5"><Checkbox rotulo="Só os que eu vou" checked={f.meus} onChange={(e) => setF({ ...f, meus: e.target.checked })} /></div>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: 6 }, (_, i) => <EventCardSkeleton key={i} />)
          : error ? <EstadoErro mensagem={error} aoTentarDeNovo={recarregar} />
          : !lista.length ? <EstadoVazio icone={<Calendar />} titulo="Nenhum encontro encontrado" texto="Que tal criar o primeiro?" acao={<Button href="/encontros/novo">Criar encontro</Button>} />
          : lista.map((e) => <EventCard key={e.id} encontro={e} />)}
      </div>
    </Container>
  );
}
