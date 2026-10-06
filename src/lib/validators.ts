// Regras de validação reutilizáveis.
// Cada regra recebe o valor do campo (e todos os valores do formulário)
// e devolve a mensagem de erro, ou null quando está tudo certo.

import { paraNumero } from "./masks";

export type Valores = Record<string, string | boolean>;
export type Regra = (valor: string | boolean, todos: Valores) => string | null;

const texto = (v: string | boolean) => (typeof v === "string" ? v.trim() : "");

export const obrigatorio = (msg = "Campo obrigatório."): Regra => (v) =>
  (typeof v === "boolean" ? v : texto(v).length > 0) ? null : msg;

export const email: Regra = (v) =>
  !texto(v) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto(v)) ? null : "Digite um e-mail válido.";

export const minimo = (n: number, msg?: string): Regra => (v) =>
  !texto(v) || texto(v).length >= n ? null : msg ?? `Mínimo de ${n} caracteres.`;

export const maximo = (n: number): Regra => (v) =>
  texto(v).length <= n ? null : `Máximo de ${n} caracteres.`;

export const telefone: Regra = (v) => {
  const d = texto(v).replace(/\D/g, "");
  return !d || d.length >= 10 ? null : "Telefone incompleto (inclua o DDD).";
};

export const igualA = (campo: string, msg: string): Regra => (v, todos) => (v === todos[campo] ? null : msg);

export const numeroEntre = (min: number, max: number, msg: string): Regra => (v) => {
  if (!texto(v)) return null;
  const n = paraNumero(texto(v));
  return n >= min && n <= max ? null : msg;
};

export const placa: Regra = (v) =>
  !texto(v) || /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/.test(texto(v)) ? null : "Placa inválida (ex.: ABC1D23).";

export const dataFutura: Regra = (v) => {
  if (!texto(v)) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return new Date(`${texto(v)}T00:00`) >= hoje ? null : "A data precisa ser hoje ou depois.";
};

/** Executa as regras de todos os campos e devolve um objeto { campo: mensagem } */
export function validar(valores: Valores, regras: Record<string, Regra[]>) {
  const erros: Record<string, string> = {};
  for (const [campo, lista] of Object.entries(regras)) {
    for (const regra of lista) {
      const msg = regra(valores[campo] ?? "", valores);
      if (msg) {
        erros[campo] = msg;
        break;
      }
    }
  }
  return erros;
}
