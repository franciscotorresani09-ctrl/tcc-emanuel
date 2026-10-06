// Máscaras de entrada: formatam o valor enquanto o usuário digita

const digitos = (v: string) => v.replace(/\D/g, "");

/** (47) 99999-9999 ou (47) 3333-4444 */
export function mascaraTelefone(v: string) {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** R$ 58.900 (sem centavos) */
export function mascaraMoeda(v: string) {
  const d = digitos(v).slice(0, 9);
  if (!d) return "";
  return `R$ ${Number(d).toLocaleString("pt-BR")}`;
}

/** 142.000 */
export function mascaraMilhar(v: string) {
  const d = digitos(v).slice(0, 7);
  return d ? Number(d).toLocaleString("pt-BR") : "";
}

/** Placa antiga (ABC-1234) ou Mercosul (ABC1D23) */
export function mascaraPlaca(v: string) {
  const s = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (s.length > 3 && /^[A-Z]{3}\d{4}$/.test(s)) return `${s.slice(0, 3)}-${s.slice(3)}`;
  return s;
}

/** 4 dígitos */
export const mascaraAno = (v: string) => digitos(v).slice(0, 4);

/** Converte valor mascarado em número ("R$ 58.900" → 58900) */
export const paraNumero = (v: string) => Number(digitos(v) || 0);
