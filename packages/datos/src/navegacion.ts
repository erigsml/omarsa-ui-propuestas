import { useState } from 'react';

export type Pantalla = 'tablero' | 'expediente' | 'puesto';

export const PANTALLAS: readonly { id: Pantalla; titulo: string; descripcion: string }[] = [
  { id: 'tablero', titulo: 'Tablero de turnos', descripcion: 'Estado de la planta en vivo' },
  { id: 'expediente', titulo: 'Expedientes', descripcion: 'Ficha de cada persona' },
  { id: 'puesto', titulo: 'Puesto de atención', descripcion: 'Seguridad · Puesto S-02' },
];

export interface Navegacion {
  readonly pantalla: Pantalla;
  readonly personaId: string;
  readonly ir: (p: Pantalla) => void;
  readonly abrirExpediente: (personaId: string) => void;
}

/**
 * Navegación sin rutas de URL: estado interno.
 * `?pantalla=` solo fija la pantalla inicial (para capturas), no es enrutamiento.
 */
export function useNavegacion(personaInicial: string): Navegacion {
  const [pantalla, setPantalla] = useState<Pantalla>(() => {
    const p = new URLSearchParams(window.location.search).get('pantalla');
    return p === 'expediente' || p === 'puesto' ? p : 'tablero';
  });
  const [personaId, setPersonaId] = useState(personaInicial);
  return {
    pantalla,
    personaId,
    ir: setPantalla,
    abrirExpediente: (id) => {
      setPersonaId(id);
      setPantalla('expediente');
    },
  };
}
