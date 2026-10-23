import { AHORA_MIN, ESTACIONES, ESTACIONES_CON_TURNO } from './catalogos';
import { estacion, formatoCedula, horaDesdeMinutos, nombreCompleto, normalizar } from './formato';
import type {
  CuelloDeBotella,
  EstacionId,
  Estado,
  FlujoHora,
  Indicadores,
  Persona,
  Turno,
  TurnoVista,
} from './tipos';

const promedio = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

export const personasDeEmpresa = (s: Estado): Persona[] => s.personas.filter((p) => p.empresaId === s.empresaId);

export function persona(s: Estado, id: string): Persona | undefined {
  return s.personas.find((p) => p.id === id);
}

function vista(s: Estado, t: Turno): TurnoVista {
  const p = persona(s, t.personaId);
  const est = estacion(t.estacion);
  const esperaMin = AHORA_MIN - t.desde;
  return {
    id: t.id,
    codigo: t.codigo,
    personaId: t.personaId,
    nombre: p ? nombreCompleto(p) : '—',
    cedula: p ? formatoCedula(p.cedula) : '',
    cargo: p?.cargo ?? '',
    proceso: p?.proceso ?? 'Masivo Valor Agregado',
    reingreso: p?.reingreso ?? false,
    estacion: t.estacion,
    estacionNombre: est.nombre,
    estado: t.estado,
    esperaMin,
    objetivoMin: est.objetivoMin,
    excedido: esperaMin > est.objetivoMin,
    llamadas: t.llamadas,
    ...(t.puesto ? { puesto: t.puesto } : {}),
  };
}

export const turnosActivos = (s: Estado): TurnoVista[] =>
  s.turnos.filter((t) => t.empresaId === s.empresaId).map((t) => vista(s, t));

export function indicadores(s: Estado): Indicadores {
  const ts = turnosActivos(s);
  return {
    activos: ts.length,
    enEspera: ts.filter((t) => t.estado === 'espera').length,
    enAtencion: ts.filter((t) => t.estado !== 'espera').length,
    atendidosHoy: s.atendidosHoy[s.empresaId],
    esperaPromedio: promedio(ts.map((t) => t.esperaMin)),
    objetivoPromedio: 20,
    excedidos: ts.filter((t) => t.excedido).length,
  };
}

export function cuellosDeBotella(s: Estado): CuelloDeBotella[] {
  const ts = turnosActivos(s);
  return ESTACIONES.filter((e) => ESTACIONES_CON_TURNO.includes(e.id)).map((e) => {
    const de = ts.filter((t) => t.estacion === e.id);
    const esperas = de.map((t) => t.esperaMin);
    const esperaPromedio = promedio(esperas);
    const carga = de.length === 0 ? 0 : esperaPromedio / e.objetivoMin;
    return {
      estacion: e.id,
      nombre: e.nombre,
      enEspera: de.filter((t) => t.estado === 'espera').length,
      enAtencion: de.filter((t) => t.estado !== 'espera').length,
      puestos: e.puestos,
      esperaPromedio,
      esperaMaxima: esperas.length ? Math.max(...esperas) : 0,
      objetivoMin: e.objetivoMin,
      carga,
      nivel: carga > 1 ? 'critico' : carga > 0.75 ? 'atencion' : 'normal',
    };
  });
}

/** Ingresos por el kiosco y atenciones finalizadas por hora (sintético). */
export function flujoPorHora(s: Estado): FlujoHora[] {
  const base: FlujoHora[] = [
    { hora: '06:00', ingresos: 18, atendidos: 0 },
    { hora: '07:00', ingresos: 46, atendidos: 12 },
    { hora: '08:00', ingresos: 52, atendidos: 31 },
    { hora: '09:00', ingresos: 38, atendidos: 44 },
    { hora: '10:00', ingresos: 24, atendidos: 41 },
  ];
  const factor = s.empresaId === 'acuicola' ? 1 : 0.3;
  return base.map((f) => ({ ...f, ingresos: Math.round(f.ingresos * factor), atendidos: Math.round(f.atendidos * factor) }));
}

export interface FiltroTurnos {
  readonly texto: string;
  readonly estacion: EstacionId | 'todas';
  readonly soloExcedidos: boolean;
}

export function filtrarTurnos(lista: readonly TurnoVista[], f: FiltroTurnos): TurnoVista[] {
  const q = normalizar(f.texto);
  const digitos = f.texto.replace(/\D/g, '');
  return lista.filter((t) => {
    if (f.estacion !== 'todas' && t.estacion !== f.estacion) return false;
    if (f.soloExcedidos && !t.excedido) return false;
    if (!q) return true;
    return (
      normalizar(t.nombre).includes(q) ||
      normalizar(t.codigo).includes(q) ||
      (digitos.length >= 3 && t.cedula.replace(/\D/g, '').includes(digitos))
    );
  });
}

export type Orden = 'asc' | 'desc';
export function ordenar<T>(lista: readonly T[], campo: keyof T, orden: Orden): T[] {
  const signo = orden === 'asc' ? 1 : -1;
  return [...lista].sort((a, b) => {
    const x = a[campo];
    const y = b[campo];
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * signo;
    return String(x).localeCompare(String(y), 'es') * signo;
  });
}

export const paginar = <T>(lista: readonly T[], pagina: number, tam: number): T[] =>
  lista.slice((pagina - 1) * tam, pagina * tam);

/** Búsqueda global por cédula (con o sin espacios) o por nombre, sin tildes. */
export function buscarPersonas(s: Estado, texto: string, max = 6): Persona[] {
  const q = normalizar(texto);
  const digitos = texto.replace(/\D/g, '');
  if (q.length < 2) return [];
  return personasDeEmpresa(s)
    .filter((p) =>
      digitos.length >= 3 ? p.cedula.includes(digitos) : normalizar(nombreCompleto(p)).includes(q),
    )
    .slice(0, max);
}

/** Cola del puesto: llamados por este puesto, quien está en atención y la espera por orden de llegada (el primero es el siguiente). */
export function colaDelPuesto(s: Estado): { llamados: TurnoVista[]; enAtencion?: TurnoVista; espera: TurnoVista[] } {
  const ts = turnosActivos(s).filter((t) => t.estacion === s.puesto.estacion);
  const enAtencion = ts.find((t) => t.estado === 'atencion' && t.puesto === s.puesto.id);
  return {
    llamados: ts.filter((t) => t.estado === 'llamado' && t.puesto === s.puesto.id),
    ...(enAtencion ? { enAtencion } : {}),
    espera: ordenar(
      ts.filter((t) => t.estado === 'espera'),
      'esperaMin',
      'desc',
    ),
  };
}

export function siguienteEstacion(p: Persona, actual: EstacionId): EstacionId | undefined {
  const i = p.ruta.indexOf(actual);
  return i >= 0 ? p.ruta[i + 1] : undefined;
}

export const horaActual = (): string => horaDesdeMinutos(AHORA_MIN);

/** Persona de ejemplo para abrir el expediente: la más avanzada en la ruta completa. */
export function personaDestacada(s: Estado): string {
  const lista = personasDeEmpresa(s);
  const elegida =
    lista.find((p) => p.proceso === 'Masivo Valor Agregado' && p.hitos.some((h) => h.estacion === 'ventanilla' && h.estado === 'actual')) ??
    lista[0];
  return elegida?.id ?? '';
}
