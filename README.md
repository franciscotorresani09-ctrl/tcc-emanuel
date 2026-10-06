# StreetCar — Front-end (Next.js)

Plataforma para **comprar, vender e trocar carros**, conversar por **chat** e marcar **encontros automotivos**.
Projeto de TCC — Desenvolvimento de Sistemas — CEDUP Hermann Hering (Blumenau/SC).

**Equipe:** Francisco Torresani, Gustavo Marques Borborema, Eduardo Ventura e Thiago Amorim
**Orientador:** Prof. Ricardo Romero Maranhão Castro

> Entrega parcial: **front-end com todas as telas do backlog do produto**. Os dados vêm de uma **API simulada** (`src/services/api.ts`) que guarda as informações no navegador e responde com atraso, como um servidor de verdade. Na próxima etapa, só esse arquivo será trocado pela integração com o back-end (Firebase).

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **Next.js 16** (App Router) | Estrutura da aplicação, rotas e navegação |
| **React 19** + **TypeScript** | Componentes e tipagem |
| **Tailwind CSS 4** | Estilos e layout responsivo, com as cores da identidade visual no `@theme` |
| **Lucide React** | Ícones |
| **next/font** | Fontes da marca: Montserrat (títulos) e Inter (textos) |

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

| Conta de demonstração | E-mail | Senha |
|---|---|---|
| Usuário | `demo@streetcar.com` | `123456` |
| Moderador | `admin@streetcar.com` | `admin123` |

Outros comandos: `npm run build` (versão de produção), `npm run start` (roda a versão de produção) e `npm run lint` (verificação do código).

## Requisitos da entrega → onde estão

| Requisito | Onde está no projeto |
|---|---|
| **Aplicação Next.js** | App Router em `src/app/` |
| **Organização das pastas** | Veja a seção [Arquitetura](#arquitetura) |
| **Tailwind CSS** | Todas as telas; tema da marca em `src/app/globals.css` |
| **Layout responsivo** | Grades que se adaptam (`sm:` / `md:` / `lg:`), menu hambúrguer no celular, filtros recolhíveis, chat em uma coluna no celular |
| **Navegação entre telas** | `next/link` e `useRouter`; menu com a página atual destacada; rotas protegidas voltam ao login (`?volta=`); `not-found.tsx` |
| **Componentização** | `src/components/` — UI reutilizável (`Button`, `Input`, `Select`, `Modal`, `Badge`, `Tabs`, estados…) e componentes de domínio (`AdCard`, `AdForm`, `EventCard`, `ProfileView`…) |
| **Ícones** | `lucide-react` em toda a interface |
| **Formulários** | Login, cadastro, recuperar senha, anunciar/editar veículo, proposta de compra, proposta de troca, criar encontro, editar perfil, avaliação e denúncia |
| **Máscaras de entrada** | `src/lib/masks.ts`: telefone `(47) 99999-9999`, preço `R$ 58.900`, quilometragem `72.000`, ano (4 dígitos) e placa (`ABC1D23` / `ABC-1234`) |
| **Validações de campos** | `src/lib/validators.ts` + hook `useForm`: obrigatório, e-mail, tamanho mínimo/máximo, telefone, placa, faixa de valores, data futura e confirmação de senha. As mensagens aparecem ao sair do campo ou ao enviar |
| **Mensagens de feedback / Toast** | `src/contexts/ToastContext.tsx`: avisos de sucesso, erro e informação |
| **Estado carregando** | Esqueletos (`Skeleton`, `AdGridSkeleton`…), botões com spinner (`carregando`) e `loading.tsx` |
| **Estado vazio** | `EstadoVazio`: busca sem resultado, sem favoritos, sem propostas, sem conversas… |
| **Estado de erro** | `EstadoErro` com botão **"Tentar de novo"** e `error.tsx`. Para demonstrar, use o botão **"Simular falha de conexão"** no rodapé |
| **Estado de sucesso** | Toasts de confirmação, tela "Verifique seu e-mail" na recuperação de senha, selos "Aceita"/"Você vai" |

## Telas (backlog do produto)

| Tela | Rota |
|---|---|
| Início | `/` |
| Comprar (busca com filtros na URL) | `/comprar` |
| Trocar (diferença em dinheiro calculada) | `/trocar` |
| Detalhe do anúncio | `/anuncios/[id]` |
| Anunciar veículo / editar anúncio | `/anunciar`, `/anuncios/[id]/editar` |
| Meus anúncios | `/meus-anuncios` |
| Propostas (recebidas e enviadas) | `/propostas` |
| Chat (com nova conversa e respostas em tempo real) | `/chat` |
| Encontros, detalhe do encontro e criar encontro | `/encontros`, `/encontros/[id]`, `/encontros/novo` |
| Meu perfil e perfil público (com avaliações) | `/perfil`, `/usuarios/[id]` |
| Notificações | `/notificacoes` |
| Favoritos e comparar veículos | `/favoritos`, `/comparar` |
| Entrar, criar conta e recuperar senha | `/login`, `/cadastro`, `/recuperar-senha` |
| Painel de moderação (administrador) | `/admin` |
| Termos de uso e privacidade (LGPD) | `/termos` |
| Página não encontrada | qualquer rota inexistente |

## Arquitetura

```
src/
├── app/                      # Rotas (App Router): cada pasta é uma URL
│   ├── (auth)/               # Grupo de rotas: login, cadastro, recuperar-senha
│   ├── anuncios/[id]/        # Rota dinâmica: detalhe e /editar
│   ├── comprar/  trocar/  chat/  encontros/  propostas/ ...
│   ├── layout.tsx            # Layout raiz: fontes, provedores, cabeçalho e rodapé
│   ├── loading.tsx           # Estado de carregamento entre rotas
│   ├── error.tsx             # Tela de erro inesperado
│   └── not-found.tsx         # Página 404
├── components/
│   ├── ui/                   # Componentes genéricos e reutilizáveis
│   ├── layout/               # Header, Footer, AuthCard
│   ├── anuncios/             # AdCard, AdForm, AdFilters, modais de proposta...
│   ├── encontros/            # EventCard
│   └── usuarios/             # ProfileView, modais de avaliação e denúncia
├── contexts/                 # AuthContext (usuário logado) e ToastContext (avisos)
├── hooks/                    # useAsync (estados), useForm (formulários), useComparar, useExigirLogin
├── lib/                      # masks, validators, format, constants
├── services/                 # api.ts (API simulada) e seed.ts (dados de exemplo)
└── types/                    # Tipos TypeScript do domínio
```

**Fluxo dos dados:** a página chama a API pelo hook `useAsync`, que controla os estados *carregando → sucesso/erro*. Ao gravar algo, a API avisa os inscritos. Assim, o cabeçalho, o chat e as notificações se atualizam sozinhos.

## Identidade visual

Azul Noite `#0F172A` · Vermelho `#E30613` · Cinza `#6B7280` · Cinza Claro `#F3F4F6` · Branco — Montserrat Bold e Inter.
