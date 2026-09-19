# Gestionale Web

Frontend moderno (React + TypeScript + Vite + Tailwind v4 + shadcn/ui-style)
che lavora sopra il backend legacy Spring Boot esistente, invariato.

## Requisiti

- Node.js 20+ (sviluppato su Node 24)
- Backend legacy raggiungibile (default `http://192.168.194.58:8080`)

## Avvio

```bash
npm install
npm run dev        # http://localhost:5173
```

In dev, il proxy Vite inoltra i path API (`/login`, `/sellingBill`, `/item`,
`/buyingBill`, `/checks`, `/deposits`, `/provisions`, `/pending`) al backend
legacy — nessun URL hardcoded nel codice. Per cambiare target:

```bash
# .env.development oppure variabile ambiente
VITE_LEGACY_BACKEND=http://altro-host:8080   # usato dal proxy dev
VITE_API_BASE_URL=                            # base URL API (vuoto = stessa origine)
```

In produzione il frontend usa URL relativi: basta servire `dist/` dallo stesso
origin del backend (come già fa Spring Boot con il vecchio frontend Angular).

## Script

| Comando | Descrizione |
|---|---|
| `npm run dev` | Dev server con proxy al legacy |
| `npm run build` | Type-check + build produzione |
| `npm run test` | Unit test (Vitest + Testing Library) |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright (richiede `npx playwright install chromium` e credenziali `E2E_USER`/`E2E_PASSWORD`) |

## Architettura

```
src/
  app/            router guards, navigazione
  components/     ui/ (primitives shadcn-style), layout/, common/
  features/       auth, dashboard, selling-bills, ...
  hooks/          query hooks TanStack
  lib/            utils, formattazione
  services/api/   config, http client, token store, adapter per dominio
  types/          modelli di dominio (contratto osservato dal legacy)
```

Punti chiave:

- **Adapter layer**: la UI non conosce i path legacy (`/sellingBill/getAll` ecc.),
  usa solo `services/api/*`. Sostituire il backend in futuro = riscrivere gli adapter.
- **Auth**: JWT Bearer in `sessionStorage` (come il legacy), gestito da
  `tokenStore` + `AuthContext`. 401 → logout automatico.
- **Server state**: TanStack Query con chiavi centralizzate (`queryKeys.ts`).
- **Logica di business** fuori dai componenti: `dashboardMetrics.ts`,
  `billFilters.ts` sono puri e coperti da test.

## Stato migrazione (Fase 1)

Implementato e collegato al backend reale:

- Login (POST `/login/signin`)
- Dashboard con KPI reali
- Lista fatture vendita (ricerca, sort, filtri stato/venditore/date, paginazione)
- Dettaglio vendita read-only (workflow, articoli, acconti, provvigione, note)

In migrazione (placeholder): ordini, acquisti, magazzino, acconti, assegni,
provvigioni, amministrazione.

Vedi `../app-analysis/API_SPEC.md` per il contratto API completo.
