# Soft Comfort — Design System del gestionale

Questo documento definisce la fonte visiva del gestionale.

## Source of truth

Il branding deriva dal repository ufficiale del sito:

`gaetanomeli95-lab/SITO-SOFT-COMFORT`

In particolare da `styles.css` e dall'asset logo:

`ChatGPT Image 14 mag 2026, 18_40_10.png`

Non sostituire il logo con ricostruzioni, icone generiche o versioni inventate.

## Palette ufficiale

- Background: `#050505`
- Text / ivory: `#f8f4ee`
- Primary red: `#f20f1f`
- Dark red: `#9c0610`
- Gold: `#d9a858`
- Panel: superfici nere / charcoal con bordi chiari traslucidi

## Typography

- UI/body: Inter
- Titoli e accenti editoriali: Playfair Display

## Principi UI

Il gestionale deve restare leggibile e operativo, ma deve essere immediatamente riconoscibile come Soft Comfort.

- fondo scuro premium;
- rosso per azioni primarie e stato attivo;
- oro per micro-label, gerarchia e dettagli;
- pannelli sobri con bordi sottili;
- niente palette indigo/blu SaaS generica;
- niente reinterpretazioni del logo;
- evitare eccessi decorativi nelle tabelle e nei flussi operativi;
- mantenere contrasto elevato, densità informativa e velocità d'uso.

## Asset logo

Il componente `SoftComfortBrand` usa temporaneamente lo stesso asset ufficiale tramite URL raw del repository del sito, con fallback testuale `SC` se l'asset non è raggiungibile.

Quando possibile, copiare lo stesso file in `public/softcomfort-logo.png` e aggiornare il componente a `/softcomfort-logo.png` per eliminare la dipendenza esterna, senza modificare l'immagine.
