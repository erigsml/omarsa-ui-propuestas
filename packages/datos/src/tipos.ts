/** Modelo de dominio del prototipo. Todo es sintético y vive en memoria. */

export type EmpresaId = 'acuicola' | 'empacadora';

export interface Empresa {
  readonly id: EmpresaId;
  readonly nombre: string;
  readonly corto: string;
}

export type EstacionId = 'kiosco' | 'seguridad' | 'escuelita' | 'medico' | 'ventanilla' | 'credencial';

export interface Estacion {
  readonly id: EstacionId;
  readonly nombre: string;
  readonly prefijo: string;
  /** Puestos habilitados hoy. */
  readonly puestos: number;
  /** Espera objetivo en minutos: por encima, el turno está excedido. */
  readonly objetivoMin: number;
}

export type TipoProceso =
  | 'Masivo Valor Agregado'
  | 'Masivo Descabezado'
  | 'Camaronera'
  | 'Fijo administrativo';

export type EstadoExpediente =
  | 'En proceso'
  | 'En revisión'
  | 'Credencial entregada'
  | 'Proceso cerrado';

export type EstadoHito = 'completado' | 'actual' | 'pendiente' | 'no_aplica';

export interface Hito {
  readonly estacion: EstacionId;
  readonly estado: EstadoHito;
  readonly hora?: string;
  readonly operador?: string;
}

export type EstadoDocumento = 'Firmado' | 'Generado' | 'Escaneado' | 'Pendiente de firma';

export interface Documento {
  readonly id: string;
  readonly nombre: string;
  readonly codigo: string;
  readonly estacion: EstacionId;
  readonly estado: EstadoDocumento;
  readonly hora: string;
  readonly paginas: number;
  readonly pesoKb: number;
  /** Solo lo abre el personal médico (POL-03). */
  readonly restringido: boolean;
}

export type TipoFuente = 'Bloqueante' | 'Informativa' | 'Revisión manual';
export type EstadoFuente = 'sin_novedad' | 'observacion' | 'carente' | 'revision';

export interface Validacion {
  readonly fuente: string;
  readonly tipo: TipoFuente;
  readonly estado: EstadoFuente;
  readonly hora: string;
}

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO';

export interface EventoAuditoria {
  readonly id: string;
  readonly hora: string;
  readonly usuario: string;
  readonly accion: string;
  readonly origen: string;
}

export interface Persona {
  readonly id: string;
  readonly empresaId: EmpresaId;
  readonly nombres: string;
  readonly apellidos: string;
  readonly cedula: string;
  readonly fechaNacimiento: string;
  readonly telefono: string;
  readonly correo: string;
  readonly direccion: string;
  readonly cargo: string;
  readonly proceso: TipoProceso;
  readonly reingreso: boolean;
  readonly estado: EstadoExpediente;
  readonly ruta: readonly EstacionId[];
  readonly hitos: readonly Hito[];
  readonly documentos: readonly Documento[];
  readonly validaciones: readonly Validacion[];
  readonly riesgo: NivelRiesgo;
  readonly score: number;
  readonly auditoria: readonly EventoAuditoria[];
}

export type EstadoTurno = 'espera' | 'llamado' | 'atencion';

export interface Turno {
  readonly id: string;
  readonly codigo: string;
  readonly personaId: string;
  readonly empresaId: EmpresaId;
  readonly estacion: EstacionId;
  readonly estado: EstadoTurno;
  /** Minuto del día en que entró a la estación actual. */
  readonly desde: number;
  readonly llamadas: number;
  readonly puesto?: string;
}

export interface FlujoHora {
  readonly hora: string;
  readonly ingresos: number;
  readonly atendidos: number;
}

export interface Puesto {
  readonly id: string;
  readonly estacion: EstacionId;
  readonly operador: string;
}

export interface Estado {
  readonly empresaId: EmpresaId;
  readonly personas: readonly Persona[];
  readonly turnos: readonly Turno[];
  readonly atendidosHoy: Readonly<Record<EmpresaId, number>>;
  readonly puesto: Puesto;
  readonly simularFalla: boolean;
}

/** Turno listo para mostrar: unido con la persona y con su espera calculada. */
export interface TurnoVista {
  readonly id: string;
  readonly codigo: string;
  readonly personaId: string;
  readonly nombre: string;
  readonly cedula: string;
  readonly cargo: string;
  readonly proceso: TipoProceso;
  readonly reingreso: boolean;
  readonly estacion: EstacionId;
  readonly estacionNombre: string;
  readonly estado: EstadoTurno;
  readonly esperaMin: number;
  readonly objetivoMin: number;
  readonly excedido: boolean;
  readonly llamadas: number;
  readonly puesto?: string;
}

export type NivelCarga = 'normal' | 'atencion' | 'critico';

export interface CuelloDeBotella {
  readonly estacion: EstacionId;
  readonly nombre: string;
  readonly enEspera: number;
  readonly enAtencion: number;
  readonly puestos: number;
  readonly esperaPromedio: number;
  readonly esperaMaxima: number;
  readonly objetivoMin: number;
  /** esperaPromedio / objetivo (1 = en el límite). */
  readonly carga: number;
  readonly nivel: NivelCarga;
}

export interface Indicadores {
  readonly activos: number;
  readonly enEspera: number;
  readonly enAtencion: number;
  readonly atendidosHoy: number;
  readonly esperaPromedio: number;
  readonly objetivoPromedio: number;
  readonly excedidos: number;
}
