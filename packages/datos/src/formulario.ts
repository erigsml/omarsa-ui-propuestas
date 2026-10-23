import type { Documento, Persona } from './tipos';
import { formatoCedula, nombreCompleto } from './formato';

/** Formulario corto de atención en Seguridad (consentimiento + inspección + veredicto). */
export interface FormularioSeguridad {
  readonly consentimiento: boolean;
  readonly drogas: '' | 'no_reactivo' | 'reactivo';
  readonly tatuajes: readonly string[];
  readonly observaciones: string;
}

export const FORMULARIO_VACIO: FormularioSeguridad = {
  consentimiento: false,
  drogas: '',
  tatuajes: [],
  observaciones: '',
};

export type ErroresSeguridad = Partial<Record<keyof FormularioSeguridad, string>>;

/** Reglas comunes a las 4 apps. Mensajes con qué pasó y qué hacer. */
export function validarSeguridad(v: FormularioSeguridad, aprobar: boolean): ErroresSeguridad {
  const e: Record<string, string> = {};
  if (!v.consentimiento) e.consentimiento = 'Falta la firma del consentimiento. Pídela antes de la prueba.';
  if (!v.drogas) e.drogas = 'Elige el resultado de la prueba de drogas.';
  if (aprobar && v.drogas === 'reactivo') e.drogas = 'Con resultado reactivo no se puede aprobar. Usa «Registrar novedad».';
  if (v.observaciones.trim().length < 10) e.observaciones = 'Escribe al menos 10 caracteres: quedan en la auditoría.';
  return e;
}

/** Contenido simulado de un documento para la vista previa (sin PDF real). */
export interface VistaPrevia {
  readonly titulo: string;
  readonly codigo: string;
  readonly campos: readonly { etiqueta: string; valor: string }[];
  readonly parrafos: readonly string[];
  readonly firmas: readonly string[];
}

export function vistaPrevia(d: Documento, p: Persona): VistaPrevia {
  const campos = [
    { etiqueta: 'Nombre', valor: nombreCompleto(p) },
    { etiqueta: 'Cédula', valor: formatoCedula(p.cedula) },
    { etiqueta: 'Cargo', valor: p.cargo },
    { etiqueta: 'Proceso', valor: p.proceso },
  ];
  const parrafos = [
    `Documento generado desde la plantilla ${d.codigo} con los datos del expediente. Hoja ${d.paginas > 1 ? `1 de ${d.paginas}` : 'única'}.`,
    'El contenido de este documento es ilustrativo: los datos son sintéticos y no corresponden a ninguna persona real.',
  ];
  const firmas = d.estado === 'Escaneado' || d.estado === 'Generado' ? [] : ['Firma de la persona', 'Responsable del puesto'];
  return { titulo: d.nombre, codigo: d.codigo, campos, parrafos, firmas };
}
