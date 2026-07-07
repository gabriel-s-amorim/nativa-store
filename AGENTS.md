# Nativa Store — Guia para Agentes de IA

> **Leia este arquivo antes de implementar qualquer módulo ou recurso novo.**
> Documentação de onboarding do projeto, atualizada após a integração com Supabase e migração da Nuvemshop.

---

## O que é este projeto

**Nativa Store** é uma loja virtual de artesanato brasileiro (bolsas, roupas, acessórios). O dono da loja é leigo em programação — prefira explicações claras e mudanças focadas.

- **Loja antiga:** Nuvemshop / Tiendanube (`https://www.nativa.art.br`)
- **Loja nova:** este repositório (React + Express + Supabase)
- **Marca:** Nativa / Quintiluz (artesanato, estética "Brasil Vivo — Artesanato com Alma")
- **Slogan oficial:** **"Liberdade em cada detalhe"** (exibido no Navbar, sob o logo, e no menu mobile)
- **Paleta principal:** `#C4522A` (terracota), `#F5F0E8` (creme), `#2D6A4F` (verde)

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, Wouter (rotas) |
| UI | Radix UI + shadcn-style components em `client/src/components/ui/` |
| Backend | Node.js, Express 4, TypeScript (`tsx` em dev) |
| Banco | **Supabase** (PostgreSQL) via `@supabase/supabase-js` |
| Validação | Zod (instalado, pouco usado ainda) |
| Package manager | **pnpm** |

**Importante:** frontend e backend ficam no **mesmo repositório** (monorepo). Não criar projeto separado sem motivo forte.

---

## Estrutura de pastas

```
nativa-store/
├── client/                 # Frontend React (Vite root)
│   ├── index.html
│   └── src/
│       ├── App.tsx         # Rotas
│       ├── pages/          # Home, ProductPage, NotFound
│       ├── components/     # UI da loja + ui/ (shadcn)
│       └── lib/products.ts # fetch da API (NÃO importa dados fixos)
├── server/                 # Backend Express
│   ├── index.ts            # Produção: API + arquivos estáticos
│   ├── dev.ts              # Dev: só API na porta 3001
│   ├── app.ts              # Factory do Express com rotas /api
│   ├── lib/supabase.ts     # Cliente Supabase (SECRET KEY)
│   ├── routes/products.ts
│   ├── services/products.ts
│   └── scripts/
│       ├── seed-products.ts        # Popula com dados de exemplo (legado)
│       └── migrate-tiendanube.ts   # Migra CSV da Nuvemshop → Supabase
├── shared/                 # Código compartilhado front/back
│   ├── types/product.ts    # Interface Product (fonte da verdade)
│   ├── lib/productMapper.ts      # snake_case DB ↔ camelCase TS
│   ├── lib/parseTiendanubeCsv.ts # Parser do export Nuvemshop
│   └── data/products.ts    # ⚠️ LEGADO — produtos fictícios de demo (não usado no site)
├── supabase/setup.sql      # DDL da tabela products
├── .env                    # Segredos (NÃO commitar)
├── .env.example
├── vite.config.ts          # Proxy /api → localhost:3001 em dev
└── tiendanube-*.csv        # Export da loja antiga (migração)
```

---

## Como rodar o projeto

### Pré-requisitos

1. Node.js instalado
2. `pnpm install` na raiz
3. Arquivo `.env` configurado (copiar de `.env.example`)
4. Tabela `products` criada no Supabase (`supabase/setup.sql`)

