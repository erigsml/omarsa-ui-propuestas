import type { Empresa, Estacion, EstacionId, TipoProceso } from './tipos';

/** Empresas ficticias: nada de nombres ni logos reales en la interfaz. */
export const EMPRESAS: readonly Empresa[] = [
  { id: 'acuicola', nombre: 'Acuícola Demo del Pacífico S.A.', corto: 'Acuícola Demo' },
  { id: 'empacadora', nombre: 'Empacadora Demo del Sur S.A.', corto: 'Empacadora Demo' },
];

export const ESTACIONES: readonly Estacion[] = [
  { id: 'kiosco', nombre: 'Kiosco', prefijo: 'K', puestos: 3, objetivoMin: 5 },
  { id: 'seguridad', nombre: 'Seguridad', prefijo: 'S', puestos: 3, objetivoMin: 20 },
  { id: 'escuelita', nombre: 'Escuelita', prefijo: 'E', puestos: 2, objetivoMin: 30 },
  { id: 'medico', nombre: 'Médico', prefijo: 'M', puestos: 2, objetivoMin: 25 },
  { id: 'ventanilla', nombre: 'Ventanilla', prefijo: 'V', puestos: 4, objetivoMin: 20 },
  { id: 'credencial', nombre: 'Credencial', prefijo: 'C', puestos: 2, objetivoMin: 15 },
];

/** Estaciones donde se atiende con turno (el kiosco es autoservicio). */
export const ESTACIONES_CON_TURNO: readonly EstacionId[] = [
  'seguridad',
  'escuelita',
  'medico',
  'ventanilla',
  'credencial',
];

export const RUTAS: Readonly<Record<TipoProceso, readonly EstacionId[]>> = {
  'Masivo Valor Agregado': ['kiosco', 'seguridad', 'escuelita', 'medico', 'ventanilla', 'credencial'],
  'Masivo Descabezado': ['kiosco', 'seguridad', 'ventanilla', 'credencial'],
  Camaronera: ['kiosco', 'seguridad', 'ventanilla', 'credencial'],
  'Fijo administrativo': ['kiosco', 'seguridad', 'medico', 'ventanilla', 'credencial'],
};

export const CARGOS: Readonly<Record<TipoProceso, readonly string[]>> = {
  'Masivo Valor Agregado': ['Operario(a) de valor agregado', 'Clasificador(a) de camarón'],
  'Masivo Descabezado': ['Descabezador(a)', 'Ayudante de cuadrilla'],
  Camaronera: ['Alimentador(a) de piscina', 'Ayudante de cosecha'],
  'Fijo administrativo': ['Asistente de bodega', 'Analista de calidad'],
};

export const NOMBRES = [
  'María José', 'Ana Lucía', 'Gabriela', 'Daniela', 'Andrea', 'Karla', 'Jessenia', 'Mayra',
  'Rosa', 'Johanna', 'Erika', 'Verónica', 'Nathaly', 'Katherine', 'Paola', 'Silvia',
  'Carlos', 'Luis', 'José', 'Jorge', 'Andrés', 'Kevin', 'Bryan', 'Jefferson',
  'Fernando', 'Wilson', 'Edison', 'Darwin', 'Miguel Ángel', 'Javier', 'Cristhian', 'Fabricio',
] as const;

export const APELLIDOS = [
  'Mendoza', 'Zambrano', 'Cedeño', 'Vera', 'Macías', 'Moreira', 'Bravo', 'Alvarado',
  'Quiñónez', 'Castro', 'Ponce', 'Villamar', 'Torres', 'Chávez', 'Pincay', 'Mero',
  'Loor', 'Montenegro', 'Figueroa', 'Suárez', 'Salazar', 'Reyes', 'Tumbaco', 'Anchundia',
  'Cevallos', 'Plúas', 'Intriago', 'Murillo', 'Holguín', 'Barzola',
] as const;

export const OPERADORES: Readonly<Record<EstacionId, readonly string[]>> = {
  kiosco: ['Kiosco K-01', 'Kiosco K-02'],
  seguridad: ['Rubén Aguirre', 'Marlene Ortiz', 'Iván Cárdenas'],
  escuelita: ['Teresa Lindao', 'Héctor Gaibor'],
  medico: ['Dra. Paulina Haro', 'Dr. Esteban Navas'],
  ventanilla: ['Lorena Vélez', 'Óscar Bajaña', 'Diana Yépez', 'Raúl Piguave'],
  credencial: ['Marco Solís', 'Elena Franco'],
};

export const MOTIVOS_CIERRE = [
  'No se presentó al llamado',
  'Retiro voluntario',
  'Turno duplicado',
] as const;

export const MOTIVOS_TRANSFERENCIA = [
  'Balancear la carga entre estaciones',
  'Requiere revisión de otra área',
  'Error de ruta del proceso',
] as const;

export const ZONAS_TATUAJE = ['Brazos', 'Cuello', 'Torso', 'Piernas'] as const;

/** Usuario de la sesión simulada (rol sin acceso a la ficha médica). */
export const USUARIO = {
  nombre: 'Lucía Andrade',
  rol: 'Analista de Talento Humano',
  iniciales: 'LA',
} as const;

/** Único texto para cualquier bloqueo (POL-02): nunca la fuente ni el motivo. */
export const MENSAJE_DISCRETO =
  'Gracias por tu interés. Por ahora no podemos continuar con tu proceso. Si tienes dudas, acércate al personal de Talento Humano.';

export const FECHA_HOY = 'Jueves 23 de octubre de 2026';

/** Hora fija del prototipo (10:42) para que las capturas sean reproducibles. */
export const AHORA_MIN = 10 * 60 + 42;
