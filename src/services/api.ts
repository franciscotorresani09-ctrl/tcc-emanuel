// API simulada do StreetCar.
// Nesta entrega (front-end), os dados ficam no localStorage do navegador e cada
// chamada tem um pequeno atraso, como uma API de verdade. Na integração com o
// back-end, só este arquivo precisa ser trocado por chamadas ao servidor/Firebase.

import type {
  Anuncio, Avaliacao, BancoDeDados, Conversa, Denuncia, Encontro, FiltrosBusca, Mensagem,
  Notificacao, Proposta, StatusProposta, TipoNotificacao, Usuario,
} from "@/types";
import { criarBancoInicial } from "./seed";

const CHAVE_BANCO = "streetcar_next_db_v1";
const CHAVE_SESSAO = "streetcar_next_sessao";
const CHAVE_ERRO = "streetcar_next_simular_erro";

/* ---------- infraestrutura ---------- */
let banco: BancoDeDados | null = null;
const ouvintes = new Set<() => void>();
let versao = 0;

/** Número que muda a cada alteração dos dados (para o useSyncExternalStore) */
export const versaoDosDados = () => versao;

function db(): BancoDeDados {
  if (banco) return banco;
  try {
    const salvo = localStorage.getItem(CHAVE_BANCO);
    banco = salvo ? (JSON.parse(salvo) as BancoDeDados) : criarBancoInicial();
  } catch {
    banco = criarBancoInicial();
  }
  // grava sem avisar ninguém: pode estar acontecendo durante uma renderização
  try { localStorage.setItem(CHAVE_BANCO, JSON.stringify(banco)); } catch { /* sem armazenamento */ }
  return banco;
}

function salvar() {
  try { localStorage.setItem(CHAVE_BANCO, JSON.stringify(banco)); } catch { /* armazenamento cheio */ }
  versao++;
  ouvintes.forEach((f) => f());
}

/** Componentes podem se inscrever para saber quando os dados mudaram */
export function aoMudar(f: () => void) {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

export class ErroApi extends Error {}

/** Simula a latência da rede e, se ativado, uma falha de conexão */
async function rede<T>(fn: () => T, ms = 450): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 300));
  if (simulandoErro()) throw new ErroApi("Não foi possível conectar ao servidor. Verifique sua conexão.");
  return fn();
}

export const simulandoErro = () => typeof window !== "undefined" && localStorage.getItem(CHAVE_ERRO) === "1";
export function alternarSimulacaoDeErro() {
  if (simulandoErro()) localStorage.removeItem(CHAVE_ERRO); else localStorage.setItem(CHAVE_ERRO, "1");
  versao++;
  ouvintes.forEach((f) => f());
  return simulandoErro();
}

export function restaurarDadosDeExemplo() {
  banco = criarBancoInicial();
  salvar();
}

const id = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
function semSenha(u: Usuario & { senha: string }): Usuario {
  const copia: Partial<Usuario & { senha: string }> = { ...u };
  delete copia.senha;
  return copia as Usuario;
}

function notificar(userId: string, tipo: TipoNotificacao, texto: string, link: string) {
  db().notificacoes.push({ id: id("n"), userId, tipo, texto, link, lida: false, criadoEm: Date.now() });
}

/* ---------- autenticação ---------- */
export const sessaoAtual = () => (typeof window === "undefined" ? null : localStorage.getItem(CHAVE_SESSAO));

