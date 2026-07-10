# Nativa Store

**Plataforma completa de e-commerce construída para uma operação real de artesanato brasileiro** — loja pública, painel administrativo, autenticação de clientes, carrinho persistente, checkout, migração de catálogo a partir da Nuvemshop e deploy serverless na Vercel.

> *Liberdade em cada detalhe* — marca Nativa / Quintiluz

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<!-- Substitua pela URL do deploy e por screenshots reais -->
**Demo:** _adicione a URL do deploy aqui_ · **Loja de referência:** [nativa.art.br](https://www.nativa.art.br)

---

## Por que este projeto

Diferente de demonstrações simplificadas, este projeto foi desenvolvido para representar uma operação real de e-commerce, incluindo autenticação, persistência de dados, painel administrativo e migração de um catálogo existente — não um CRUD de tutorial.

- Catálogo migrado de uma loja Nuvemshop existente, via parser de CSV e extração controlada de imagens
- A arquitetura foi desenhada para manter toda a regra de negócio no backend, evitando lógica crítica no cliente e permitindo futura evolução para múltiplos frontends
- Painel admin com dashboard, pedidos, clientes, notificações e importação em massa
- Carrinho híbrido: uma sessão anônima por cookie é unificada ao histórico do cliente no momento do login
- Deploy serverless na Vercel, com frontend e API no mesmo repositório

Ideal para demonstrar domínio de **produto end-to-end**: UX de e-commerce, arquitetura modular, autenticação, persistência e operação de loja.

---

## Funcionalidades

### Loja (cliente)

| Recurso | Detalhe |
|---------|---------|
| Catálogo e PDP | Produtos com galeria, tamanhos, cores, FAQ, materiais e história do artesão |
| Carrinho | Drawer + página dedicada; cookie de sessão para visitante; merge ao login |
| Checkout | Endereço (ViaCEP), resumo do pedido e pagamento simulado |
| Conta do cliente | Cadastro, login, recuperação de senha e verificação de e-mail (Supabase Auth) |
| Pedidos | Histórico e detalhe na área logada |
| Frete / cupom | Barra de frete grátis e cupom persistido no carrinho |

### Painel administrativo (`/admin`)

| Recurso | Detalhe |
|---------|---------|
| Dashboard | Métricas de vendas, visitas, pedidos e gráficos (Recharts) |
| Produtos | CRUD completo, upload de imagens (Supabase Storage), tags e destaques |
| Importação em massa | CSV/XLSX com pré-visualização no navegador |
| Pedidos | Lista, filtros, detalhe e alteração de status |
| Clientes | Perfil, endereços e histórico de compras |
| Notificações | Sino in-app para novos pedidos e cadastros (polling) |
| Auth admin | Senha única + JWT em cookie `httpOnly` (adequado a serverless) |

---

## Principais desafios

- Importar milhares de produtos de uma loja Nuvemshop existente, preservando variações e imagens, a partir de um CSV em `latin1` multilinha
- Unificar o carrinho de visitantes anônimos com o de clientes autenticados, sem duplicar ou perder itens no momento do login
- Compartilhar validação e tipos entre client e server sem duplicar schemas (Zod + mappers em `shared/`)
- Manter o backend stateless para funcionar em ambiente serverless (Vercel), sem sessão em memória
- Entregar um painel administrativo completo (dashboard, pedidos, clientes, notificações) sem inflar o bundle da loja pública

---

## Stack

| Área | Tecnologia |
|------|------------|
| Linguagem | TypeScript |
| Frontend | React 19, Vite 7 |
| Estilo / UI | Tailwind CSS 4, Radix UI, shadcn-style, Framer Motion |
| Roteamento | Wouter |
| Gráficos | Recharts |
| Backend | Node.js, Express 4 |
| Banco de dados | PostgreSQL (Supabase) |
| Autenticação | Supabase Auth |
| Armazenamento | Supabase Storage |
| Validação | Zod (compartilhada entre client e server) |
| Deploy | Vercel (SPA + API serverless) |
| Package manager | pnpm |

```
             React (Loja + Admin)
                     │
                     ▼
              Express REST API
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 PostgreSQL       Auth          Storage
 (Supabase)    (Supabase)     (Supabase)
```

---

## Arquitetura

Monorepo com fronteiras claras:

```
nativa-store/
├── client/          # React — UI e fetch para /api
├── server/          # Express — regras de negócio, auth, Supabase
├── shared/          # Tipos, schemas Zod, mappers, constantes
├── supabase/        # DDL (products, cart, orders, customers, analytics…)
├── docs/            # Guias operacionais (ex.: importação em massa)
└── api/             # Bundle serverless para a Vercel
```

**Princípio:** o React não acessa o banco. Toda escrita passa pela API com service role no servidor.

### Arquitetura de domínio (backend)

```
server/routes/     → validação de entrada (Zod) e parsing da request
        ↓
server/services/   → regras de negócio
        ↓
server/lib/        → acesso ao Supabase, sessão, auth, upload
        ↓
Supabase           → PostgreSQL + Auth + Storage
```

---

## Decisões de arquitetura

- Validação compartilhada com **Zod** (client + server), evitando drift entre formulário e API
- Tipos e mappers em `shared/` (snake_case DB ↔ camelCase TS)
- Admin carregado com **lazy route** (não infla o bundle da loja pública)
- API única no servidor: o client nunca acessa o Supabase diretamente
- Scripts de seed, migração Nuvemshop e setup de storage
- Analytics leve de page views por sessão de visitante

---

## Segurança

- Cookies `httpOnly` para sessão de admin e identidade de carrinho — inacessíveis via JavaScript no navegador
- Validação de entrada com Zod em toda rota da API, antes de qualquer regra de negócio
- Service Role do Supabase usada apenas no servidor — nunca é exposta ao client
- Row Level Security (RLS) habilitada nas tabelas sensíveis do Supabase (perfis, endereços, pedidos)
- Normalização de inputs (trim, formato de telefone/CEP) antes da validação

---

## Métricas do projeto

- 129 arquivos de componentes e páginas React
- 38 endpoints REST, organizados em 10 grupos de rotas
- 9 tabelas no Supabase, com RLS habilitado
- 100% TypeScript (client, server e shared)
- Validação compartilhada com Zod entre client e server
- Deploy automático via Vercel (push → build → produção)

---

## Screenshots

> Substitua pelos prints reais do deploy — recrutadores abrem o README e param nos visuais.
> Um GIF curto (10-15s) mostrando o fluxo Home → Produto → Carrinho → Checkout → Admin costuma chamar mais atenção do que vários prints estáticos.

| Loja | Admin |
|------|-------|
| ![Home](docs/screenshots/home.png) | ![Dashboard](docs/screenshots/admin-dashboard.png) |
| ![Produto](docs/screenshots/product.png) | ![Pedidos](docs/screenshots/admin-orders.png) |
| ![Carrinho](docs/screenshots/cart.png) | ![Produtos](docs/screenshots/admin-products.png) |

---

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- pnpm
- Projeto no [Supabase](https://supabase.com) com as tabelas de `supabase/*.sql`

### Setup

```bash
pnpm install
cp .env.example .env
# Preencha SUPABASE_*, ADMIN_PASSWORD e ADMIN_JWT_SECRET
```

Execute os SQLs em `supabase/` no SQL Editor do Supabase (na ordem: `setup` → `customers` → `cart` → `orders` → endereços → notificações → analytics).

```bash
pnpm setup:storage   # bucket de imagens (1x)
pnpm dev             # client :3000 + API :3001
```

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Frontend + API juntos |
| `pnpm build` | Build de produção |
| `pnpm check` | TypeScript (`tsc --noEmit`) |
| `pnpm migrate:nuvemshop` | Reimporta catálogo a partir do CSV Nuvemshop |
| `pnpm seed` | Insere produtos de exemplo |

Detalhes de variáveis e armadilhas: ver [`.env.example`](.env.example) e [`AGENTS.md`](AGENTS.md).

---

## Decisões técnicas

| Problema | Solução |
|----------|---------|
| Compartilhar validação entre client e server | Zod compartilhado em `shared/schemas` |
| Evitar lógica crítica no frontend | API Express centraliza as regras de negócio; o client só consome `/api` |
| Carrinho persistente entre visitante e cliente | Cookie de sessão para anônimo + merge idempotente ao autenticar |
| Compatibilidade com ambiente serverless | API stateless, com JWT em cookie `httpOnly` em vez de sessão em memória |
| Migração de plataforma (Nuvemshop → Supabase) | Parser de CSV `latin1` multilinha + extração controlada de imagens da loja publicada |
| Consistência entre banco (snake_case) e TS (camelCase) | Mappers dedicados em `shared/lib` (`productMapper`, `orderMapper`, `cartMapper`, `addressMapper`) |

---

## Roadmap

- [ ] Gateway de pagamento real (Pix / cartão)
- [ ] Configurações da loja no admin
- [ ] Busca e filtros avançados no catálogo
- [ ] Avaliações reais de clientes
- [ ] Migrar imagens restantes do CDN Nuvemshop → Supabase Storage

---

## Documentação interna

| Arquivo | Conteúdo |
|---------|----------|
| [`AGENTS.md`](AGENTS.md) | Onboarding técnico completo (API, SQL, convenções) |
| [`docs/importacao-em-massa.md`](docs/importacao-em-massa.md) | Guia da importação CSV/XLSX |
| [`ideas.md`](ideas.md) | Direção de design da marca |

---

## Licença

MIT — veja o arquivo de licença do repositório, se presente.

---

<p align="center">
  Feito com React, Express e Supabase · Artesanato brasileiro em código
</p>
