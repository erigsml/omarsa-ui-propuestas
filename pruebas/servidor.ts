import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, resolve } from 'node:path';

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

export const APPS = ['fluent', 'antd', 'mantine', 'shadcn'] as const;
export type App = (typeof APPS)[number];

/** Sirve el dist de una app en una subcarpeta, para probar que las rutas relativas funcionan. */
export async function servir(app: App): Promise<{ url: string; cerrar: () => Promise<void> }> {
  const raiz = resolve(import.meta.dirname, '..', 'apps', app, 'dist');
  const prefijo = `/publicado/${app}/`;
  const servidor: Server = createServer((req, res) => {
    const ruta = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
    if (!ruta.startsWith(prefijo)) {
      res.writeHead(404).end();
      return;
    }
    const relativo = normalize(ruta.slice(prefijo.length) || 'index.html');
    const archivo = join(raiz, relativo);
    if (!archivo.startsWith(raiz) || !existsSync(archivo) || statSync(archivo).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TIPOS[extname(archivo)] ?? 'application/octet-stream' });
    createReadStream(archivo).pipe(res);
  });
  await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok));
  const { port } = servidor.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}${prefijo}`,
    cerrar: () => new Promise((ok) => servidor.close(() => ok())),
  };
}
