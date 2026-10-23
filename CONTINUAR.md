# Cómo continuar este trabajo (traspaso)

Prototipos de front, **sin backend**, para elegir la biblioteca de UI de la plataforma de contratación (grupo OMARSA).
Este repositorio es independiente del producto. Solo tiene datos sintéticos: no copies aquí imágenes del PDF del cliente ni datos reales.

## Objetivo
Las **mismas 3 pantallas interactivas** construidas con 4 bibliotecas, para que el usuario compare cómo se ve y cómo se siente cada una:

| App | Biblioteca |
|---|---|
| `apps/fluent` | Fluent UI v9 (la que usa hoy el producto; sirve de referencia) |
| `apps/antd` | Ant Design v5 + ProComponents |
| `apps/mantine` | Mantine v8 (+ charts y form) |
| `apps/shadcn` | shadcn/ui (Radix + Tailwind, componentes copiados al proyecto) |

Las 3 pantallas, dentro de un shell de BackOffice (menú lateral, buscador por cédula o nombre, selector de empresa y usuario):
1. **Tablero de turnos**:
   - indicadores del día, en alerta si hay excedidos;
   - cuellos de botella por módulo;
   - tabla densa con filtro, orden, búsqueda y paginación;
   - acciones Transferir (diálogo) y Cerrar (con confirmación);
   - gráfico del flujo por hora.
2. **Expediente del candidato**:
   - cabecera con identidad, estado y proceso;
   - línea de tiempo kiosco → seguridad → escuelita → médico → ventanilla → credencial;
   - pestañas: datos, documentos (con vista previa), validaciones y auditoría;
   - ficha médica bloqueada con "Solo personal médico".
3. **Puesto de atención (seguridad)**:
   - la persona llamada y sus acciones al centro;
   - la cola al costado: llamar siguiente, llamado múltiple y re-llamar;
   - "Atender" abre un formulario corto con validación;
   - el estado vacío dice "No hay nadie en espera";
   - acción "Transferir a otro módulo";
   - notificaciones.

## Reglas de diseño (iguales en las 4)
- **Rojo de marca:** está en `packages/datos/src/marca.ts`.
  - Se usa solo en el 10 % de la pantalla: la acción principal y el estado activo (regla 60-30-10).
  - El rojo de **error** es otro tono y siempre va con ícono y texto, para no confundir "acción" con "peligro".
- **Proporción y legibilidad:** escala tipográfica fija y espaciado de 4/8 px, contraste AA, foco visible y uso completo con teclado.
- **Estados:** cada vista tiene sus estados vacío, cargando y error. Solo modo claro (el usuario descartó el modo oscuro el 23-oct).
- **Tamaño de pantalla:** pensado para 1440×900, y tiene que verse bien en 1280.
- **Reglas del negocio:**
  - al candidato nunca se le dice por qué se le rechaza;
  - la ficha médica solo la ven roles médicos;
  - los nombres son ficticios y la empresa es "Acuícola Demo del Pacífico S.A.", con un isotipo neutro, sin logo real.
- **Sin rutas de URL** (estado interno o MemoryRouter) y `base: './'` en Vite.
- **El build funciona como sitio estático y sin internet:** fuentes con @fontsource, sin CDN.

## Estado al 23-oct-2026
- [x] `packages/datos`: datos sintéticos, lógica en memoria, marca e isotipo compartidos.
- [x] `apps/fluent`
- [x] `apps/antd`
- [x] `apps/mantine`
- [x] `apps/shadcn`
- [x] `pruebas/smoke.spec.ts` (una prueba por app) y `pruebas/capturas.spec.ts` (`npm run ci` en verde el 23-oct)
- [x] Capturas a 1440×900 de cada pantalla (solo claro) en `capturas/<biblioteca>-<pantalla>.png`, más el diálogo de transferencia y el formulario con validación.
- [-] `NOTAS.md` y análisis con axe: **descartados por el usuario** el 23-oct ("hazlo breve… quiero ver cómo se ve cada biblioteca para decidir a simple vista"). El resumen va en el informe final.
- [x] Página índice (`indice/index.html`) que enlaza las 4 apps; `npm run publicar -- <carpeta>` junta builds, capturas e índice.

## Comandos
```bash
npm install
npm run dev -w apps/shadcn        # o fluent / antd / mantine
npm run ci                        # lint + typecheck + build + smoke
npm run capturas                  # CAPTURAS_DIR=capturas para guardarlas en el repo
npm run publicar -- <carpeta>     # sitio estático con las 4 apps
```
Construye las apps **de una en una**: la máquina local se queda sin memoria si se construyen todas a la vez.

## Pedido para quien continúe
1. Termina `apps/shadcn` con la misma calidad que las otras tres. Debe verse moderna, al estilo Linear, Vercel o Stripe, sin componentes por defecto puestos uno al lado del otro.
2. Pasa `npm run ci` en verde y genera las capturas.
3. Escribe `NOTAS.md` y la página índice.
4. Haz commits convencionales en español, sin Co-Authored-By. Marca las casillas de este archivo a medida que avanzas.
