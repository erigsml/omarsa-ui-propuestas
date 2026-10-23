import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AHORA_MIN, USUARIO } from './catalogos';
import { estacion, horaDesdeMinutos, nombreCompleto } from './formato';
import { colaDelPuesto, persona, siguienteEstacion } from './logica';
import { estadoInicial } from './semilla';
import type { EmpresaId, EstacionId, Estado, EventoAuditoria, Hito, Persona, Turno } from './tipos';

let estado: Estado = estadoInicial();
const oyentes = new Set<() => void>();

function fijar(nuevo: Estado): void {
  estado = nuevo;
  oyentes.forEach((f) => f());
}

const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => oyentes.delete(f);
};

export const obtenerEstado = (): Estado => estado;

/** Estado global en memoria compartido por las pantallas. */
export function useEstado(): Estado {
  return useSyncExternalStore(suscribir, obtenerEstado, obtenerEstado);
}

let secuencia = 0;
const evento = (accion: string): EventoAuditoria => ({
  id: `ev-${++secuencia}`,
  hora: horaDesdeMinutos(AHORA_MIN),
  usuario: USUARIO.nombre,
  accion,
  origen: 'PC-TH-07 · 10.20.3.44',
});

function actualizarPersona(s: Estado, id: string, f: (p: Persona) => Persona): Estado {
  return { ...s, personas: s.personas.map((p) => (p.id === id ? f(p) : p)) };
}

function actualizarTurno(s: Estado, id: string, f: (t: Turno) => Turno): Estado {
  return { ...s, turnos: s.turnos.map((t) => (t.id === id ? f(t) : t)) };
}

function moverHitos(hitos: readonly Hito[], de: EstacionId, a: EstacionId | undefined, operador: string): Hito[] {
  const hora = horaDesdeMinutos(AHORA_MIN);
  return hitos.map((h) => {
    if (h.estacion === de) return { estacion: de, estado: 'completado', hora, operador };
    if (h.estacion === a) return { estacion: a, estado: 'actual', hora };
    return h;
  });
}

function turnoPorId(id: string): Turno {
  const t = estado.turnos.find((x) => x.id === id);
  if (!t) throw new Error(`Turno no encontrado: ${id}`);
  return t;
}

const nombreDe = (personaId: string): string => {
  const p = persona(estado, personaId);
  return p ? nombreCompleto(p) : 'La persona';
};

