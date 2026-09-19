import { expect, test } from '@playwright/test';

/**
 * Flussi critici E2E. Le credenziali vanno fornite via env:
 *   E2E_USER / E2E_PASSWORD
 * Senza credenziali i test di login vengono saltati.
 */
const USER = process.env.E2E_USER;
const PASSWORD = process.env.E2E_PASSWORD;

test.describe('auth', () => {
  test('mostra la pagina di login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Gestionale' })).toBeVisible();
    await expect(page.getByLabel('Nome utente')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('redirect a /login se non autenticati', async ({ page }) => {
    await page.goto('/vendite');
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip(!USER || !PASSWORD, 'Richiede E2E_USER e E2E_PASSWORD');

  test('login → dashboard → lista vendite → dettaglio', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Nome utente').fill(USER!);
    await page.getByLabel('Password').fill(PASSWORD!);
    await page.getByRole('button', { name: 'Accedi' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByRole('link', { name: 'Fatture vendita' }).click();
    await expect(page).toHaveURL(/\/vendite/);
    await expect(page.getByRole('heading', { name: 'Fatture di vendita' })).toBeVisible();

    // Apre la prima fattura della lista
    await page.locator('tbody tr td a').first().click();
    await expect(page).toHaveURL(/\/vendite\/.+/);
  });
});