export const auth = {
  usuarioLogado(): Usuario | null {
    const uid = sessaoAtual();
    const u = uid ? db().usuarios.find((x) => x.id === uid) : null;
    return u && !u.bloqueado ? semSenha(u) : null;
  },
  entrar: (email: string, senha: string) => rede(() => {
    const u = db().usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.senha !== senha) throw new ErroApi("E-mail ou senha incorretos.");
    if (u.bloqueado) throw new ErroApi("Esta conta foi bloqueada pela moderação.");
    localStorage.setItem(CHAVE_SESSAO, u.id);
    salvar();
    return semSenha(u);
  }, 700),
  entrarComGoogle: () => rede(() => {
    // Simulação: na integração com o back-end, aqui entra o Firebase Authentication.
    let u = db().usuarios.find((x) => x.email === "google.demo@gmail.com");
    if (!u) {
      u = { id: id("u"), nome: "Visitante Google", email: "google.demo@gmail.com", telefone: "", cidade: "Blumenau", uf: "SC", bio: "",
        admin: false, loja: false, bloqueado: false, criadoEm: Date.now(), favoritos: [], senha: "" };
      db().usuarios.push(u);
    }
    localStorage.setItem(CHAVE_SESSAO, u.id);
    salvar();
    return semSenha(u);
  }, 900),
  cadastrar: (dados: { nome: string; email: string; telefone: string; senha: string; cidade: string; uf: string }) => rede(() => {
    if (db().usuarios.some((x) => x.email.toLowerCase() === dados.email.toLowerCase())) throw new ErroApi("Este e-mail já está cadastrado.");
    const u = { id: id("u"), ...dados, email: dados.email.toLowerCase(), bio: "", admin: false, loja: false, bloqueado: false, criadoEm: Date.now(), favoritos: [] };
    db().usuarios.push(u);
    notificar(u.id, "sistema", "Bem-vindo ao StreetCar! Complete seu perfil e publique seu primeiro anúncio.", "/perfil");
    localStorage.setItem(CHAVE_SESSAO, u.id);
    salvar();
    return semSenha(u);
  }, 800),
  recuperarSenha: (email: string) => rede(() => {
    if (!db().usuarios.some((x) => x.email.toLowerCase() === email.toLowerCase())) throw new ErroApi("Não encontramos uma conta com este e-mail.");
    return true;
  }, 800),
  sair() {
    localStorage.removeItem(CHAVE_SESSAO);
    salvar();
  },
};

/* ---------- usuários ---------- */
export const usuarios = {
  listar: () => rede(() => db().usuarios.map(semSenha)),
  buscar: (uid: string) => rede(() => {
    const u = db().usuarios.find((x) => x.id === uid);
    if (!u) throw new ErroApi("Usuário não encontrado.");
    return semSenha(u);
  }),
  porIdSync: (uid: string) => {
    const u = db().usuarios.find((x) => x.id === uid);
    return u ? semSenha(u) : null;
  },
  atualizar: (uid: string, dados: Partial<Pick<Usuario, "nome" | "telefone" | "cidade" | "uf" | "bio">>) => rede(() => {
    Object.assign(db().usuarios.find((x) => x.id === uid)!, dados);
    salvar();
  }, 600),
  alternarFavorito: (uid: string, anuncioId: string) => {
    const u = db().usuarios.find((x) => x.id === uid)!;
    const tinha = u.favoritos.includes(anuncioId);
    u.favoritos = tinha ? u.favoritos.filter((x) => x !== anuncioId) : [...u.favoritos, anuncioId];
    salvar();
    return !tinha;
  },
  alternarBloqueio: (uid: string) => rede(() => {
    const u = db().usuarios.find((x) => x.id === uid)!;
    u.bloqueado = !u.bloqueado;
    salvar();
    return u.bloqueado;
  }),
  reputacao(uid: string) {
    const rs = db().avaliacoes.filter((r) => r.paraId === uid);
    return { media: rs.length ? rs.reduce((s, r) => s + r.nota, 0) / rs.length : 0, total: rs.length };
  },
};

