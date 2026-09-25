import { expect, test } from '@playwright/test';

async function enterDemo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Entra in modalità demo' }).click();
  await expect(page).toHaveURL('/');
}

test.describe('critical operator flows', () => {
  test('mostra la pagina di login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Gestionale Soft Comfort' })).toBeVisible();
    await expect(page.getByLabel('Nome utente')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('redirect a /login se non autenticati', async ({ page }) => {
    await page.goto('/vendite');
    await expect(page).toHaveURL(/\/login/);
  });

  test('demo → home → vendite → dettaglio', async ({ page }) => {
    await enterDemo(page);

    await expect(page.getByRole('heading', { name: /Tutto quello che serve/i })).toBeVisible();
    await page.getByRole('link', { name: /^Vendite/ }).first().click();

    await expect(page).toHaveURL(/\/vendite$/);
    await expect(page.getByRole('heading', { name: 'Vendite' })).toBeVisible();

    await page.locator('tbody tr').first().click();
    await expect(page).toHaveURL(/\/vendite\/.+/);
    await expect(page.getByRole('link', { name: /Stampa vendita/i })).toBeVisible();
  });

  test('anagrafica cliente apre storico e precompila una nuova vendita', async ({ page }) => {
    await enterDemo(page);
    await page.goto('/anagrafiche');

    await page.getByRole('link', { name: 'AMOROSO MARIA' }).click();
    await expect(page.getByRole('heading', { name: 'AMOROSO MARIA' })).toBeVisible();
    await expect(page.getByText('Via Libertà 112, Palermo')).toBeVisible();

    await page.getByRole('link', { name: 'Nuova vendita' }).click();
    await expect(page).toHaveURL(/\/vendite\/nuova\?cliente=/);
    await expect(page.getByLabel('Cliente')).toHaveValue('AMOROSO MARIA');
    await expect(page.getByLabel('Cellulare')).toHaveValue('333 555 1920');
    await expect(page.getByLabel('Indirizzo di consegna')).toHaveValue('Via Libertà 112, Palermo');
  });

  test('la nuova vendita può riusare un cliente già presente', async ({ page }) => {
    await enterDemo(page);
    await page.goto('/vendite/nuova');

    await page.getByLabel('Cliente').fill('AMOR');
    const existingCustomer = page.getByRole('button', { name: /AMOROSO MARIA/i });
    await expect(existingCustomer).toBeVisible();
    await existingCustomer.click();

    await expect(page.getByLabel('Cliente')).toHaveValue('AMOROSO MARIA');
    await expect(page.getByLabel('Cellulare')).toHaveValue('333 555 1920');
    await expect(page.getByLabel('Indirizzo di consegna')).toHaveValue('Via Libertà 112, Palermo');
  });

  test('se il dispositivo va offline l’operatore viene avvisato', async ({ page, context }) => {
    await enterDemo(page);
    await context.setOffline(true);

    await expect(page.getByText(/Il dispositivo risulta offline/i)).toBeVisible();

    await context.setOffline(false);
    await expect(page.getByText(/Il dispositivo risulta offline/i)).toBeHidden();
  });

  test('la nuova vendita recupera una bozza dopo il reload', async ({ page }) => {
    await enterDemo(page);
    await page.goto('/vendite/nuova');

    await page.getByLabel('Cliente').fill('Cliente bozza E2E');
    await page.getByLabel('Cellulare').fill('3929952453');

    const articleDescription = page.getByLabel('Descrizione merce').first();
    await articleDescription.fill('Divano test E2E');

    // L'autosave è volutamente debounced.
    await page.waitForTimeout(500);
    await page.reload();

    await expect(page.getByText('Bozza recuperata automaticamente')).toBeVisible();
    await expect(page.getByLabel('Cliente')).toHaveValue('Cliente bozza E2E');
    await expect(page.getByLabel('Cellulare')).toHaveValue('3929952453');
    await expect(page.getByLabel('Descrizione merce').first()).toHaveValue('Divano test E2E');
  });

  test('crea una vendita demo completa e apre i tre documenti di stampa', async ({ page }) => {
    await enterDemo(page);
    await page.goto('/vendite/nuova');

    await page.getByLabel('Cliente').fill('CLIENTE E2E NUOVA VENDITA');
    await page.getByLabel('Cellulare').fill('3331234567');
    await page.getByLabel('Descrizione merce').fill('Divano E2E');
    await page.getByLabel('Prezzo unitario (€)').fill('1290');

    await page.getByRole('button', { name: 'Salva vendita' }).click();
    await expect(page).toHaveURL(/\/vendite\/demo-sale-/);
    await expect(page.getByRole('heading', { name: 'CLIENTE E2E NUOVA VENDITA' })).toBeVisible();

    const saleUrl = page.url();
    const uuid = saleUrl.split('/').pop();
    expect(uuid).toBeTruthy();

    await page.goto(`/vendite/${uuid}/stampa?tipo=documento`);
    await expect(page.getByText('Documento di vendita').first()).toBeVisible();

    await page.goto(`/vendite/${uuid}/stampa?tipo=bolla`);
    await expect(page.getByText('Bolla di consegna').first()).toBeVisible();

    await page.goto(`/vendite/${uuid}/stampa?tipo=commissione`);
    await expect(page.getByText('Proposta di commissione').first()).toBeVisible();
  });

  test('amministrazione esegue diagnostica read-only e backup demo', async ({ page }) => {
    await enterDemo(page);
    await page.goto('/amministrazione');

    await page.getByRole('button', { name: 'Esegui controllo' }).click();
    await expect(page.getByText('OK', { exact: true })).toHaveCount(8);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Esporta backup' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^softcomfort-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
