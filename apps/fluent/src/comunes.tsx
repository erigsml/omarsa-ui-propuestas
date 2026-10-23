import {
  Badge,
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Skeleton,
  SkeletonItem,
  Toast,
  ToastBody,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components';
import {
  CheckmarkCircle16Filled,
  ErrorCircle16Filled,
  Info16Filled,
  Warning16Filled,
} from '@fluentui/react-icons';
import type { EstadoCarga, EstadoFuente, EstadoTurno, NivelCarga, NivelRiesgo } from '@propuestas/datos';
import type { ReactNode } from 'react';

/** Envuelve una pantalla con sus estados de carga (skeleton) y error (qué pasó + qué hacer). */
export function ConCarga({ estado, reintentar, children }: { estado: EstadoCarga; reintentar: () => void; children: ReactNode }) {
  if (estado === 'cargando') {
    return (
      <Skeleton aria-label="Cargando" className="esqueleto">
        <SkeletonItem style={{ height: 32, width: 280 }} />
        <div className="kpis">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonItem key={i} style={{ height: 104 }} />
          ))}
        </div>
        <SkeletonItem style={{ height: 240 }} />
        <SkeletonItem style={{ height: 320 }} />
      </Skeleton>
    );
  }
  if (estado === 'error') {
    return (
      <MessageBar intent="error" layout="multiline">
        <MessageBarBody>
          <MessageBarTitle>No pudimos cargar la información</MessageBarTitle>
          Se perdió la conexión con el servidor de turnos. Tus cambios no se perdieron; vuelve a intentarlo en unos segundos.
        </MessageBarBody>
        <MessageBarActions>
          <Button onClick={reintentar}>Reintentar</Button>
        </MessageBarActions>
      </MessageBar>
    );
  }
  return <>{children}</>;
}

export function useAvisos(toasterId: string) {
  const { dispatchToast } = useToastController(toasterId);
  return (titulo: string, cuerpo?: string, intent: 'success' | 'info' | 'warning' = 'success') =>
    dispatchToast(
      <Toast>
        <ToastTitle>{titulo}</ToastTitle>
        {cuerpo && <ToastBody>{cuerpo}</ToastBody>}
      </Toast>,
      { intent, timeout: 4000 },
    );
}

const ESTADO_TURNO: Record<EstadoTurno, { texto: string; color: 'informative' | 'warning' | 'success' }> = {
  espera: { texto: 'En espera', color: 'informative' },
  llamado: { texto: 'Llamado', color: 'warning' },
  atencion: { texto: 'En atención', color: 'success' },
};

export const ChipTurno = ({ estado }: { estado: EstadoTurno }) => (
  <Badge appearance="tint" color={ESTADO_TURNO[estado].color} shape="rounded">
    {ESTADO_TURNO[estado].texto}
  </Badge>
);

export function ChipNivel({ nivel }: { nivel: NivelCarga }) {
  if (nivel === 'critico')
    return (
      <Badge appearance="filled" color="danger" icon={<ErrorCircle16Filled />} style={{ background: '#C4320A' }}>
        Crítico
      </Badge>
    );
  if (nivel === 'atencion')
    return (
      <Badge appearance="tint" color="warning" icon={<Warning16Filled />}>
        Atención
      </Badge>
    );
  return (
    <Badge appearance="tint" color="success" icon={<CheckmarkCircle16Filled />}>
      Normal
    </Badge>
  );
}

export function ChipRiesgo({ riesgo }: { riesgo: NivelRiesgo }) {
  const m = {
    BAJO: { color: 'success', icono: <CheckmarkCircle16Filled /> },
    MEDIO: { color: 'warning', icono: <Warning16Filled /> },
    ALTO: { color: 'danger', icono: <ErrorCircle16Filled /> },
  } as const;
  return (
    <Badge appearance="tint" color={m[riesgo].color} icon={m[riesgo].icono} size="large">
      Riesgo {riesgo}
    </Badge>
  );
}

export function ChipFuente({ estado }: { estado: EstadoFuente }) {
  const m = {
    sin_novedad: { t: 'Sin novedad', c: 'success', i: <CheckmarkCircle16Filled /> },
    observacion: { t: 'Con observación', c: 'warning', i: <Warning16Filled /> },
    carente: { t: 'Sin respuesta', c: 'subtle', i: <Info16Filled /> },
    revision: { t: 'Revisión manual', c: 'informative', i: <Info16Filled /> },
  } as const;
  return (
    <Badge appearance="tint" color={m[estado].c} icon={m[estado].i}>
      {m[estado].t}
    </Badge>
  );
}