/* ---------- anúncios ---------- */
export const anuncios = {
  listar: (f: FiltrosBusca = {}) => rede(() => {
    let l = db().anuncios.filter((a) => a.status === "ativo");
    const q = (f.q ?? "").toLowerCase().trim();
    if (q) l = l.filter((a) => `${a.marca} ${a.modelo} ${a.versao} ${a.cidade}`.toLowerCase().includes(q));
    if (f.marca) l = l.filter((a) => a.marca === f.marca);
    if (f.anoMin) l = l.filter((a) => a.ano >= Number(f.anoMin));
    if (f.anoMax) l = l.filter((a) => a.ano <= Number(f.anoMax));
    if (f.precoMax) l = l.filter((a) => a.preco <= Number(f.precoMax));
    if (f.kmMax) l = l.filter((a) => a.km <= Number(f.kmMax));
    if (f.uf) l = l.filter((a) => a.uf === f.uf);
    if (f.carroceria) l = l.filter((a) => a.carroceria === f.carroceria);
    if (f.cambio) l = l.filter((a) => a.cambio === f.cambio);
    if (f.combustivel) l = l.filter((a) => a.combustivel === f.combustivel);
    if (f.troca) l = l.filter((a) => a.aceitaTroca);
    const ordens: Record<string, (a: Anuncio, b: Anuncio) => number> = {
      recentes: (a, b) => b.criadoEm - a.criadoEm,
      menorPreco: (a, b) => a.preco - b.preco,
      maiorPreco: (a, b) => b.preco - a.preco,
      menorKm: (a, b) => a.km - b.km,
      maisNovo: (a, b) => b.ano - a.ano,
    };
    const ord = ordens[f.ordem ?? "recentes"];
    return [...l].sort((a, b) => Number(b.destaque) - Number(a.destaque) || ord(a, b));
  }),
  doUsuario: (uid: string) => rede(() => db().anuncios.filter((a) => a.userId === uid).sort((a, b) => b.criadoEm - a.criadoEm)),
  porIds: (ids: string[]) => rede(() => ids.map((i) => db().anuncios.find((a) => a.id === i)).filter((a): a is Anuncio => !!a)),
  buscar: (aid: string) => rede(() => {
    const a = db().anuncios.find((x) => x.id === aid);
    if (!a) throw new ErroApi("Anúncio não encontrado ou removido.");
    return { ...a };
  }),
  registrarVisualizacao(aid: string) {
    const a = db().anuncios.find((x) => x.id === aid);
    if (a) { a.views += 1; salvar(); }
  },
  salvar: (dados: Omit<Anuncio, "id" | "views" | "criadoEm" | "status" | "destaque"> & { id?: string }) => rede(() => {
    if (dados.id) {
      const a = db().anuncios.find((x) => x.id === dados.id)!;
      Object.assign(a, dados);
      salvar();
      return a;
    }
    const novo: Anuncio = { ...dados, id: id("a"), views: 0, criadoEm: Date.now(), status: "ativo", destaque: false };
    db().anuncios.push(novo);
    salvar();
    return novo;
  }, 900),
  mudarStatus: (aid: string, status: Anuncio["status"]) => rede(() => {
    db().anuncios.find((x) => x.id === aid)!.status = status;
    salvar();
  }),
  destacar: (aid: string) => rede(() => {
    db().anuncios.find((x) => x.id === aid)!.destaque = true;
    salvar();
  }, 1000),
  excluir: (aid: string) => rede(() => {
    const d = db();
    d.anuncios = d.anuncios.filter((x) => x.id !== aid);
    d.propostas = d.propostas.filter((p) => p.anuncioId !== aid && p.anuncioOfertadoId !== aid);
    salvar();
  }),
};

/* ---------- propostas ---------- */
export const propostas = {
  listar: (uid: string, aba: "recebidas" | "enviadas") => rede(() =>
    db().propostas.filter((p) => (aba === "recebidas" ? p.paraId === uid : p.deId === uid)).sort((a, b) => b.criadoEm - a.criadoEm)),
  criar: (p: Omit<Proposta, "id" | "status" | "criadoEm">) => rede(() => {
    if (db().propostas.some((x) => x.anuncioId === p.anuncioId && x.deId === p.deId && x.status === "pendente")) {
      throw new ErroApi("Você já tem uma proposta pendente para este veículo.");
    }
    const nova: Proposta = { ...p, id: id("p"), status: "pendente", criadoEm: Date.now() };
    db().propostas.push(nova);
    const a = db().anuncios.find((x) => x.id === p.anuncioId)!;
    const de = db().usuarios.find((x) => x.id === p.deId)!;
    notificar(p.paraId, "proposta", p.tipo === "troca" ? `${de.nome} propôs uma troca pelo seu ${a.marca} ${a.modelo}.` : `${de.nome} fez uma proposta pelo seu ${a.marca} ${a.modelo}.`, "/propostas");
    salvar();
    return nova;
  }, 800),
  mudarStatus: (pid: string, status: StatusProposta) => rede(() => {
    const p = db().propostas.find((x) => x.id === pid)!;
    p.status = status;
    const a = db().anuncios.find((x) => x.id === p.anuncioId);
    const nome = a ? `${a.marca} ${a.modelo}` : "o veículo";
    if (status === "aceita") notificar(p.deId, "proposta", `Sua proposta pelo ${nome} foi aceita!`, "/propostas?aba=enviadas");
    if (status === "recusada") notificar(p.deId, "proposta", `Sua proposta pelo ${nome} foi recusada.`, "/propostas?aba=enviadas");
    if (status === "cancelada") notificar(p.paraId, "proposta", `Uma proposta pelo ${nome} foi cancelada.`, "/propostas");
    salvar();
  }),
};

/* ---------- chat ---------- */
const respostasAutomaticas = ["Oi! Tudo bem? Pode perguntar o que quiser.", "Está disponível sim!", "Podemos marcar para você ver o carro no sábado.", "Aceito propostas, pode mandar pelo botão do anúncio.", "Combinado! 👍"];

