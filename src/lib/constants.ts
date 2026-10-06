import type { Cambio, Carroceria, Combustivel } from "@/types";

export const MARCAS = ["Audi", "BMW", "Chevrolet", "Fiat", "Ford", "Honda", "Hyundai", "Jeep", "Mercedes-Benz",
  "Mitsubishi", "Nissan", "Peugeot", "Renault", "Subaru", "Toyota", "Volkswagen"];
export const CARROCERIAS: Carroceria[] = ["Hatch", "Sedã", "SUV", "Cupê", "Picape"];
export const CAMBIOS: Cambio[] = ["Manual", "Automático"];
export const COMBUSTIVEIS: Combustivel[] = ["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido"];
export const CATEGORIAS_ENCONTRO = ["Encontro", "Antigos", "JDM", "Track Day", "Off-road", "Exposição", "Café & Carros"];
export const UFS = ["SC", "PR", "RS", "SP", "RJ", "MG"];
export const CIDADES: Record<string, string[]> = {
  SC: ["Blumenau", "Joinville", "Florianópolis", "Itajaí", "Balneário Camboriú", "Brusque", "Pomerode", "Jaraguá do Sul", "Chapecó", "Criciúma"],
  PR: ["Curitiba", "Londrina", "Maringá"],
  RS: ["Porto Alegre", "Caxias do Sul"],
  SP: ["São Paulo", "Campinas"],
  RJ: ["Rio de Janeiro"],
  MG: ["Belo Horizonte"],
};
export const MOTIVOS_DENUNCIA = ["Possível golpe / fraude", "Informações falsas", "Conteúdo ofensivo", "Veículo já vendido", "Outro"];