export const acciones = {
  cambiarEmpresa(empresaId: EmpresaId): void {
    fijar({ ...estado, empresaId });
  },
  alternarFalla(): void {
    fijar({ ...estado, simularFalla: !estado.simularFalla });
  },
  quitarFalla(): void {
    if (estado.simularFalla) fijar({ ...estado, simularFalla: false });
  },
  /** Mueve el turno a otra estación; vuelve al final de su cola. */
  transferir(turnoId: string, destino: EstacionId, motivo: string): string {
    const t = turnoPorId(turnoId);
    let s = actualizarTurno(estado, turnoId, (x) => ({ id: x.id, codigo: x.codigo, personaId: x.personaId, empresaId: x.empresaId, estacion: destino, estado: 'espera', desde: AHORA_MIN, llamadas: 0 }));
    s = actualizarPersona(s, t.personaId, (p) => ({
      ...p,
      auditoria: [evento(`Transfirió el turno ${t.codigo} de ${estacion(t.estacion).nombre} a ${estacion(destino).nombre} (${motivo})`), ...p.auditoria],
    }));
    fijar(s);
    return `${nombreDe(t.personaId)} pasó a la cola de ${estacion(destino).nombre}.`;
  },
  cerrar(turnoId: string, motivo: string): string {
    const t = turnoPorId(turnoId);
    let s: Estado = { ...estado, turnos: estado.turnos.filter((x) => x.id !== turnoId) };
    s = actualizarPersona(s, t.personaId, (p) => ({
      ...p,
      estado: 'Proceso cerrado',
      auditoria: [evento(`Cerró el turno ${t.codigo}: ${motivo}`), ...p.auditoria],
    }));
    fijar(s);
    return `Turno ${t.codigo} cerrado.`;
  },
  /** Llama a los n primeros de la cola. Devuelve los nombres llamados. */
  llamar(n = 1): string[] {
    const porLlegada = colaDelPuesto(estado).espera.slice(0, n);
    const ids = new Set(porLlegada.map((t) => t.id));
    fijar({
      ...estado,
      turnos: estado.turnos.map((t) => (ids.has(t.id) ? { ...t, estado: 'llamado', puesto: estado.puesto.id, llamadas: 1 } : t)),
    });
    return porLlegada.map((t) => t.nombre);
  },
  rellamar(turnoId: string): string {
    fijar(actualizarTurno(estado, turnoId, (t) => ({ ...t, llamadas: t.llamadas + 1 })));
    return nombreDe(turnoPorId(turnoId).personaId);
  },
  atender(turnoId: string): void {
    fijar(actualizarTurno(estado, turnoId, (t) => ({ ...t, estado: 'atencion', puesto: estado.puesto.id })));
  },
  /** Devuelve a la cola a quien no se presentó al llamado. */
  devolverACola(turnoId: string): string {
    fijar(actualizarTurno(estado, turnoId, (t) => ({ id: t.id, codigo: t.codigo, personaId: t.personaId, empresaId: t.empresaId, estacion: t.estacion, estado: 'espera', desde: t.desde, llamadas: t.llamadas })));
    return nombreDe(turnoPorId(turnoId).personaId);
  },
  /** Cierra la atención del puesto: aprueba (pasa a la siguiente estación) o registra novedad. */
  finalizar(turnoId: string, aprobado: boolean, observaciones: string): string {
    const t = turnoPorId(turnoId);
    const p = persona(estado, t.personaId);
    if (!p) throw new Error('Persona no encontrada');
    const destino = aprobado ? siguienteEstacion(p, t.estacion) : undefined;
    const operador = estado.puesto.operador;
    let s: Estado = {
      ...estado,
      atendidosHoy: { ...estado.atendidosHoy, [estado.empresaId]: estado.atendidosHoy[estado.empresaId] + 1 },
      turnos: destino
        ? estado.turnos.map((x) => (x.id === turnoId ? { id: x.id, codigo: x.codigo, personaId: x.personaId, empresaId: x.empresaId, estacion: destino, estado: 'espera', desde: AHORA_MIN, llamadas: 0 } : x))
        : estado.turnos.filter((x) => x.id !== turnoId),
    };
    s = actualizarPersona(s, p.id, (x) => ({
      ...x,
      estado: aprobado ? 'En proceso' : 'En revisión',
      hitos: aprobado ? moverHitos(x.hitos, t.estacion, destino, operador) : x.hitos,
      auditoria: [
        { ...evento(aprobado ? `Aprobó ${estacion(t.estacion).nombre}: ${observaciones}` : `Registró una novedad en ${estacion(t.estacion).nombre}`), usuario: operador, origen: `TAB-SEG-02 · 10.20.6.22` },
        ...x.auditoria,
      ],
    }));
    fijar(s);
    return aprobado
      ? `${nombreCompleto(p)} pasó a ${destino ? estacion(destino).nombre : 'fin del proceso'}.`
      : `Novedad registrada para ${nombreCompleto(p)}. El caso pasa a revisión de Talento Humano.`;
  },
};

export type EstadoCarga = 'cargando' | 'error' | 'listo';

/** Simula la carga de una pantalla (skeleton > 400 ms) y su error si la falla está activa. */
export function useCarga(clave: string, ms = 700): { estado: EstadoCarga; reintentar: () => void } {
  const { simularFalla } = useEstado();
  const [intento, setIntento] = useState(0);
  const [carga, setCarga] = useState<EstadoCarga>('cargando');
  useEffect(() => {
    setCarga('cargando');
    const id = window.setTimeout(() => setCarga(simularFalla ? 'error' : 'listo'), ms);
    return () => window.clearTimeout(id);
  }, [clave, intento, simularFalla, ms]);
  const reintentar = useCallback(() => {
    acciones.quitarFalla();
    setIntento((i) => i + 1);
  }, []);
  return { estado: carga, reintentar };
}

/** Atajo de teclado global (ignora cuando se escribe en un campo). */
export function useAtajo(tecla: string, f: () => void): void {
  useEffect(() => {
    const manejar = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const escribiendo = el?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]');
      if (escribiendo || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() === tecla.toLowerCase()) {
        e.preventDefault();
        f();
      }
    };
    window.addEventListener('keydown', manejar);
    return () => window.removeEventListener('keydown', manejar);
  }, [tecla, f]);
}