export const chat = {
  conversas: (uid: string) => rede(() => {
    const d = db();
    return d.conversas.filter((c) => c.participantes.includes(uid)).sort((a, b) => b.ultimaEm - a.ultimaEm).map((c) => {
      const msgs = d.mensagens.filter((m) => m.conversaId === c.id);
      return { ...c, ultima: msgs[msgs.length - 1] as Mensagem | undefined, naoLidas: msgs.filter((m) => m.deId !== uid && !m.lida).length };
    });
  }, 300),
  mensagens: (cid: string, uid: string) => rede(() => {
    const d = db();
    let mudou = false;
    d.mensagens.forEach((m) => { if (m.conversaId === cid && m.deId !== uid && !m.lida) { m.lida = true; mudou = true; } });
    d.notificacoes.forEach((n) => { if (n.userId === uid && n.link === `/chat?c=${cid}` && !n.lida) { n.lida = true; mudou = true; } });
    if (mudou) salvar();
    return d.mensagens.filter((m) => m.conversaId === cid).sort((a, b) => a.criadoEm - b.criadoEm);
  }, 250),
  abrirConversa: (a: string, b: string, anuncioId?: string) => rede(() => {
    const d = db();
    let c = d.conversas.find((x) => x.participantes.includes(a) && x.participantes.includes(b) && x.anuncioId === anuncioId);
    if (!c) {
      c = { id: id("c"), participantes: [a, b], anuncioId, ultimaEm: Date.now() } as Conversa;
      d.conversas.push(c);
      salvar();
    }
    return c;
  }, 300),
  enviar: (cid: string, deId: string, texto: string) => rede(() => {
    const d = db();
    const c = d.conversas.find((x) => x.id === cid)!;
    d.mensagens.push({ id: id("m"), conversaId: cid, deId, texto, criadoEm: Date.now(), lida: false });
    c.ultimaEm = Date.now();
    const outro = c.participantes.find((x) => x !== deId)!;
    const nome = d.usuarios.find((x) => x.id === deId)!.nome;
    notificar(outro, "mensagem", `Nova mensagem de ${nome}.`, `/chat?c=${cid}`);
    salvar();
    // usuários de exemplo respondem sozinhos, para a demonstração
    if (["u_carla", "u_rafael", "u_bruna", "u_vale"].includes(outro)) {
      setTimeout(() => {
        const n = d.mensagens.filter((m) => m.conversaId === cid).length;
        d.mensagens.push({ id: id("m"), conversaId: cid, deId: outro, texto: respostasAutomaticas[n % respostasAutomaticas.length], criadoEm: Date.now(), lida: false });
        c.ultimaEm = Date.now();
        notificar(deId, "mensagem", `Nova mensagem de ${d.usuarios.find((x) => x.id === outro)!.nome}.`, `/chat?c=${cid}`);
        salvar();
      }, 1800);
    }
  }, 200),
  naoLidas: (uid: string) => {
    const d = db();
    const minhas = new Set(d.conversas.filter((c) => c.participantes.includes(uid)).map((c) => c.id));
    return d.mensagens.filter((m) => minhas.has(m.conversaId) && m.deId !== uid && !m.lida).length;
  },
};

/* ---------- encontros ---------- */
export const encontros = {
  listar: (f: { categoria?: string; uf?: string } = {}) => rede(() =>
    db().encontros.filter((e) => !e.cancelado && (!f.categoria || e.categoria === f.categoria) && (!f.uf || e.uf === f.uf))
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))),
  buscar: (eid: string) => rede(() => {
    const e = db().encontros.find((x) => x.id === eid);
    if (!e) throw new ErroApi("Encontro não encontrado.");
    return { ...e, confirmados: [...e.confirmados] };
  }),
  criar: (e: Omit<Encontro, "id" | "confirmados" | "cancelado">) => rede(() => {
    const novo: Encontro = { ...e, id: id("e"), confirmados: [e.organizadorId], cancelado: false };
    db().encontros.push(novo);
    salvar();
    return novo;
  }, 900),
  alternarPresenca: (eid: string, uid: string) => rede(() => {
    const e = db().encontros.find((x) => x.id === eid)!;
    const vai = e.confirmados.includes(uid);
    if (!vai && e.capacidade && e.confirmados.length >= e.capacidade) throw new ErroApi("Este encontro está lotado.");
    e.confirmados = vai ? e.confirmados.filter((x) => x !== uid) : [...e.confirmados, uid];
    if (!vai && e.organizadorId !== uid) notificar(e.organizadorId, "evento", `${db().usuarios.find((x) => x.id === uid)!.nome} confirmou presença em "${e.titulo}".`, `/encontros/${e.id}`);
    salvar();
    return !vai;
  }),
  cancelar: (eid: string) => rede(() => {
    const e = db().encontros.find((x) => x.id === eid)!;
    e.cancelado = true;
    e.confirmados.filter((x) => x !== e.organizadorId).forEach((u) => notificar(u, "evento", `O encontro "${e.titulo}" foi cancelado.`, "/encontros"));
    salvar();
  }),
};

