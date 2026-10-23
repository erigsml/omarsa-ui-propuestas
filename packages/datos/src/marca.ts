/**
 * Colores de marca y de estado, iguales para las 4 apps.
 *
 * Rojo muestreado de las imágenes del PDF (confidenciales, no se copian aquí):
 *  - #DD343B: rojo del logotipo (membrete.jpeg). Con texto blanco da 4,54:1, al límite de AA.
 *  - #AF101A: rojo de los botones de acción de los mockups (p36_1.png, p38_1.png). Con blanco da 7,21:1.
 * Se usa #AF101A como marca de acción y #DD343B solo como acento gráfico (isotipo, barras).
 * El error usa un bermellón (#C4320A, tono 15°) distinto del rojo de marca (356°) y siempre lleva ícono y texto.
 */
export const MARCA = {
  accion: '#AF101A',
  accionHover: '#8E0D15',
  logo: '#DD343B',
  suave: '#FBECEC',
} as const;

export const ESTADO_COLOR = {
  error: '#C4320A',
  errorFondo: '#FDEDE7',
  aviso: '#8A5A00',
  avisoFondo: '#FFF4CC',
  exito: '#0E7A3E',
  exitoFondo: '#E6F4EC',
  info: '#1F6FB2',
  infoFondo: '#E8F1FA',
} as const;

/** Rampa de 10 tonos de la marca (claro → oscuro), útil para Mantine y Ant Design. */
export const RAMPA_MARCA = [
  '#FDEEEF', '#F9D3D5', '#F1A7AB', '#E87A80', '#DD343B',
  '#C81F28', '#AF101A', '#8E0D15', '#6C0A10', '#4A070B',
] as const;
