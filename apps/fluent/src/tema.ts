import { type BrandVariants, createDarkTheme, createLightTheme, type Theme } from '@fluentui/react-components';
import { MARCA } from '@propuestas/datos';

type Rgb = readonly [number, number, number];
const aRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as unknown as Rgb;
const aHex = (c: Rgb) => `#${c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('')}`;
const mezclar = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Rampa de 16 tonos con el rojo de acción en el tono 80 (como hace el proyecto real, BO-13). */
function rampa(hex: string): BrandVariants {
  const base = aRgb(hex);
  const pasos = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
  return Object.fromEntries(
    pasos.map((p, i) => {
      if (i === 7) return [p, hex];
      if (i < 7) return [p, aHex(mezclar([0, 0, 0], base, 0.12 + (0.88 * i) / 7))];
      return [p, aHex(mezclar(base, [255, 255, 255], (0.92 * (i - 7)) / 8))];
    }),
  ) as unknown as BrandVariants;
}

const fuente = "'Inter Variable', 'Segoe UI', system-ui, sans-serif";

export const tema: Theme = {
  ...createLightTheme(rampa(MARCA.accion)),
  fontFamilyBase: fuente,
  colorNeutralBackground2: '#F5F6F8',
  colorNeutralBackground3: '#EEF0F3',
  // Error bermellón (distinto del rojo de marca) en validaciones, MessageBar y Badge de peligro.
  colorPaletteRedForeground1: '#C4320A',
  colorPaletteRedForeground3: '#C4320A',
  colorPaletteRedBorder2: '#C4320A',
  colorPaletteRedBackground3: '#C4320A',
  colorStatusDangerForeground1: '#9E2806',
  colorStatusDangerForeground3: '#C4320A',
  colorStatusDangerBorder1: '#F3B9A5',
  colorStatusDangerBorder2: '#C4320A',
  colorStatusDangerBackground1: '#FDEDE7',
  colorStatusDangerBackground3: '#C4320A',
};

/** El menú lateral usa un tema oscuro anidado (FluentProvider dentro de otro), como en los mockups. */
const oscuro = createDarkTheme(rampa(MARCA.accion));
export const temaLateral: Theme = {
  ...oscuro,
  fontFamilyBase: fuente,
  colorNeutralBackground1: '#17191E',
  colorNeutralBackground2: '#17191E',
  colorNeutralBackground4: '#17191E',
  colorBrandForeground2: '#FF7A80',
  colorCompoundBrandStroke: '#FF7A80',
  colorCompoundBrandForeground1: '#FF7A80',
};
