import { Alert, Badge, Button, Card, Group, SimpleGrid, Skeleton, Stack } from '@mantine/core';
import { IconAlertTriangleFilled, IconCircleCheckFilled, IconCircleXFilled, IconInfoCircleFilled, IconWifiOff } from '@tabler/icons-react';
import type { EstadoCarga, EstadoFuente, EstadoTurno, NivelCarga, NivelRiesgo } from '@propuestas/datos';
import type { ReactNode } from 'react';

export function ConCarga({ estado, reintentar, children }: { estado: EstadoCarga; reintentar: () => void; children: ReactNode }) {
  if (estado === 'cargando') {
    return (
      <Stack gap={16} aria-busy="true" aria-label="Cargando">
        <Skeleton h={32} w={280} />
        <SimpleGrid cols={5}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} h={110} radius="md" />
          ))}
        </SimpleGrid>
        <Skeleton h={260} radius="md" />
        <Skeleton h={320} radius="md" />
      </Stack>
    );
  }
  if (estado === 'error') {
    return (
      <Alert color="error" variant="light" icon={<IconWifiOff />} title="No pudimos cargar la información">
        Se perdió la conexión con el servidor de turnos. Tus cambios no se perdieron; vuelve a intentarlo en unos segundos.
        <Group mt={12}>
          <Button color="error" variant="outline" onClick={reintentar}>
            Reintentar
          </Button>
        </Group>
      </Alert>
    );
  }
  return <>{children}</>;
}

export const Tarjeta = Card;

const TURNO: Record<EstadoTurno, { t: string; c: string }> = {
  espera: { t: 'En espera', c: 'gray' },
  llamado: { t: 'Llamado', c: 'yellow' },
  atencion: { t: 'En atención', c: 'teal' },
};
export const ChipTurno = ({ estado }: { estado: EstadoTurno }) => (
  <Badge variant="light" color={TURNO[estado].c} radius="sm" tt="none" fw={600}>
    {TURNO[estado].t}
  </Badge>
);

export function ChipNivel({ nivel }: { nivel: NivelCarga }) {
  if (nivel === 'critico')
    return (
      <Badge color="error" variant="filled" radius="sm" tt="none" leftSection={<IconCircleXFilled size={12} />}>
        Crítico
      </Badge>
    );
  if (nivel === 'atencion')
    return (
      <Badge color="yellow.9" variant="light" radius="sm" tt="none" leftSection={<IconAlertTriangleFilled size={12} />}>
        Atención
      </Badge>
    );
  return (
    <Badge color="teal" variant="light" radius="sm" tt="none" leftSection={<IconCircleCheckFilled size={12} />}>
      Normal
    </Badge>
  );
}

export function ChipRiesgo({ riesgo }: { riesgo: NivelRiesgo }) {
  const m = {
    BAJO: { c: 'teal', i: <IconCircleCheckFilled size={14} /> },
    MEDIO: { c: 'yellow.9', i: <IconAlertTriangleFilled size={14} /> },
    ALTO: { c: 'error', i: <IconCircleXFilled size={14} /> },
  } as const;
  return (
    <Badge size="lg" variant="light" color={m[riesgo].c} radius="sm" tt="none" leftSection={m[riesgo].i}>
      Riesgo {riesgo}
    </Badge>
  );
}

export function ChipFuente({ estado }: { estado: EstadoFuente }) {
  const m = {
    sin_novedad: { t: 'Sin novedad', c: 'teal', i: <IconCircleCheckFilled size={12} /> },
    observacion: { t: 'Con observación', c: 'yellow.9', i: <IconAlertTriangleFilled size={12} /> },
    carente: { t: 'Sin respuesta', c: 'gray', i: <IconInfoCircleFilled size={12} /> },
    revision: { t: 'Revisión manual', c: 'blue', i: <IconInfoCircleFilled size={12} /> },
  } as const;
  return (
    <Badge variant="light" color={m[estado].c} radius="sm" tt="none" leftSection={m[estado].i}>
      {m[estado].t}
    </Badge>
  );
}