/* ---------- avaliações ---------- */
export const avaliacoes = {
  doUsuario: (uid: string) => rede(() => db().avaliacoes.filter((r) => r.paraId === uid).sort((a, b) => b.criadoEm - a.criadoEm)),
  enviar: (r: Omit<Avaliacao, "id" | "criadoEm">) => rede(() => {
    const d = db();
    const existente = d.avaliacoes.find((x) => x.deId === r.deId && x.paraId === r.paraId);
    if (existente) Object.assign(existente, r, { criadoEm: Date.now() });
    else d.avaliacoes.push({ ...r, id: id("r"), criadoEm: Date.now() });
    notificar(r.paraId, "avaliacao", `${d.usuarios.find((x) => x.id === r.deId)!.nome} avaliou você com ${r.nota} estrela${r.nota > 1 ? "s" : ""}.`, `/usuarios/${r.paraId}`);
    salvar();
  }, 700),
};

/* ---------- notificações ---------- */
export const notificacoes = {
  listar: (uid: string) => rede(() => db().notificacoes.filter((n) => n.userId === uid).sort((a, b) => b.criadoEm - a.criadoEm), 300),
  naoLidas: (uid: string) => db().notificacoes.filter((n) => n.userId === uid && !n.lida).length,
  marcarLida(nid: string) {
    const n = db().notificacoes.find((x) => x.id === nid);
    if (n && !n.lida) { n.lida = true; salvar(); }
  },
  marcarTodas: (uid: string) => rede(() => {
    db().notificacoes.forEach((n) => { if (n.userId === uid) n.lida = true; });
    salvar();
  }, 300),
};

/* ---------- moderação ---------- */
export const moderacao = {
  denunciar: (d: Omit<Denuncia, "id" | "resolvida" | "criadoEm">) => rede(() => {
    db().denuncias.push({ ...d, id: id("d"), resolvida: false, criadoEm: Date.now() });
    db().usuarios.filter((u) => u.admin).forEach((a) => notificar(a.id, "moderacao", `Nova denúncia: ${d.motivo}`, "/admin"));
    salvar();
  }, 700),
  painel: () => rede(() => {
    const d = db();
    return {
      numeros: {
        usuarios: d.usuarios.length,
        anuncios: d.anuncios.filter((a) => a.status === "ativo").length,
        encontros: d.encontros.filter((e) => !e.cancelado).length,
        propostas: d.propostas.length,
        mensagens: d.mensagens.length,
        denuncias: d.denuncias.filter((x) => !x.resolvida).length,
      },
      denuncias: [...d.denuncias].sort((a, b) => Number(a.resolvida) - Number(b.resolvida) || b.criadoEm - a.criadoEm),
      usuarios: d.usuarios.map(semSenha),
    };
  }),
  resolver: (did: string, remover: boolean) => rede(() => {
    const d = db();
    const den = d.denuncias.find((x) => x.id === did)!;
    if (remover) {
      if (den.tipo === "anúncio") d.anuncios = d.anuncios.filter((a) => a.id !== den.alvoId);
      if (den.tipo === "encontro") { const e = d.encontros.find((x) => x.id === den.alvoId); if (e) e.cancelado = true; }
      if (den.tipo === "usuário") { const u = d.usuarios.find((x) => x.id === den.alvoId); if (u) u.bloqueado = true; }
    }
    d.denuncias.filter((x) => x.alvoId === den.alvoId).forEach((x) => { x.resolvida = true; });
    salvar();
  }),
};

/* Acesso síncrono para exibir nomes e títulos (sem estado de carregamento) */
export const consulta = {
  usuario: (uid: string) => usuarios.porIdSync(uid),
  anuncio: (aid: string) => db().anuncios.find((a) => a.id === aid) ?? null,
  usuarioTemAnuncios: (uid: string) => db().anuncios.filter((a) => a.userId === uid && a.status === "ativo"),
  podeAvaliar: (de: string, para: string) => {
    const d = db();
    return de !== para && (d.conversas.some((c) => c.participantes.includes(de) && c.participantes.includes(para))
      || d.propostas.some((p) => (p.deId === de && p.paraId === para) || (p.deId === para && p.paraId === de)));
  },
};

export type ConversaResumo = Conversa & { ultima?: Mensagem; naoLidas: number };
export type { Notificacao };
