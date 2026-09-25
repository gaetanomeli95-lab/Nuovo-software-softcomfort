# Soft Comfort Gestionale — Production Readiness

Questo documento separa ciò che è già operativo da ciò che richiede una verifica sul backend reale.
Non contiene credenziali, token o dati cliente.

## Obiettivo

Un gestionale Soft Comfort semplice da usare, moderno e coerente con il modo di lavorare reale:
vendita → ordine → arrivo → consegna → incasso → chiusura.

## Moduli operativi nel frontend

- Login e ruoli.
- Dashboard.
- Vendite e nuova proposta di commissione.
- Dettaglio vendita e avanzamento articoli.
- Dati logistici e planning consegne.
- Acconti e stato pagamento separato dallo stato operativo.
- Provvigioni.
- Assegni.
- Ordini in sospeso.
- Fatture di acquisto.
- Magazzino: carico, ubicazione, modifica e consegna.
- Documento di vendita, bolla e proposta di commissione A4.
- Esportazioni CSV per vendite e magazzino.
- Esportazione planning consegne in CSV e calendario ICS.
- Azioni rapide di contatto WhatsApp per clienti con recapito compatibile.
- Area amministrazione e stato configurazione con diagnostica read-only dei moduli principali.
- Modalità demo stateful per validare i flussi senza toccare i dati reali.

## Regole di correttezza già applicate

- Una vendita "Chiusa" non viene considerata automaticamente "Pagata".
- Lo stato pagamento usa solo acconti marcati come incassati (collected).
- settlement resta separato finché la sua semantica non viene verificata sul backend reale.
- I nuovi dati logistici vengono serializzati nel campo note in formato compatibile, perché il backend legacy non espone campi dedicati.
- Il frontend non invia proprietà arbitrarie al DTO legacy.
- Il documento stampato resta "Documento di vendita": non viene presentato come fattura fiscale elettronica.

## Verifiche obbligatorie prima del go-live

### 1. Chiusura vendita

Nel bundle legacy è osservabile PUT /sellingBill/update, ma il contratto completo della chiamata
(body, query params ed effetto esatto) non è stato dimostrato.

**Regola:** non collegare un pulsante di chiusura al backend reale finché non viene validato.

Per sbloccarlo serve almeno una delle seguenti fonti:
- backend JAR decompilabile;
- repository Spring Boot originale;
- documentazione backend;
- test controllato su una copia/database di prova.

### 2. Collaudo delle mutazioni

Eseguire su ambiente di prova:
1. creazione vendita;
2. aggiunta/rimozione articolo;
3. modifica ditta;
4. avanzamento ordinato/arrivato/consegnato;
5. acconto e incasso;
6. note e dati logistici;
7. planning consegna;
8. stampa;
9. provvigione;
10. annullamento;
11. chiusura solo dopo validazione dell'endpoint.

### 3. Identità fiscale e documenti

Prima di produrre documenti con valore fiscale verificare ufficialmente:
- ragione sociale;
- P.IVA / codice fiscale;
- sede legale;
- PEC / SDI se necessari;
- numerazione fiscale;
- IVA, imponibile e aliquote;
- natura fiscale del documento.

### 4. QR recensioni

Il QR attuale va verificato contro la destinazione Google/recensioni corrente prima dell'uso definitivo.

## Configurazione ambienti

- VITE_API_BASE_URL: URL HTTPS del backend quando è separato dal frontend.
- VITE_DEMO_MODE=true: forza la modalità demo.
- VITE_DEMO_MODE=false: consente produzione same-origin con API relative.
- Se in produzione non viene impostato alcun override e manca un backend URL, resta attivo il fallback demo.

## Diagnostica read-only

L'area amministrativa può eseguire un controllo esplicito di sola lettura su vendite, acquisti, magazzino, assegni, acconti, provvigioni e ordini. Questo controllo serve a distinguere rapidamente un problema di connettività/sessione da un problema circoscritto a un singolo modulo senza modificare dati.

## Quality gate

Ogni modifica deve seguire:

**branch → build/typecheck → lint → unit test → preview Vercel verde → merge**

Una preview verde dimostra che il frontend compila e viene distribuito; non dimostra che una mutazione
sul backend reale sia semanticamente corretta.