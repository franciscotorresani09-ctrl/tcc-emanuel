// Dados de exemplo usados na primeira vez que o site abre
import type { Anuncio, BancoDeDados, Encontro } from "@/types";

const DIA = 86_400_000;

function dataDaqui(dias: number) {
  const d = new Date(Date.now() + dias * DIA);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function criarBancoInicial(): BancoDeDados {
  const agora = Date.now();
  const u = (id: string, nome: string, email: string, telefone: string, cidade: string, extra: object = {}) => ({
    id, nome, email, telefone, cidade, uf: "SC", bio: "", admin: false, loja: false, bloqueado: false,
    criadoEm: agora - 200 * DIA, favoritos: [] as string[], senha: "123456", ...extra,
  });

  const usuarios = [
    u("u_demo", "Usuário Demo", "demo@streetcar.com", "(47) 98888-1111", "Blumenau", { bio: "Conta de demonstração. Fique à vontade para testar!" }),
    u("u_admin", "Administrador StreetCar", "admin@streetcar.com", "(47) 99999-0000", "Blumenau", { admin: true, senha: "admin123", bio: "Equipe de moderação." }),
    u("u_carla", "Carla Menezes", "carla@exemplo.com", "(47) 99111-2233", "Joinville", { bio: "Apaixonada por JDM e track days." }),
    u("u_rafael", "Rafael Kuhn", "rafael@exemplo.com", "(47) 99222-3344", "Pomerode", { bio: "Restauro carros antigos há 15 anos." }),
    u("u_bruna", "Bruna Albuquerque", "bruna@exemplo.com", "(48) 99333-4455", "Florianópolis", { bio: "Organizo o Café & Carros da Ilha." }),
    u("u_vale", "Vale Auto Seminovos", "contato@valeauto.com", "(47) 3333-5566", "Itajaí", { loja: true, bio: "Seminovos com procedência e garantia." }),
  ];

  let n = 0;
  const a = (o: Partial<Anuncio> & Pick<Anuncio, "userId" | "marca" | "modelo" | "ano" | "km" | "preco">, dias: number): Anuncio => ({
    id: `a${++n}`, versao: "", placa: "", cambio: "Manual", combustivel: "Flex", carroceria: "Sedã", cor: "#0f172a",
    cidade: "Blumenau", uf: "SC", descricao: "", fotos: [], aceitaTroca: false, destaque: false, status: "ativo",
    views: 40 + ((n * 37) % 250), criadoEm: agora - dias * DIA, ...o,
  });

  const anuncios: Anuncio[] = [
    a({ userId: "u_carla", marca: "Honda", modelo: "Civic", versao: "Si 2.0 16V", ano: 2008, km: 142000, preco: 58900, combustivel: "Gasolina", cor: "#e30613", cidade: "Joinville", aceitaTroca: true, destaque: true, descricao: "Civic Si original, motor K20 com 192 cv. Revisões em dia, pneus novos." }, 2),
    a({ userId: "u_vale", marca: "Volkswagen", modelo: "Golf", versao: "GTI 2.0 TSI", ano: 2014, km: 88000, preco: 112000, cambio: "Automático", combustivel: "Gasolina", carroceria: "Hatch", cor: "#e5e7eb", cidade: "Itajaí", destaque: true, descricao: "Golf GTI MK7 com teto solar e laudo cautelar aprovado." }, 1),
    a({ userId: "u_rafael", marca: "Chevrolet", modelo: "Opala", versao: "Comodoro 4.1", ano: 1979, km: 97000, preco: 69000, combustivel: "Gasolina", carroceria: "Cupê", cor: "#0f172a", cidade: "Pomerode", aceitaTroca: true, descricao: "Opala 6 cilindros, placa preta, restaurado com peças originais." }, 5),
    a({ userId: "u_vale", marca: "Toyota", modelo: "Corolla", versao: "XEi 2.0", ano: 2020, km: 41000, preco: 118500, cambio: "Automático", cor: "#6b7280", cidade: "Itajaí", descricao: "Único dono, revisões na concessionária." }, 3),
    a({ userId: "u_demo", marca: "Fiat", modelo: "Uno", versao: "Mille Way 1.0", ano: 2012, km: 120000, preco: 24900, carroceria: "Hatch", cor: "#d1d5db", aceitaTroca: true, descricao: "Econômico, ótimo para o dia a dia." }, 8),
    a({ userId: "u_carla", marca: "Mitsubishi", modelo: "Lancer", versao: "Evolution X", ano: 2012, km: 67000, preco: 215000, combustivel: "Gasolina", cor: "#f8fafc", cidade: "Joinville", destaque: true, descricao: "Evo X com tração integral, 295 cv." }, 4),
    a({ userId: "u_bruna", marca: "Ford", modelo: "Mustang", versao: "GT 5.0 V8", ano: 2018, km: 32000, preco: 349000, cambio: "Automático", combustivel: "Gasolina", carroceria: "Cupê", cor: "#1f2937", cidade: "Florianópolis", aceitaTroca: true, descricao: "Mustang GT Premium, escapamento ativo." }, 6),
    a({ userId: "u_rafael", marca: "Volkswagen", modelo: "Fusca", versao: "1300", ano: 1972, km: 150000, preco: 32000, combustivel: "Gasolina", carroceria: "Cupê", cor: "#e30613", cidade: "Pomerode", aceitaTroca: true, descricao: "Fusca 72 original, pintura refeita." }, 10),
    a({ userId: "u_vale", marca: "Jeep", modelo: "Compass", versao: "Longitude 1.3 T270", ano: 2022, km: 28000, preco: 142900, cambio: "Automático", carroceria: "SUV", cor: "#334155", cidade: "Itajaí", descricao: "Compass seminovo com pacote de tecnologia." }, 2),
    a({ userId: "u_bruna", marca: "BMW", modelo: "320i", versao: "Sport GP 2.0 Turbo", ano: 2017, km: 64000, preco: 129000, cambio: "Automático", cor: "#0b0b0b", cidade: "Florianópolis", descricao: "BMW 320i revisada, pneus novos." }, 9),
    a({ userId: "u_vale", marca: "Toyota", modelo: "Hilux", versao: "SRV 2.8 4x4", ano: 2019, km: 89000, preco: 219000, cambio: "Automático", combustivel: "Diesel", carroceria: "Picape", cor: "#9ca3af", cidade: "Itajaí", descricao: "Hilux 4x4 com capota marítima." }, 7),
    a({ userId: "u_demo", marca: "Hyundai", modelo: "HB20", versao: "Comfort 1.0", ano: 2019, km: 54000, preco: 59900, carroceria: "Hatch", cor: "#475569", descricao: "HB20 completo, único dono." }, 15),
  ];

  const e = (o: Partial<Encontro> & Pick<Encontro, "id" | "organizadorId" | "titulo" | "categoria" | "data" | "hora" | "local" | "cidade">): Encontro => ({
    uf: "SC", capacidade: 100, descricao: "", confirmados: [], cancelado: false, ...o,
  });
  const encontros: Encontro[] = [
    e({ id: "e1", organizadorId: "u_rafael", titulo: "Encontro de Antigos na Vila Germânica", categoria: "Antigos", data: dataDaqui(4), hora: "09:00", local: "Parque Vila Germânica", cidade: "Blumenau", capacidade: 200, confirmados: ["u_carla", "u_bruna"], descricao: "Encontro mensal de carros antigos e clássicos, com food trucks e música ao vivo." }),
    e({ id: "e2", organizadorId: "u_carla", titulo: "Noite JDM Itajaí", categoria: "JDM", data: dataDaqui(9), hora: "19:30", local: "Estacionamento do Centreventos", cidade: "Itajaí", capacidade: 120, confirmados: ["u_vale"], descricao: "Encontro de carros japoneses. Proibido som alto e cavalo de pau." }),
    e({ id: "e3", organizadorId: "u_bruna", titulo: "Café & Carros da Ilha", categoria: "Café & Carros", data: dataDaqui(14), hora: "08:00", local: "Beira-Mar Norte", cidade: "Florianópolis", capacidade: 80, confirmados: ["u_rafael", "u_carla", "u_vale"], descricao: "Domingo de manhã: café, conversa e carros bonitos." }),
    e({ id: "e4", organizadorId: "u_carla", titulo: "Track Day Joinville", categoria: "Track Day", data: dataDaqui(21), hora: "07:30", local: "Autódromo Internacional de SC", cidade: "Joinville", capacidade: 40, descricao: "Baterias de 20 minutos e briefing de segurança obrigatório." }),
  ];

  const avaliacoes = [
    { id: "r1", deId: "u_bruna", paraId: "u_carla", nota: 5, comentario: "Negociação tranquila e carro exatamente como no anúncio.", criadoEm: agora - 40 * DIA },
    { id: "r2", deId: "u_rafael", paraId: "u_carla", nota: 4, comentario: "Pessoa honesta, recomendo.", criadoEm: agora - 60 * DIA },
    { id: "r3", deId: "u_carla", paraId: "u_rafael", nota: 5, comentario: "Conhece muito de antigos.", criadoEm: agora - 30 * DIA },
    { id: "r4", deId: "u_bruna", paraId: "u_vale", nota: 4, comentario: "Loja séria, entregou o carro revisado.", criadoEm: agora - 20 * DIA },
    { id: "r5", deId: "u_carla", paraId: "u_demo", nota: 5, comentario: "Ótimo comprador!", criadoEm: agora - 12 * DIA },
  ];

  return {
    versao: 1, usuarios, anuncios, encontros, avaliacoes,
    propostas: [
      { id: "p1", tipo: "compra", anuncioId: "a5", deId: "u_carla", paraId: "u_demo", valor: 23000, mensagem: "Pago à vista, posso buscar no sábado.", status: "pendente", criadoEm: agora - 2 * 3_600_000 },
    ],
    conversas: [{ id: "c1", participantes: ["u_demo", "u_carla"], anuncioId: "a1", ultimaEm: agora - 3_600_000 }],
    mensagens: [
      { id: "m1", conversaId: "c1", deId: "u_demo", texto: "Olá! O Civic ainda está disponível?", criadoEm: agora - 2 * 3_600_000, lida: true },
      { id: "m2", conversaId: "c1", deId: "u_carla", texto: "Está sim! Quer marcar para ver?", criadoEm: agora - 3_600_000, lida: false },
    ],
    notificacoes: [
      { id: "n1", userId: "u_demo", tipo: "proposta", texto: "Carla Menezes fez uma proposta de R$ 23.000 pelo seu Fiat Uno.", link: "/propostas", lida: false, criadoEm: agora - 2 * 3_600_000 },
      { id: "n2", userId: "u_demo", tipo: "mensagem", texto: "Nova mensagem de Carla Menezes.", link: "/chat?c=c1", lida: false, criadoEm: agora - 3_600_000 },
      { id: "n3", userId: "u_demo", tipo: "avaliacao", texto: "Carla Menezes avaliou você com 5 estrelas.", link: "/perfil", lida: true, criadoEm: agora - 12 * DIA },
    ],
    denuncias: [
      { id: "d1", tipo: "anúncio", alvoId: "a7", userId: "u_demo", motivo: "Informações falsas — ano não confere", resolvida: false, criadoEm: agora - DIA },
    ],
  };
}
