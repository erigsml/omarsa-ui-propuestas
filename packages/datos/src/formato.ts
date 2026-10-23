import { ESTACIONES } from './catalogos';
import type { Estacion, EstacionId, Persona } from './tipos';

/** Cédula fragmentada para leerla de un vistazo (ley de Miller): 09 2345 678-1. */
export function formatoCedula(cedula: string): string {
  const d = cedula.replace(/\D/g, '');
  if (d.length !== 10) return cedula;
  return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Dígito verificador módulo 10 de la cédula ecuatoriana. */
export function digitoVerificador(nueve: string): number {
  const suma = [...nueve].reduce((acc, c, i) => {
    const p = Number(c) * (i % 2 === 0 ? 2 : 1);
    return acc + (p > 9 ? p - 9 : p);
  }, 0);
  return (10 - (suma % 10)) % 10;
}

export function horaDesdeMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function duracion(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export const nombreCompleto = (p: Pick<Persona, 'nombres' | 'apellidos'>): string =>
  `${p.nombres} ${p.apellidos}`;

export function iniciales(p: Pick<Persona, 'nombres' | 'apellidos'>): string {
  const a = p.nombres.trim()[0] ?? '';
  const b = p.apellidos.trim()[0] ?? '';
  return `${a}${b}`.toUpperCase();
}

export function estacion(id: EstacionId): Estacion {
  const e = ESTACIONES.find((x) => x.id === id);
  if (!e) throw new Error(`Estación desconocida: ${id}`);
  return e;
}

/** Normaliza para buscar sin tildes ni mayúsculas. */
export const normalizar = (t: string): string =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
