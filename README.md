# Nativa Store

**E-commerce full-stack de artesanato brasileiro** — da vitrine ao painel administrativo, com carrinho persistente, checkout, autenticação de clientes e migração real a partir da Nuvemshop.

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

Não é um tutorial de carrinho em `localStorage`. É uma **loja virtual completa**, pensada para operação real:

- Catálogo migrado de uma loja Nuvemshop existente (CSV + scraping de imagens)
- API REST com regras de negócio no servidor (não no client)
- Painel admin com dashboard, pedidos, clientes, notificações e importação em massa
- Carrinho que une visitante anônimo e cliente autenticado
- Deploy serverless na Vercel com frontend + API no mesmo repositório

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

### Engenharia

- Validação compartilhada com **Zod** (client + server)
- Tipos e mappers em `shared/` (snake_case DB ↔ camelCase TS)
- Admin carregado com **lazy route** (não infla o bundle da loja pública)
- Scripts de seed, migração Nuvemshop e setup de storage
- Analytics leve de page views por sessão de visitante

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, Wouter, Framer Motion |
| UI | Radix UI / shadcn-style, Recharts, Sonner, Fancybox |
| Backend | Node.js, Express 4, TypeScript (`tsx` em dev) |
| Dados | Supabase (PostgreSQL + Auth + Storage) |
| Validação | Zod |
| Deploy | Vercel (SPA + serverless API) |
| Package manager | pnpm |

```
Browser  →  Vite (dev) / estáticos (prod)
                ↓  /api/*
            Express
                ↓
            Supabase (PostgreSQL · Auth · Storage)
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

---

## Screenshots

> Substitua pelos prints reais do deploy — recrutadores abrem o README e param nos visuais.

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

## Destaques técnicos (para entrevista)

1. **Migração de plataforma** — parser de CSV Tiendanube (latin1, multilinha) + extração de imagens da loja publicada, não só “dados mock”.
2. **Carrinho híbrido** — sessão anônima (cookie) + merge idempotente ao autenticar.
3. **Admin serverless-friendly** — JWT em cookie `httpOnly`, sem sessão em memória.
4. **Código compartilhado** — schemas Zod e tipos únicos evitam drift entre formulário e API.
5. **Operação de loja** — importação em massa, notificações, dashboard e gestão de pedidos/clientes.

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
