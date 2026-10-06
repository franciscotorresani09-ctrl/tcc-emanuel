import type { Carroceria } from "@/types";

const FORMAS: Record<Carroceria, { corpo: string; vidros: string[]; rodas: number[]; r: number; y: number }> = {
  "Sedã": { corpo: "M30,130 L40,105 Q50,95 80,92 L130,88 L170,60 Q180,54 200,54 L270,54 Q290,55 305,68 L330,90 L365,96 Q380,100 382,115 L382,130 Z", vidros: ["M140,88 L175,62 L222,62 L222,88 Z", "M230,62 L270,62 Q285,63 297,75 L310,88 L230,88 Z"], rodas: [95, 312], r: 22, y: 130 },
  "Hatch": { corpo: "M40,130 L48,105 Q58,95 88,92 L135,88 L178,58 Q186,53 203,53 L282,53 Q298,54 308,66 L338,96 Q352,102 352,116 L352,130 Z", vidros: ["M145,88 L181,60 L238,60 L238,88 Z", "M246,60 L280,60 Q293,61 300,70 L316,90 L246,90 Z"], rodas: [102, 298], r: 22, y: 130 },
  "SUV": { corpo: "M30,135 L32,100 Q36,88 70,85 L120,82 L150,48 Q158,40 175,40 L330,40 Q348,41 355,58 L368,95 Q372,105 372,120 L372,135 Z", vidros: ["M130,82 L158,48 L240,48 L240,82 Z", "M248,48 L330,48 Q342,49 346,60 L355,82 L248,82 Z"], rodas: [100, 302], r: 25, y: 135 },
  "Cupê": { corpo: "M25,130 L30,110 Q40,98 80,95 L150,90 L195,64 Q205,60 220,60 L260,60 Q285,62 310,80 L340,95 L372,100 Q382,104 382,118 L382,130 Z", vidros: ["M165,90 L198,68 L240,68 L240,90 Z", "M248,68 L262,68 Q282,70 300,84 L306,90 L248,90 Z"], rodas: [92, 318], r: 22, y: 130 },
  "Picape": { corpo: "M25,132 L28,102 Q32,92 60,90 L110,88 L140,56 Q148,50 162,50 L232,50 Q242,50 244,60 L247,88 L382,88 L382,132 Z", vidros: ["M122,88 L148,58 L186,58 L186,88 Z", "M194,58 L230,58 Q236,58 237,64 L239,88 L194,88 Z"], rodas: [92, 322], r: 24, y: 132 },
};

/** Desenho do carro (usado quando o anúncio não tem foto), na cor e carroceria escolhidas */
export function CarIllustration({ cor, carroceria, className }: { cor: string; carroceria: Carroceria; className?: string }) {
  const f = FORMAS[carroceria] ?? FORMAS["Sedã"];
  return (
    <svg viewBox="0 0 410 180" className={className} role="img" aria-label={`Ilustração de um ${carroceria.toLowerCase()}`}>
      <ellipse cx="205" cy={f.y + f.r - 2} rx="185" ry="8" fill="#0f172a" opacity=".12" />
      <path d={f.corpo} fill={cor} stroke="rgba(0,0,0,.3)" strokeWidth="1.5" />
      {f.vidros.map((v) => <path key={v} d={v} fill="#0f172a" opacity=".8" />)}
      {f.rodas.map((x) => (
        <g key={x}>
          <circle cx={x} cy={f.y} r={f.r} fill="#111" />
          <circle cx={x} cy={f.y} r={f.r * 0.55} fill="#9aa0a6" />
          <circle cx={x} cy={f.y} r={f.r * 0.18} fill="#444" />
        </g>
      ))}
    </svg>
  );
}
