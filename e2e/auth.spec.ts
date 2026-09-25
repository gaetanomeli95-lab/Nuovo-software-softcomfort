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
