// Funções de formatação para exibição

export const formatarPreco = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const formatarKm = (v: number) => `${v.toLocaleString("pt-BR")} km`;

export const formatarData = (ts: number) => new Date(ts).toLocaleDateString("pt-BR");

export const formatarHora = (ts: number) =>
  new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function tempoAtras(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d} dia${d > 1 ? "s" : ""}`;
  return formatarData(ts);
}

export function dataDoEncontro(data: string, hora: string) {
  const d = new Date(`${data}T${hora}`);
  return {
    dia: String(d.getDate()).padStart(2, "0"),
    mes: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    completa: `${d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às ${hora}`,
    passou: d.getTime() < Date.now(),
  };
}

export const iniciais = (nome: string) =>
  nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

/** Junta classes CSS ignorando valores falsos */
export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");
