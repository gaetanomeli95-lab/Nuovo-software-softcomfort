# Stato del progetto — da dove ripartire

Ultimo aggiornamento: **27 novembre 2026**. Aggiorna questo file alla fine di ogni sessione di lavoro.

## In due righe

Il gestionale web è completo nei moduli principali, aggiornato e senza vulnerabilità note nelle librerie di
produzione. Gira in **modalità demo** (anteprima Vercel) e non è ancora collegato e collaudato con il backend reale.
Il prossimo lavoro importante è adattarlo all'uso **multi-sede con un solo PC amministratore** (vedi sotto).

## Cosa è stato fatto (27/11/2026)

| PR | Cosa | Commit in main |
|---|---|---|
| #37 | Scheda cliente: storico vendite, situazione pagamenti, "Nuova vendita" con telefono e indirizzo già compilati. Test e2e offline reso stabile. zod 4.6.7 (vulnerabilità alta). | `edea4f7` |
| #39 | react-router-dom 7.18.7 (chiude 2 vulnerabilità). `BrowserRouter useTransitions={false}` per mantenere il caricamento visibile al cambio pagina come in v6. | `d31561b` |
| #40 | Sei aggiornamenti Dependabot (jest-dom 7, recharts 3, sonner 2, tailwind-merge 3, react-hooks 7, react-refresh 0.5). `useOnlineStatus` con `useSyncExternalStore`. Corretto bug: il cellulare precompilato, se svuotato, si riempiva di nuovo. Nuovi e2e per questo e per il grafico della dashboard. | `257f1de` |

Stato verificato a fine giornata: `npm audit --omit=dev` 0 vulnerabilità; build, lint (3 warning preesistenti
`react-refresh/only-export-components`), 56 unit test, 10 e2e verdi.

## Da fare su GitHub (pulizia, non urgente)

- Chiudere le PR Dependabot ormai superate da main: **#30, #31, #32, #33, #34, #35, #36, #38**.
- Restano aperte, da trattare ognuna in un blocco a parte:
  - **#28** React 19 (+ react-dom 19, react-query patch).
  - **#29** strumenti di build: Vite 8, TypeScript 7, ESLint 10, Vitest 5, @vitejs/plugin-react 6.

## Requisito principale: più sedi + un PC admin

Richiesta del titolare: il programma girerà su **almeno 3 PC in sedi diverse, in contemporanea**. **Uno solo** sarà
il PC principale/admin, l'unico con accesso alla **contabilità e alle cose più delicate**.

### Come funziona oggi

- **Login e ruoli**: il backend legacy restituisce token e ruoli. Se il ruolo contiene `ROLE_ADMIN` l'utente è admin
  (`src/features/auth/AuthContext.tsx`).
- **Cosa è riservato all'admin**: solo la pagina **Amministrazione** (`RequireAdmin` in `src/App.tsx`, voce
  `adminOnly` in `src/app/nav.ts`) e un'azione nel dettaglio fattura di acquisto (`BuyingBillDetailPage.tsx`).
- **Tutto il resto è visibile a qualsiasi utente loggato**, comprese le aree economiche: Dashboard (fatturato), Fatture
  di acquisto, Assegni, Acconti, Provvigioni.
- Il blocco admin è **solo nell'interfaccia**. Non è verificato se il backend legacy rifiuta davvero quei dati a un
  utente non admin.
- **Collegamento al backend**: in sviluppo il proxy Vite punta a `VITE_LEGACY_BACKEND` (rete locale). In produzione
  serve `VITE_API_BASE_URL` (backend HTTPS) oppure la stessa origine. Oggi il backend è pensato **in rete locale**.
- **Uso in contemporanea**: l'app non ha controlli sui conflitti (due PC che modificano la stessa vendita). Dipende da
  come si comporta il backend legacy.

### Cosa manca (in ordine)

1. **Raggiungere il backend da tutte le sedi.** Il server deve essere accessibile in modo sicuro anche fuori dalla
   rete del negozio: VPN tra le sedi, oppure backend esposto in HTTPS. Decisione da prendere con chi gestisce il server.
2. **Rendere solo-admin le aree delicate** già decise (vedi "Decisione presa" sotto): menu, route (`RequireAdmin`),
   azioni e ogni punto dove quei dati compaiono indirettamente.
3. **Verificare la sicurezza lato backend.** Accedere con un utente non admin e controllare che le API delle aree
   delicate rispondano 401/403. Se il backend legacy non lo fa, il blocco solo-interfaccia **non basta**.
4. **"Solo il PC principale".** Un'app web non può riconoscere in modo sicuro un PC specifico. La soluzione abituale:
   un **account admin** usato solo su quel PC, eventualmente con l'accesso admin consentito dal backend solo dalla rete
   della sede principale. Da decidere col titolare.
5. **Collaudo in contemporanea** con 2-3 PC sugli stessi dati, su un database di prova
   (vedi `docs/PRODUCTION_READINESS.md`, sezione "Collaudo delle mutazioni").

### Decisione presa (27/11/2026)

Il titolare ha stabilito che sono **riservate solo all'admin**:

- **Fatture di acquisto**
- **Assegni**
- **Provvigioni**
- **Acconti**
- **Fatturato** (importi e grafici economici, anche se compaiono in Dashboard, Home, "Da fare" o ricerca)
- **Amministrazione** (già riservata)

I PC operativi **non devono vederle nemmeno in sola lettura**. Va controllato ogni punto dove questi dati compaiono
anche indirettamente: menu, route, dashboard, home, inbox "Da fare", ricerca globale, scheda cliente, esportazioni.

### Domande aperte per il titolare

- Gli operatori in negozio devono comunque poter **registrare un acconto** al momento della vendita (senza vedere
  l'elenco acconti), oppure lo fa solo l'admin?
- Quante sedi e quanti PC per sede? Gli utenti degli altri PC hanno ognuno il proprio account?
- Dove sta il server del vecchio gestionale (sede principale? PC dedicato?) e chi lo gestisce?
- Quali account esistono già nel backend legacy e con quali ruoli?

## Altri punti aperti (da docs/PRODUCTION_READINESS.md)

- Chiusura vendita: il contratto di `PUT /sellingBill/update` non è dimostrato. Non collegare pulsanti di chiusura.
- Collaudo di tutte le operazioni che scrivono dati su un ambiente di prova.
- Dati fiscali aziendali da verificare prima di usare i documenti in modo definitivo.

## Prossimo passo consigliato

In un branch dedicato: rendere solo-admin le aree delicate decise (punto 2), poi preparare la verifica sul backend
(punto 3). In parallelo, raccogliere le risposte alle domande aperte.
