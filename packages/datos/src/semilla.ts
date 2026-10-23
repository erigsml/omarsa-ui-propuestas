import {
  AHORA_MIN,
  APELLIDOS,
  CARGOS,
  ESTACIONES,
  NOMBRES,
  OPERADORES,
  RUTAS,
} from './catalogos';
import { digitoVerificador, horaDesdeMinutos } from './formato';
import type {
  Documento,
  EmpresaId,
  Estado,
  EstacionId,
  EstadoFuente,
  EstadoTurno,
  EventoAuditoria,
  Hito,
  NivelRiesgo,
  Persona,
  TipoProceso,
  Turno,
  Validacion,
} from './tipos';

/** Generador pseudoaleatorio con semilla (mulberry32): los datos salen iguales en las 4 apps. */
function crearAleatorio(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Azar = () => number;
const entero = (r: Azar, min: number, max: number): number => min + Math.floor(r() * (max - min + 1));
function elegir<T>(r: Azar, lista: readonly T[]): T {
  const v = lista[Math.floor(r() * lista.length)];
  if (v === undefined) throw new Error('Lista vacía');
  return v;
}

function cedulaSintetica(r: Azar): string {
  const nueve = `09${entero(r, 0, 5)}${String(entero(r, 0, 999999)).padStart(6, '0')}`;
  return `${nueve}${digitoVerificador(nueve)}`;
}

const FUENTES: readonly { fuente: string; tipo: Validacion['tipo'] }[] = [
  { fuente: 'Lista negra interna', tipo: 'Bloqueante' },
  { fuente: 'Antecedentes penales', tipo: 'Bloqueante' },
  { fuente: 'Consejo de la Judicatura', tipo: 'Informativa' },
  { fuente: 'Registro Civil', tipo: 'Informativa' },
  { fuente: 'ATM (licencias)', tipo: 'Informativa' },
  { fuente: 'Nivel de estudio', tipo: 'Revisión manual' },
  { fuente: 'SUPA (pensiones)', tipo: 'Informativa' },
  { fuente: 'SRI', tipo: 'Informativa' },
];

function validaciones(r: Azar, horaKiosco: number): { lista: Validacion[]; riesgo: NivelRiesgo; score: number } {
  let penalizacion = 0;
  const lista = FUENTES.map((f, i) => {
    let estado: EstadoFuente = 'sin_novedad';
    if (f.tipo !== 'Bloqueante') {
      const x = r();
      if (x > 0.86) estado = 'observacion';
      else if (x > 0.78) estado = 'carente';
      else if (f.tipo === 'Revisión manual' && x > 0.55) estado = 'revision';
    }
    if (estado === 'observacion') penalizacion += 14;
    if (estado === 'carente') penalizacion += 8;
    if (estado === 'revision') penalizacion += 5;
    return { ...f, estado, hora: horaDesdeMinutos(horaKiosco + 1 + Math.floor(i / 3)) };
  });
  const score = Math.max(52, 98 - penalizacion);
  const riesgo: NivelRiesgo = score >= 85 ? 'BAJO' : score >= 70 ? 'MEDIO' : 'ALTO';
  return { lista, riesgo, score };
}

function hitosDe(ruta: readonly EstacionId[], actual: EstacionId | 'fin', horaKiosco: number, r: Azar): Hito[] {
  const idxActual = actual === 'fin' ? ruta.length : ruta.indexOf(actual);
  let reloj = horaKiosco;
  return ESTACIONES.map(({ id }) => {
    const i = ruta.indexOf(id);
    if (i < 0) return { estacion: id, estado: 'no_aplica' as const };
    if (i < idxActual) {
      const hito = { estacion: id, estado: 'completado' as const, hora: horaDesdeMinutos(reloj), operador: elegir(r, OPERADORES[id]) };
      reloj += entero(r, 12, 30);
      return hito;
    }
    if (i === idxActual) return { estacion: id, estado: 'actual' as const, hora: horaDesdeMinutos(reloj) };
    return { estacion: id, estado: 'pendiente' as const };
  });
}

function documentosDe(id: string, hitos: readonly Hito[], horaKiosco: number): Documento[] {
  const hecho = (e: EstacionId) => hitos.some((h) => h.estacion === e && h.estado === 'completado');
  const horaDe = (e: EstacionId) => hitos.find((h) => h.estacion === e)?.hora ?? horaDesdeMinutos(horaKiosco);
  const docs: Documento[] = [
    { id: `${id}-d1`, nombre: 'Solicitud de Empleo y Estudio de Seguridad', codigo: 'FOR-027', estacion: 'kiosco', estado: 'Firmado', hora: horaDesdeMinutos(horaKiosco), paginas: 3, pesoKb: 412, restringido: false },
    { id: `${id}-d2`, nombre: 'Informe de validaciones', codigo: 'VAL-001', estacion: 'kiosco', estado: 'Generado', hora: horaDesdeMinutos(horaKiosco + 3), paginas: 2, pesoKb: 268, restringido: false },
    { id: `${id}-d3`, nombre: 'Cédula de identidad (escaneo)', codigo: 'DOC-CED', estacion: 'kiosco', estado: 'Escaneado', hora: horaDesdeMinutos(horaKiosco + 2), paginas: 1, pesoKb: 640, restringido: false },
  ];
  if (hecho('seguridad')) {
    docs.push(
      { id: `${id}-d4`, nombre: 'Autorización de pruebas de seguridad', codigo: 'SEG-AUT', estacion: 'seguridad', estado: 'Firmado', hora: horaDe('seguridad'), paginas: 1, pesoKb: 156, restringido: false },
      { id: `${id}-d5`, nombre: 'Ficha de control de drogas y tatuajes', codigo: 'SEG-FIC', estacion: 'seguridad', estado: 'Firmado', hora: horaDe('seguridad'), paginas: 2, pesoKb: 233, restringido: false },
    );
  }
  if (hecho('escuelita')) {
    docs.push({ id: `${id}-d6`, nombre: 'Registro de escuelita', codigo: 'ESC-REG', estacion: 'escuelita', estado: 'Firmado', hora: horaDe('escuelita'), paginas: 1, pesoKb: 98, restringido: false });
  }
  if (hecho('medico')) {
    docs.push({ id: `${id}-d7`, nombre: 'Ficha médica', codigo: 'MED-FIC', estacion: 'medico', estado: 'Firmado', hora: horaDe('medico'), paginas: 3, pesoKb: 305, restringido: true });
  }
  if (hitos.some((h) => h.estacion === 'ventanilla' && h.estado !== 'no_aplica')) {
    docs.push({ id: `${id}-d8`, nombre: 'Contrato de trabajo', codigo: 'CT-042', estacion: 'ventanilla', estado: hecho('ventanilla') ? 'Firmado' : 'Pendiente de firma', hora: horaDe('ventanilla'), paginas: 4, pesoKb: 521, restringido: false });
  }
  return docs;
}

function auditoriaDe(id: string, hitos: readonly Hito[], codigo: string): EventoAuditoria[] {
  const eventos: EventoAuditoria[] = [];
  hitos.forEach((h, i) => {
    if (h.estado === 'completado' || h.estado === 'actual') {
      if (h.estacion === 'kiosco') {
        eventos.push({ id: `${id}-a${i}a`, hora: h.hora ?? '', usuario: 'Kiosco K-01', accion: 'Registró el ingreso y consultó las fuentes', origen: 'KIO-01 · 10.20.4.11' });
        eventos.push({ id: `${id}-a${i}b`, hora: h.hora ?? '', usuario: 'Sistema', accion: `Generó el turno ${codigo}`, origen: 'turnos · 10.20.1.5' });
      } else if (h.estado === 'completado') {
        eventos.push({ id: `${id}-a${i}`, hora: h.hora ?? '', usuario: h.operador ?? 'Sistema', accion: `Finalizó la atención en ${h.estacion === 'medico' ? 'Médico' : h.estacion.charAt(0).toUpperCase() + h.estacion.slice(1)}`, origen: `TAB-${h.estacion.slice(0, 3).toUpperCase()}-0${(i % 3) + 1} · 10.20.6.${20 + i}` });
      }
    }
  });
  return eventos.reverse();
}

interface Plan {
  readonly estacion: EstacionId;
  readonly cantidad: number;
  readonly esperaMin: number;
  readonly esperaMax: number;
}

const PLANES: Readonly<Record<EmpresaId, readonly Plan[]>> = {
  acuicola: [
    { estacion: 'seguridad', cantidad: 13, esperaMin: 3, esperaMax: 24 },
    { estacion: 'escuelita', cantidad: 6, esperaMin: 6, esperaMax: 27 },
    { estacion: 'medico', cantidad: 12, esperaMin: 14, esperaMax: 58 },
    { estacion: 'ventanilla', cantidad: 9, esperaMin: 4, esperaMax: 26 },
    { estacion: 'credencial', cantidad: 4, esperaMin: 2, esperaMax: 9 },
  ],
  empacadora: [
    { estacion: 'seguridad', cantidad: 2, esperaMin: 2, esperaMax: 8 },
    { estacion: 'medico', cantidad: 3, esperaMin: 5, esperaMax: 14 },
    { estacion: 'ventanilla', cantidad: 2, esperaMin: 3, esperaMax: 10 },
  ],
};

const PROCESOS: readonly TipoProceso[] = ['Masivo Valor Agregado', 'Masivo Descabezado', 'Camaronera', 'Fijo administrativo'];

function procesoPara(r: Azar, estacion: EstacionId): TipoProceso {
  const validos = PROCESOS.filter((p) => RUTAS[p].includes(estacion));
  // El grueso de la temporada es masivo: se pondera hacia Valor Agregado.
  return r() < 0.55 && validos.includes('Masivo Valor Agregado') ? 'Masivo Valor Agregado' : elegir(r, validos);
}

interface Crear {
  readonly r: Azar;
  readonly empresaId: EmpresaId;
  readonly n: number;
  readonly estacionActual: EstacionId | 'fin';
  readonly proceso: TipoProceso;
  readonly estado: Persona['estado'];
  readonly horaKiosco: number;
  readonly codigo: string;
}

function crearPersona({ r, empresaId, n, estacionActual, proceso, estado, horaKiosco, codigo }: Crear): Persona {
  const id = `${empresaId}-p${n}`;
  const nombres = elegir(r, NOMBRES);
  const apellidos = `${elegir(r, APELLIDOS)} ${elegir(r, APELLIDOS)}`;
  const ruta = RUTAS[proceso];
  const hitos = hitosDe(ruta, estacionActual, horaKiosco, r);
  const val = validaciones(r, horaKiosco);
  const usuario = nombres.split(' ')[0]?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') ?? 'persona';
  return {
    id,
    empresaId,
    nombres,
    apellidos,
    cedula: cedulaSintetica(r),
    fechaNacimiento: `${String(entero(r, 1, 28)).padStart(2, '0')}/${String(entero(r, 1, 12)).padStart(2, '0')}/${entero(r, 1978, 2006)}`,
    telefono: `+593 9${entero(r, 6, 9)} ${String(entero(r, 0, 999)).padStart(3, '0')} ${String(entero(r, 0, 9999)).padStart(4, '0')}`,
    correo: `${usuario}.demo${n}@correo.example`,
    direccion: `${elegir(r, ['Cdla. Ferroviaria', 'El Recreo', 'Primavera 2', 'Abel Gilbert', 'Cdla. Oramas'])}, Mz. ${entero(r, 1, 40)} V. ${entero(r, 1, 20)}, Durán`,
    cargo: elegir(r, CARGOS[proceso]),
    proceso,
    reingreso: r() < 0.32,
    estado,
    ruta,
    hitos,
    documentos: documentosDe(id, hitos, horaKiosco),
    validaciones: val.lista,
    riesgo: val.riesgo,
    score: val.score,
    auditoria: auditoriaDe(id, hitos, codigo),
  };
}

const LETRA: Readonly<Record<TipoProceso, string>> = {
  'Masivo Valor Agregado': 'A',
  'Masivo Descabezado': 'D',
  Camaronera: 'C',
  'Fijo administrativo': 'F',
};

function sembrarEmpresa(empresaId: EmpresaId, semilla: number): { personas: Persona[]; turnos: Turno[] } {
  const r = crearAleatorio(semilla);
  const personas: Persona[] = [];
  const turnos: Turno[] = [];
  let n = 1;
  let numero = 101;
  for (const plan of PLANES[empresaId]) {
    for (let k = 0; k < plan.cantidad; k++) {
      const proceso = procesoPara(r, plan.estacion);
      const espera = entero(r, plan.esperaMin, plan.esperaMax);
      const codigo = `${LETRA[proceso]}-${numero++}`;
      const horaKiosco = AHORA_MIN - espera - entero(r, 20, 110);
      const persona = crearPersona({ r, empresaId, n: n++, estacionActual: plan.estacion, proceso, estado: 'En proceso', horaKiosco, codigo });
      personas.push(persona);
      // En seguridad hay quien ya está en un puesto: así el tablero muestra los 3 estados.
      let estadoTurno: EstadoTurno = 'espera';
      let puesto: string | undefined;
      if (k === 0 && plan.cantidad > 3) [estadoTurno, puesto] = ['atencion', `${ESTACIONES.find((e) => e.id === plan.estacion)?.prefijo}-01`];
      if (k === 1 && plan.cantidad > 3) [estadoTurno, puesto] = ['llamado', `${ESTACIONES.find((e) => e.id === plan.estacion)?.prefijo}-03`];
      turnos.push({ id: `${persona.id}-t`, codigo, personaId: persona.id, empresaId, estacion: plan.estacion, estado: estadoTurno, desde: AHORA_MIN - espera, llamadas: estadoTurno === 'espera' ? 0 : 1, ...(puesto ? { puesto } : {}) });
    }
  }
  const extras: { cantidad: number; estado: Persona['estado'] }[] = [
    { cantidad: empresaId === 'acuicola' ? 8 : 3, estado: 'Credencial entregada' },
    { cantidad: empresaId === 'acuicola' ? 3 : 1, estado: 'En revisión' },
  ];
  for (const extra of extras) {
    for (let k = 0; k < extra.cantidad; k++) {
      const proceso = elegir(r, PROCESOS);
      const fin = extra.estado === 'Credencial entregada';
      const actual: EstacionId | 'fin' = fin ? 'fin' : 'seguridad';
      const persona = crearPersona({ r, empresaId, n: n++, estacionActual: actual, proceso, estado: extra.estado, horaKiosco: entero(r, 6 * 60 + 5, 8 * 60), codigo: `${LETRA[proceso]}-${numero++}` });
      personas.push(persona);
    }
  }
  return { personas, turnos };
}

export function estadoInicial(): Estado {
  const a = sembrarEmpresa('acuicola', 20261023);
  const b = sembrarEmpresa('empacadora', 7781);
  // El puesto S-02 arranca con una persona ya llamada (la que más espera en Seguridad).
  const enSeguridad = a.turnos.filter((t) => t.estacion === 'seguridad' && t.estado === 'espera');
  const primero = enSeguridad.reduce((m, t) => (t.desde < m.desde ? t : m), enSeguridad[0] as Turno);
  const turnos = a.turnos.map((t) => (t.id === primero.id ? { ...t, estado: 'llamado' as const, puesto: 'S-02', llamadas: 1 } : t));
  return {
    empresaId: 'acuicola',
    personas: [...a.personas, ...b.personas],
    turnos: [...turnos, ...b.turnos],
    atendidosHoy: { acuicola: 128, empacadora: 41 },
    puesto: { id: 'S-02', estacion: 'seguridad', operador: 'Marlene Ortiz' },
    simularFalla: false,
  };
}