### Variáveis de ambiente (`.env`)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...     # Settings → API Keys → Secret keys
API_PORT=3001
NUVEMSHOP_STORE_URL=https://www.nativa.art.br   # usado na migração de imagens
```

- **Nunca** colocar `SUPABASE_SECRET_KEY` no frontend.
- Aceita também `SUPABASE_SERVICE_ROLE_KEY` (chave legacy JWT).
- Salvar o `.env` com Ctrl+S antes de rodar scripts no terminal.

### Scripts

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Sobe **frontend** (porta 3000) + **API** (porta 3001) juntos |
| `pnpm dev:client` | Só Vite |
| `pnpm dev:server` | Só API Express |
| `pnpm build` | Build Vite + bundle do server |
| `pnpm start` | Produção (`NODE_ENV=production`) |
| `pnpm check` | TypeScript sem emit |
| `pnpm seed` | Insere produtos de **exemplo** de `shared/data/products.ts` |
| `pnpm migrate:nuvemshop` | **Apaga todos os produtos** e reimporta do CSV Nuvemshop |
| `pnpm fix:images` | Corrige só as imagens dos produtos (busca na loja `nativa.art.br`) |

### Desenvolvimento (fluxo)

```
Browser → localhost:3000 (Vite)
              ↓ proxy /api/*
         localhost:3001 (Express)
              ↓
         Supabase PostgreSQL
```

Em produção, um único Express (`server/index.ts`) serve `/api/*` e os arquivos estáticos do React.

**Windows:** o script `dev` usa `pnpm exec vite` e `pnpm exec tsx` diretamente (evita bug do `concurrently` com `pnpm` aninhado).

---

## Banco de dados (Supabase)

### Tabela `products`

Definida em `supabase/setup.sql`. Campos em **snake_case** no banco, **camelCase** no TypeScript.

| Coluna DB | Tipo TS (`Product`) | Notas |
|-----------|-------------------|-------|
| `slug` | `slug` | URL única, ex: `shoulder-bag-mandala-bhbmh` |
| `name` | `name` | |
| `category` | `category` | `'Roupas' \| 'Bolsas' \| 'Acessórios'` |
| `price` | `price` | Preço atual (venda) |
| `original_price` | `originalPrice` | Preço riscado; `null` se sem promoção |
| `image` | `image` | URL da imagem principal |
| `images` | `images` | JSON array de URLs |
| `badge` / `badge_color` | `badge` / `badgeColor` | |
| `rating` / `reviews` | `rating` / `reviews` | Migração zerou; sem avaliações reais ainda |
| `featured` | `featured` | Destaque na home |
| `short_description` | `shortDescription` | |
| `description` | `description` | HTML permitido |
| `materials` | `materials` | JSON string[] |
| `care_instructions` | `careInstructions` | JSON string[] |
| `artisan` | `artisan` | JSON `{ name, region, story }` |
| `sizes` | `sizes` | JSON `[{ label, available }]` |
| `colors` | `colors` | JSON `[{ name, hex }]` |
| `sku` | `sku` | |
| `in_stock` | `inStock` | |
| `stock_count` | `stockCount` | |
| `faq` | `faq` | JSON `[{ question, answer }]` |
| `highlights` | `highlights` | JSON string[] (tags, benefícios) |

### RLS (Row Level Security)

- Leitura pública habilitada (`SELECT` para todos).
- Escrita só via **service role / secret key** no servidor.

### Mapeamento DB ↔ TS

Usar sempre `shared/lib/productMapper.ts`:
- `mapProductRowToProduct()` — leitura
- `mapProductToRow()` — escrita

---

## API REST (Express)

Base: `/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/products` | Lista todos os produtos |
| `GET` | `/api/products/:slug` | Um produto por slug; 404 se não existir |

**Ordem das rotas em `server/index.ts`:** rotas `/api` **antes** do `app.get("*")` que serve o `index.html`.

### Frontend consome assim

```typescript
// client/src/lib/products.ts
fetchProducts()           // GET /api/products
fetchProductBySlug(slug)  // GET /api/products/:slug
```

**Não** fazer o React importar `@shared/data/products` nem acessar Supabase diretamente.

---

## Estado atual dos dados (jul/2026)

- **7 produtos reais** importados da Nuvemshop via CSV
- Produtos de exemplo (`shared/data/products.ts`) **removidos** do banco
- Imagens hospedadas no CDN da Nuvemshop (`dcdn-us.mitiendanube.com`) — funcionam enquanto a loja antiga existir
- **Importante:** o CSV **não traz imagens**. Elas são buscadas automaticamente da página pública de cada produto em `nativa.art.br` (JSON embutido `"images"` + `"images_count"`). Usar `pnpm fix:images` se a galeria estiver errada.
- Produtos da Nuvemshop usam tamanho **"Único"** (CSV não exporta variantes)
- Categoria inferida: bolsas/pochetes → `Bolsas`

### Produtos migrados (slugs)

1. `shoulder-bag-mandala-bhbmh`
2. `sholder-bag-mistica-1qnjb`
3. `bolsa-encanto-quintiluz-d25st`
4. `pochete-noite-mistica-1efg1`
5. `pochete-amanita-quintiluz-abiaf`
6. `sholder-nina-magia-tropical-k3c08`
7. `sholder-magia-tropical-557me`

### Reimportar da Nuvemshop

```bash
pnpm migrate:nuvemshop
```

Lê `tiendanube-6418246-17834446675007348008384088291.csv` (ou `TIENDANUBE_CSV_PATH` no `.env`), busca imagens em `nativa.art.br`, apaga tabela e reinsere.

---

## Rotas do frontend

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | `Home` | Landing com seções (hero, coleções, sobre, etc.) |
| `/produto/:slug` | `ProductPage` | PDP completa |
| `*` | `NotFound` | 404 |

Roteamento: **Wouter** (`client/src/App.tsx`).

---

## O que JÁ existe (UI)

- Navbar, Footer, seções da home (ProductsSection, AboutSection, etc.)
- ProductCard, ProductPage com galeria, tamanhos, cores, FAQ accordion
- Design system com cores e fontes (Playfair Display, Lora, Nunito)
- Toasts (Sonner) para feedback

## O que NÃO existe ainda (oportunidades de módulo)

| Recurso | Status |
|---------|--------|
| Carrinho real | ❌ Só toast "em breve" |
| Checkout / pagamento | ❌ |
| Login de cliente | ❌ |
| Painel admin | ❌ |
| Pedidos (`orders`) | ❌ Sem tabela |
| Supabase Storage para imagens | ❌ Usando CDN Nuvemshop |
| Busca / filtros avançados | ❌ Filtro básico por categoria na home |
| Avaliações reais | ❌ Campos existem, dados zerados |
| API de escrita (CRUD admin) | ❌ Só leitura |

Ao implementar carrinho/pedidos, criar novas tabelas no Supabase e novas rotas em `server/routes/`.

---

## Convenções para novos módulos

### 1. Manter a arquitetura modular

```
client/  → só UI e fetch para /api
server/  → regras de negócio, Supabase, validação
shared/  → tipos e utilitários comuns
```

### 2. Adicionar nova entidade (ex: pedidos)

1. Criar tipo em `shared/types/`
2. SQL em `supabase/` (nova migration)
3. `server/services/` + `server/routes/`
4. Registrar rota em `server/app.ts`
5. Funções fetch em `client/src/lib/`
6. Componentes/páginas no `client/`

### 3. Paths TypeScript

```json
"@/*"      → client/src/*
"@shared/*" → shared/*
```

### 4. Estilo visual

- Seguir paleta existente (`client/src/index.css`, classes inline com `#C4522A`, etc.)
- Componentes de loja em `client/src/components/`
- Não quebrar o tema "Brasil Vivo"

### 5. Escopo mínimo

- Não refatorar código não relacionado à tarefa
- Não commitar `.env`
- Não expor secret keys no client
- Comentários só para lógica não óbvia

---

## Migração Nuvemshop — detalhes técnicos

### CSV (export Tiendanube)

- Delimitador: `;`
- Encoding: **latin1** (Windows-1252)
- Campos multilinha entre aspas (descrição HTML)
- **Não inclui URLs de imagens** — o script busca na página pública do produto

### Imagens (sem CSV)

Lógica em `shared/lib/tiendanubeImages.ts`:

1. Acessa `https://www.nativa.art.br/produtos/{slug}/`
2. Extrai o array `"images"` que vem antes de `"images_count"` no HTML da página
3. Monta URLs do CDN: `.../products/{arquivo}-480-0.webp`

**Não** coletar imagens de `"Produtos similares"` (bug corrigido em jul/2026).

Scripts:
- `pnpm fix:images` — atualiza só `image` e `images` no Supabase
- `pnpm migrate:nuvemshop` — reimporta tudo (inclui imagens corretas)

### Mapeamento CSV → Product

| Coluna CSV | Destino |
|------------|---------|
| Identificador URL | `slug` |
| Nome | `name` |
| Preço / Preço promocional | `original_price` / `price` (se promo < preço) |
| Estoque | `stock_count`, `in_stock` |
| SKU | `sku` |
| Descrição | `description` (HTML) |
| Descrição para SEO | `shortDescription` |
| Tags | `highlights` |
| Marca | `artisan.name` |
| Nome/tags | `category` inferida (regex) |

Parser: `shared/lib/parseTiendanubeCsv.ts`  
Script: `server/scripts/migrate-tiendanube.ts`

---

## Problemas conhecidos / armadilhas

1. **`.env` não salvo** — terminal lê disco, não o editor aberto
2. **`ECONNREFUSED` em `/api`** — API não subiu; verificar se `[server] API rodando em http://localhost:3001` aparece no `pnpm dev`
3. **Chave Supabase inválida** — usar Secret key completa (`sb_secret_...`) ou legacy `service_role`
4. **Imagens externas** — CDN Nuvemshop pode ficar indisponível se loja antiga fechar; migrar para Supabase Storage no futuro
5. **`shared/data/products.ts`** — arquivo legado de demo; site usa API/Supabase
6. **ProductPage exige tamanho** — produtos migrados têm tamanho "Único"; `useEffect` seleciona automaticamente
7. **Build produção no Windows** — `pnpm start` usa `NODE_ENV=production` (sintaxe Unix); pode precisar `cross-env` no Windows

---

## Checklist rápido para novo agente

Antes de codar, confirme:

- [ ] Li este `AGENTS.md`
- [ ] `.env` existe com `SUPABASE_URL` e `SUPABASE_SECRET_KEY`
- [ ] `pnpm dev` sobe client **e** server
- [ ] Produtos vêm do Supabase (não do arquivo `shared/data/products.ts`)
- [ ] Novas features seguem `client → API → Supabase`
- [ ] Tipos em `shared/types/`, mapeamento em `productMapper.ts`

---

## Contato / loja

- Site antigo: https://www.nativa.art.br
- Instagram: `@nativa_criativa`
- E-mail no footer: `contato@nativa.com.br`
- WhatsApp no footer da loja antiga: +55 (11) 97698-4558

---

## Histórico de implementação (resumo)

1. **Fase inicial:** catálogo estático em `shared/data/products.ts`, servidor Express só para arquivos estáticos
2. **Integração Supabase:** tabela `products`, API REST, proxy Vite, `@supabase/supabase-js`
3. **Migração Nuvemshop:** parser CSV, script de migração, imagens da loja publicada, 7 produtos reais no banco
4. **Pendente:** carrinho, checkout, admin, storage próprio de imagens

---

*Última atualização: julho de 2026*
