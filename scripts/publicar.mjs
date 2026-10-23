// Junta los 4 builds, las capturas y la página índice en una carpeta lista para servir como sitio estático.
// Uso: node scripts/publicar.mjs <carpeta-destino>
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const destino = process.argv[2];
if (!destino) {
  console.error('Falta la carpeta de destino: node scripts/publicar.mjs <carpeta>');
  process.exit(1);
}
const raiz = resolve(import.meta.dirname, '..');
mkdirSync(destino, { recursive: true });
for (const app of ['fluent', 'antd', 'mantine', 'shadcn']) {
  const dist = join(raiz, 'apps', app, 'dist');
  if (!existsSync(dist)) {
    console.error(`No existe ${dist}: corre antes "npm run build".`);
    process.exit(1);
  }
  rmSync(join(destino, app), { recursive: true, force: true });
  cpSync(dist, join(destino, app), { recursive: true });
}
cpSync(join(raiz, 'capturas'), join(destino, 'capturas'), { recursive: true });
cpSync(join(raiz, 'indice', 'index.html'), join(destino, 'index.html'));
console.log(`Publicado en ${destino}`);
