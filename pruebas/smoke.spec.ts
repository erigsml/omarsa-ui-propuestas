import { expect, test } from '@playwright/test';
import { APPS, servir } from './servidor';

const SOLO = process.env.APP;

for (const app of APPS.filter((a) => !SOLO || a === SOLO)) {
  test(`smoke ${app}: tablero, expediente y atención completa en el puesto`, async ({ page }) => {
    const sitio = await servir(app);
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    try {
      await page.goto(sitio.url);
      await expect(page.getByRole('heading', { name: 'Tablero de turnos' })).toBeVisible();
      await expect(page.getByText('Médico es el cuello de botella')).toBeVisible();

      await page.goto(`${sitio.url}?pantalla=expediente`);
      await expect(page.getByText('Solo personal médico').first()).toBeVisible();

      await page.goto(`${sitio.url}?pantalla=puesto`);
      await page.getByRole('button', { name: /Atender$/ }).click();
      await page.getByRole('button', { name: /Aprobar: pasar/ }).click();
      await expect(page.getByText('Falta la firma del consentimiento', { exact: false })).toBeVisible();
      await page.getByLabel('La persona firmó la autorización de pruebas de seguridad').check();
      await page.getByLabel('No reactivo').check();
      await page.getByLabel('Observaciones para la auditoría').fill('Sin novedades en la inspección.');
      await page.getByRole('button', { name: /Aprobar: pasar/ }).click();
      await expect(page.getByText(/pasó a/).first()).toBeVisible();
      await page.getByRole('button', { name: /Llamar siguiente/ }).first().click();
      await expect(page.getByRole('button', { name: /Atender$/ })).toBeVisible();
      expect(errores).toEqual([]);
    } finally {
      await sitio.cerrar();
    }
  });
}
