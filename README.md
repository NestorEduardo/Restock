# Restock

Wholesale ordering portal for **Harbor Wireless Supply**. The buyer types an order in natural language; the app splits it into lines, resolves them against the catalog, and keeps an editable draft (with clarifications when needed) until confirm.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4. Package manager: **pnpm** (`packageManager`: `pnpm@11.21.0`).

## Requirements

- **Node.js** `>=20.9.0` (required by Next 16; this repo does not declare `engines` in `package.json`)
- **pnpm** 11.x (the version pinned in `packageManager` is recommended)
- An OpenAI API key to resolve orders in the UI and to run `pnpm split:test`

## Setup

```bash
pnpm install
cp .env.example .env.local
```

In `.env.local` set:

```bash
OPENAI_API_KEY=sk-...
```

That is the only environment variable the code uses (`app/api/resolve/route.ts`, `lib/providers/openai-splitter.ts`). Without it, `POST /api/resolve` returns 500 and `pnpm split:test` fails. `pnpm search:test` does not need it (fake splitter, offline).

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. The buyer types something like *“2 cases of usb c cables and 10 screen protectors for the 14 pro”*.
2. The server splits the message with OpenAI (`OpenAILineSplitter`), then each line goes through `decideLine` against `data/catalog.json` (demo tenant: Harbor Wireless Supply, ~243 products).
3. The draft shows `RESOLVED`, `NEEDS_CLARIFICATION`, or `NOT_FOUND` lines. Clarifications can be chosen in the UI or via a tool.
4. Confirm is only allowed when no clarifications are pending.

## WebMCP tools

The page registers **5** tools on `document.modelContext` / `navigator.modelContext` (definitions in `components/webmcp/tool-definitions.ts`). The app footer reports status (`5/5 registered` when all succeed).

| Tool | What it does | Annotations |
|------|--------------|-------------|
| `resolve_order` | Submit a natural-language order and update the on-screen draft | `readOnlyHint: true` |
| `get_catalog_info` | Distributor name, item count, and categories | `readOnlyHint: true` |
| `choose_option` | Pick an option on a `NEEDS_CLARIFICATION` line (`lineId` + `sku`) | `readOnlyHint: true` |
| `get_order_draft` | Current draft state (lines + total) | `readOnlyHint: true` |
| `submit_order` | Confirm the order; fails if the draft is empty or clarifications remain | `readOnlyHint: false`, `destructiveHint: false`, `idempotentHint: false` |

Requires a browser / agent with WebMCP (e.g. Chrome with `modelContext`). Without that API, the footer marks unsupported; the manual UI still works.

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm search:test` | Offline decision-engine suite |
| `pnpm split:test` | Live splitter smoke test (OpenAI) |

### `pnpm search:test` (`scripts/run-test-phrases.ts`)

- **28 cases** in `data/test-phrases.json`
- Catalog: `data/catalog.json` via `JsonCatalogSource` (tenant `"demo"`)
- Splitter: `FakeLineSplitter` (no network / no API key)
- Per case: split → `decideLine` per line → aggregate outcome (`resolve` / `ask` / `not_found` / `no_lines`)
- Checks against each case’s `expect` field (`resolve_or_ask` accepts resolve or ask)
- Expect distribution: 7 `resolve`, 13 `ask`, 4 `resolve_or_ask`, 3 `no_lines`, 1 `not_found`

### `pnpm split:test` (`scripts/run-split-test.ts`)

- The **same 28 texts** from `data/test-phrases.json`
- Splitter: `OpenAILineSplitter` (requires `OPENAI_API_KEY`)
- Only prints how many lines came back and qty/unit/desc; it does **not** check `expect` or call `decideLine`

## API

| Route | Purpose |
|-------|---------|
| `POST /api/resolve` | Natural-language message → resolved lines |
| `POST /api/resolve-option` | Resolve a clarification by `lineId` / option |
| `GET /api/catalog-info` | Catalog info (distributor, count, categories) |

## Layout (rough)

```
app/                 # App Router + API routes
components/order/    # Draft UI and confirmation
components/webmcp/   # Tool registration and definitions
lib/engine/          # decideLine and outcome types
lib/providers/       # OpenAI + fake splitters
lib/catalog/         # Reads data/catalog.json
data/                # Catalog and test phrases
scripts/             # search:test and split:test
```
