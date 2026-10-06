// Tipos de dados da plataforma StreetCar

export type Carroceria = "Hatch" | "Sedã" | "SUV" | "Cupê" | "Picape";
export type Cambio = "Manual" | "Automático";
export type Combustivel = "Flex" | "Gasolina" | "Diesel" | "Elétrico" | "Híbrido";
export type StatusAnuncio = "ativo" | "pausado" | "vendido";
export type StatusProposta = "pendente" | "aceita" | "recusada" | "cancelada";
export type TipoNotificacao = "mensagem" | "proposta" | "evento" | "avaliacao" | "sistema" | "moderacao";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
  bio: string;
  admin: boolean;
  loja: boolean;
  bloqueado: boolean;
  criadoEm: number;
  favoritos: string[];
}

export interface Anuncio {
  id: string;
  userId: string;
  marca: string;
  modelo: string;
  versao: string;
  ano: number;
  km: number;
  preco: number;
  placa: string;
  cambio: Cambio;
  combustivel: Combustivel;
  carroceria: Carroceria;
  cor: string;
  cidade: string;
  uf: string;
  descricao: string;
  fotos: string[];
  aceitaTroca: boolean;
  destaque: boolean;
  status: StatusAnuncio;
  views: number;
  criadoEm: number;
}

export interface Proposta {
  id: string;
  tipo: "compra" | "troca";
  anuncioId: string;
  deId: string;
  paraId: string;
  valor?: number;
  anuncioOfertadoId?: string;
  diferenca?: number; // positivo = quem propõe paga; negativo = quem propõe recebe
  mensagem: string;
  status: StatusProposta;
  criadoEm: number;
}

export interface Conversa {
  id: string;
  participantes: [string, string];
  anuncioId?: string;
  ultimaEm: number;
}

export interface Mensagem {
  id: string;
  conversaId: string;
  deId: string;
  texto: string;
  criadoEm: number;
  lida: boolean;
}

export interface Encontro {
  id: string;
  organizadorId: string;
  titulo: string;
  categoria: string;
  data: string; // AAAA-MM-DD
  hora: string; // HH:MM
  local: string;
  cidade: string;
  uf: string;
  capacidade: number | null;
  descricao: string;
  confirmados: string[];
  cancelado: boolean;
}

export interface Avaliacao {
  id: string;
  deId: string;
  paraId: string;
  nota: number;
  comentario: string;
  criadoEm: number;
}

export interface Notificacao {
  id: string;
  userId: string;
  tipo: TipoNotificacao;
  texto: string;
  link: string;
  lida: boolean;
  criadoEm: number;
}

export interface Denuncia {
  id: string;
  tipo: "anúncio" | "encontro" | "usuário";
  alvoId: string;
  userId: string;
  motivo: string;
  resolvida: boolean;
  criadoEm: number;
}

export interface BancoDeDados {
  versao: number;
  usuarios: (Usuario & { senha: string })[];
  anuncios: Anuncio[];
  propostas: Proposta[];
  conversas: Conversa[];
  mensagens: Mensagem[];
  encontros: Encontro[];
  avaliacoes: Avaliacao[];
  notificacoes: Notificacao[];
  denuncias: Denuncia[];
}

export interface FiltrosBusca {
  q?: string;
  marca?: string;
  anoMin?: string;
  anoMax?: string;
  precoMax?: string;
  kmMax?: string;
  uf?: string;
  carroceria?: string;
  cambio?: string;
  combustivel?: string;
  troca?: boolean;
  ordem?: "recentes" | "menorPreco" | "maiorPreco" | "menorKm" | "maisNovo";
}
