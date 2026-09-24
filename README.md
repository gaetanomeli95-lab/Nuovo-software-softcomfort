# Gestionale Soft Comfort

Frontend operativo moderno per Soft Comfort Arredamenti, costruito in React + TypeScript + Vite + Tailwind v4 sopra il backend legacy Spring Boot esistente.

L'obiettivo del progetto è mantenere i flussi familiari del gestionale storico, rendendoli più chiari, veloci e sicuri senza introdurre scritture non verificate sul backend reale.

## Moduli disponibili

- Home operativa e navigazione desktop/mobile.
- Dashboard con KPI, vendite, scadenze e priorità consegne.
- **Da fare**: inbox prioritaria di urgenze, vendite, incassi e provvigioni.
- Vendite: lista, filtri, dettaglio e workflow articoli.
- Nuova vendita / proposta di commissione.
- Dati consegna: piano, scala, ascensore, autoscala, rilievo misure, allegati, data/ora.
- Planning consegne.
- Acconti e stato pagamento separato dallo stato operativo.
- Provvigioni.
- Assegni.
- Ordini in sospeso.
- Fatture di acquisto e registrazione pagamenti.
- Magazzino: carico, modifica ubicazione/riferimento/nome e consegna.
- Anagrafiche derivate di clienti e fornitori.
- Documento di vendita e bolla A4.
- Amministrazione / readiness produzione.
- Modalità demo stateful per verificare i flussi senza toccare dati reali.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- TanStack Query
- React Router
- Recharts
- Vitest / Testing Library
- Playwright

## Avvio locale

Requisiti: Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Imposta in `.env.local` il backend legacy della tua rete:

```env
VITE_LEGACY_BACKEND=http://host-locale:8080
```

In sviluppo Vite inoltra i path legacy noti al backend tramite proxy.

## Modalità produzione

### Backend HTTPS separato

```env
VITE_API_BASE_URL=https://api.example.com
VITE_DEMO_MODE=false
```

### Frontend e backend sulla stessa origine

```env
VITE_API_BASE_URL=
VITE_DEMO_MODE=false
```

### Demo / preview

```env
VITE_DEMO_MODE=true
```

Senza override, una build produzione priva di `VITE_API_BASE_URL` mantiene il fallback demo per evitare chiamate accidentali verso un backend inesistente.

## Script

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia Vite con proxy API |
| `npm run build` | Type-check + build produzione |
| `npm run test` | Unit test |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Test Playwright |

## Architettura

```
src/
  app/                 router, guards, error boundary, navigazione
  components/          UI, layout e componenti condivisi
  features/            moduli di dominio
  hooks/               query e mutation hooks
  lib/                 formattazione e utility
  services/api/        adapter verso il backend legacy
  services/demoRuntime demo stateful
  types/               contratto di dominio osservato
```

La UI non chiama direttamente URL legacy: tutte le API passano dagli adapter in `services/api`.

## Regole di sicurezza e correttezza

- Nessuna credenziale o token deve essere committato.
- Le azioni legacy senza undo (incasso, pagamento provvigione, consegna magazzino) richiedono conferma.
- Stato pagamento e stato operativo della vendita restano distinti.
- `settlement` non viene interpretato come incasso finché la sua semantica non viene verificata.
- `PUT /sellingBill/update` non viene usato per chiudere/modificare vendite finché il contratto esatto non è dimostrato.
- Il documento stampato è un **Documento di vendita gestionale**, non una fattura fiscale elettronica.
- I dati fiscali aziendali devono essere verificati prima dell'uso documentale definitivo.

Per i gate completi di go-live: `docs/PRODUCTION_READINESS.md`.

## Quality gate

Ogni blocco segue:

**branch → build/typecheck → lint → unit test → preview Vercel verde → merge**

Il deploy verde conferma compilazione e distribuzione del frontend; le mutazioni sul backend reale vanno comunque collaudate in un ambiente controllato.
