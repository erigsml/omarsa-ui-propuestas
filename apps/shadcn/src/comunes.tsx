import { AlertTriangle, CheckCircle2, Info, WifiOff, XCircle } from 'lucide-react';
import type { EstadoCarga, EstadoFuente, EstadoTurno, NivelCarga, NivelRiesgo } from '@propuestas/datos';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle, Badge, Skeleton } from './ui/basicos';
import { Button } from './ui/button';

export function ConCarga({ estado, reintentar, children }: { estado: EstadoCarga; reintentar: () => void; children: ReactNode }) {
  if (estado === 'cargando') {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label="Cargando">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }
  if (estado === 'error') {
    return (
      <Alert variant="error">
        <WifiOff />
        <AlertTitle>No pudimos cargar la información</AlertTitle>
        <AlertDescription>
          Se perdió la conexión con el servidor de turnos. Tus cambios no se perdieron; vuelve a intentarlo en unos segundos.
          <div className="mt-3">
            <Button variant="outline" onClick={reintentar}>
              Reintentar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  return <>{children}</>;
}

const TURNO = {
  espera: { t: 'En espera', v: 'neutro' },
  llamado: { t: 'Llamado', v: 'aviso' },
  atencion: { t: 'En atención', v: 'exito' },
} as const;
export const ChipTurno = ({ estado }: { estado: EstadoTurno }) => <Badge variant={TURNO[estado].v}>{TURNO[estado].t}</Badge>;

export function ChipNivel({ nivel }: { nivel: NivelCarga }) {
  if (nivel === 'critico')
    return (
      <Badge variant="destructive">
        <XCircle /> Crítico
      </Badge>
    );
  if (nivel === 'atencion')
    return (
      <Badge variant="aviso">
        <AlertTriangle /> Atención
      </Badge>
    );
  return (
    <Badge variant="exito">
      <CheckCircle2 /> Normal
    </Badge>
  );
}

export function ChipRiesgo({ riesgo }: { riesgo: NivelRiesgo }) {
  const m = {
    BAJO: { v: 'exito', i: <CheckCircle2 /> },
    MEDIO: { v: 'aviso', i: <AlertTriangle /> },
    ALTO: { v: 'error', i: <XCircle /> },
  } as const;
  return (
    <Badge variant={m[riesgo].v} className="px-2.5 py-1 text-sm [&>svg]:size-4">
      {m[riesgo].i} Riesgo {riesgo}
    </Badge>
  );
}

export function ChipFuente({ estado }: { estado: EstadoFuente }) {
  const m = {
    sin_novedad: { t: 'Sin novedad', v: 'exito', i: <CheckCircle2 /> },
    observacion: { t: 'Con observación', v: 'aviso', i: <AlertTriangle /> },
    carente: { t: 'Sin respuesta', v: 'neutro', i: <Info /> },
    revision: { t: 'Revisión manual', v: 'info', i: <Info /> },
  } as const;
  return (
    <Badge variant={m[estado].v}>
      {m[estado].i} {m[estado].t}
    </Badge>
  );
}
