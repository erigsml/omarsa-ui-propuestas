import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { APPS, servir } from './servidor';

const SALIDA = process.env.CAPTURAS_DIR ?? join(import.meta.dirname, '..', 'test-results', 'capturas');
const SOLO = process.env.APP;

for (const app of APPS.filter((a) => !SOLO || a === SOLO)) {
  test(`capturas ${app}`, async ({ page }) => {
    mkdirSync(SALIDA, { recursive: true });
    const sitio = await servir(app);
    const externas: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith('http://127.0.0.1')) externas.push(r.url());
    });
    try {
      for (const pantalla of ['tablero', 'expediente', 'puesto'] as const) {
        await page.goto(`${sitio.url}?pantalla=${pantalla}`);
        await page.waitForTimeout(1500);
        await page.screenshot({ path: join(SALIDA, `${app}-${pantalla}.png`), fullPage: true });
      }
      expect(externas, 'el build no debe pedir nada a internet').toEqual([]);
    } finally {
      await sitio.cerrar();
    }
  });
}
