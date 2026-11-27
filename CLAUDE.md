# CLAUDE.md — Gestionale Soft Comfort

Leggi questo file per primo. Lo stato aggiornato del lavoro, le decisioni prese e da dove ripartire sono in
**[docs/STATO_PROGETTO.md](docs/STATO_PROGETTO.md)**: leggilo all'inizio di ogni sessione, prima di proporre lavoro.

## Cos'è

Nuovo frontend web del gestionale di Soft Comfort Arredamenti (React 18 + TypeScript + Vite + Tailwind v4),
costruito sopra il **backend legacy Spring Boot** già in uso. Il backend non si modifica da qui: la UI parla solo
con gli adapter in `src/services/api/`. Dettagli tecnici e avvio: [README.md](README.md). Gate di go-live:
[docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md).

## Chi è l'utente

Il titolare/gestore, non uno sviluppatore. Parla in italiano. Spiega in modo semplice cosa stai facendo e perché,
senza gergo tecnico non necessario; tieni i dettagli tecnici per commit e PR.

## Requisiti di business da rispettare sempre

1. **Più sedi, in contemporanea.** Il programma girerà su almeno 3 PC (forse di più) in sedi diverse, usati nello
   stesso momento sugli stessi dati.
2. **Un PC principale admin.** Uno solo fa da amministratore ed è l'unico che può accedere alla **contabilità e alle
   funzioni più delicate**. Gli altri PC sono operativi.
3. Vedi in [docs/STATO_PROGETTO.md](docs/STATO_PROGETTO.md) cosa manca oggi per soddisfarli e le domande aperte.

## Regole di sicurezza e correttezza (dal README, non negoziabili)

- Mai committare credenziali, token o dati cliente.
- Le azioni legacy senza undo (incasso, pagamento provvigione, consegna magazzino) richiedono conferma.
- Stato pagamento e stato operativo della vendita restano distinti; `settlement` non è un incasso.
- Non usare `PUT /sellingBill/update` finché il contratto non è dimostrato.
- Il documento stampato è un "Documento di vendita gestionale", non una fattura fiscale.
- Un controllo fatto solo nell'interfaccia **non è** sicurezza: ciò che è riservato all'admin va bloccato anche dal
  backend.

## Come si lavora

- Un branch per ogni blocco → build/typecheck → lint → unit test → e2e → PR → CI verde → merge (squash).
- Comandi: `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e` (Playwright, usa la modalità demo).
- La CI (`.github/workflows/ci.yml`) blocca anche su `npm audit --omit=dev --audit-level=high`.
- Su GitHub l'auto-merge è disattivato: si unisce a mano dopo la CI verde.
- Alla fine di ogni sessione **aggiorna [docs/STATO_PROGETTO.md](docs/STATO_PROGETTO.md)** (fatto, stato, prossimi
  passi) così il prossimo PC riparte da lì.
