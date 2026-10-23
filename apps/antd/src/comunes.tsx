import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  WarningFilled,
} from '@ant-design/icons';
import { Button, Card, Col, Result, Row, Skeleton, Tag } from 'antd';
import type { EstadoCarga, EstadoFuente, EstadoTurno, NivelCarga, NivelRiesgo } from '@propuestas/datos';
import type { ReactNode } from 'react';

export function ConCarga({ estado, reintentar, children }: { estado: EstadoCarga; reintentar: () => void; children: ReactNode }) {
  if (estado === 'cargando') {
    return (
      <div aria-busy="true" aria-label="Cargando">
        <Skeleton.Input active style={{ width: 280, marginBottom: 24 }} />
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col span={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }
  if (estado === 'error') {
    return (
      <Card>
        <Result
          status="error"
          title="No pudimos cargar la información"
          subTitle="Se perdió la conexión con el servidor de turnos. Tus cambios no se perdieron; vuelve a intentarlo en unos segundos."
          extra={<Button type="primary" onClick={reintentar}>Reintentar</Button>}
        />
      </Card>
    );
  }
  return <>{children}</>;
}

const TURNO: Record<EstadoTurno, { t: string; c: string }> = {
  espera: { t: 'En espera', c: 'default' },
  llamado: { t: 'Llamado', c: 'warning' },
  atencion: { t: 'En atención', c: 'success' },
};
export const ChipTurno = ({ estado }: { estado: EstadoTurno }) => <Tag color={TURNO[estado].c}>{TURNO[estado].t}</Tag>;

export function ChipNivel({ nivel }: { nivel: NivelCarga }) {
  if (nivel === 'critico') return <Tag color="#C4320A" icon={<CloseCircleFilled />}>Crítico</Tag>;
  if (nivel === 'atencion') return <Tag color="warning" icon={<WarningFilled />}>Atención</Tag>;
  return <Tag color="success" icon={<CheckCircleFilled />}>Normal</Tag>;
}

export function ChipRiesgo({ riesgo }: { riesgo: NivelRiesgo }) {
  const m = {
    BAJO: { c: 'success', i: <CheckCircleFilled /> },
    MEDIO: { c: 'warning', i: <ExclamationCircleFilled /> },
    ALTO: { c: 'error', i: <CloseCircleFilled /> },
  } as const;
  return <Tag color={m[riesgo].c} icon={m[riesgo].i} style={{ fontSize: 14, padding: '4px 10px' }}>Riesgo {riesgo}</Tag>;
}

export function ChipFuente({ estado }: { estado: EstadoFuente }) {
  const m = {
    sin_novedad: { t: 'Sin novedad', c: 'success', i: <CheckCircleFilled /> },
    observacion: { t: 'Con observación', c: 'warning', i: <ExclamationCircleFilled /> },
    carente: { t: 'Sin respuesta', c: 'default', i: <InfoCircleFilled /> },
    revision: { t: 'Revisión manual', c: 'processing', i: <InfoCircleFilled /> },
  } as const;
  return <Tag color={m[estado].c} icon={m[estado].i}>{m[estado].t}</Tag>;
}
