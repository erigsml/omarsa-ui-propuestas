import { FileOutlined, FileProtectOutlined, LockOutlined, PrinterOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Alert, Avatar, Button, Card, Col, Descriptions, Empty, List, Row, Space, Statistic, Steps, Table, Tabs, Tag } from 'antd';
import {
  estacion,
  formatoCedula,
  iniciales,
  Isotipo,
  MENSAJE_DISCRETO,
  nombreCompleto,
  persona as buscarPersona,
  type Persona,
  useCarga,
  useEstado,
  vistaPrevia,
} from '@propuestas/datos';
import { useState } from 'react';
import { ChipFuente, ChipRiesgo, ConCarga } from '../comunes';

export function Expediente({ personaId }: { personaId: string }) {
  const estado = useEstado();
  const p = buscarPersona(estado, personaId);
  const carga = useCarga(`exp-${personaId}`, 500);
  if (!p || p.empresaId !== estado.empresaId) {
    return (
      <Card>
        <Empty description="Elige un expediente: busca a la persona por cédula o nombre en la barra superior (atajo: /)." />
      </Card>
    );
  }
  const actual = p.hitos.findIndex((h) => h.estado === 'actual');

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 24 } }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Avatar size={72} style={{ background: '#F1A7AB', color: '#6C0A10', fontSize: 26, fontWeight: 600 }}>
            {iniciales(p)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Space size={8} align="center">
              <h1 style={{ margin: 0, fontSize: 25, fontWeight: 650 }}>{nombreCompleto(p)}</h1>
              <Tag color={p.estado === 'En revisión' ? 'warning' : p.estado === 'Proceso cerrado' ? 'default' : 'red'}>{p.estado}</Tag>
              {p.reingreso && <Tag color="blue">Reingreso</Tag>}
            </Space>
            <Space size={16} style={{ marginTop: 8, color: '#374151' }} wrap>
              <span>
                CI <b className="num">{formatoCedula(p.cedula)}</b>
              </span>
              <span>{p.cargo}</span>
              <span>{p.proceso}</span>
              {actual >= 0 && <span>Ahora en {estacion(p.hitos[actual]?.estacion ?? 'kiosco').nombre}</span>}
            </Space>
          </div>
          <Button icon={<PrinterOutlined />} disabled>
            Imprimir credencial
          </Button>
        </div>
        <Steps
          style={{ marginTop: 28 }}
          size="small"
          labelPlacement="vertical"
          current={actual >= 0 ? actual : p.hitos.length}
          items={p.hitos.map((h) => ({
            title: estacion(h.estacion).nombre,
            status: h.estado === 'completado' ? 'finish' : h.estado === 'actual' ? 'process' : 'wait',
            disabled: h.estado === 'no_aplica',
            description:
              h.estado === 'completado'
                ? `${h.hora} · ${h.operador}`
                : h.estado === 'actual'
                  ? `Desde las ${h.hora}`
                  : h.estado === 'no_aplica'
                    ? 'No aplica'
                    : 'Pendiente',
            style: h.estado === 'no_aplica' ? { opacity: 0.5 } : undefined,
          }))}
        />
      </Card>

      <Tabs
        defaultActiveKey="datos"
        items={[
          { key: 'datos', label: 'Datos', children: <Datos p={p} /> },
          { key: 'documentos', label: `Documentos (${p.documentos.length})`, children: <Documentos p={p} /> },
          { key: 'validaciones', label: 'Validaciones', children: <Validaciones p={p} /> },
          { key: 'auditoria', label: 'Auditoría', children: <Auditoria p={p} /> },
        ]}
      />
    </ConCarga>
  );
}

function Datos({ p }: { p: Persona }) {
  return (
    <Row gutter={16}>
      <Col span={15}>
        <Card title="Datos personales" extra={<span style={{ color: '#5C6370' }}>Precargados desde la solicitud FOR-027</span>}>
          <Descriptions
            column={3}
            layout="vertical"
            colon={false}
            items={[
              ['Nombres', p.nombres],
              ['Apellidos', p.apellidos],
              ['Cédula', formatoCedula(p.cedula)],
              ['Fecha de nacimiento', p.fechaNacimiento],
              ['Teléfono', p.telefono],
              ['Correo', p.correo],
              ['Dirección', p.direccion],
              ['Cargo', p.cargo],
              ['Proceso', p.proceso],
            ].map(([k, v]) => ({ key: k, label: k, children: <span style={{ fontWeight: 500 }}>{v}</span> }))}
          />
        </Card>
      </Col>
      <Col span={9}>
        <Card title="Ficha médica" extra={<span style={{ color: '#5C6370' }}>POL-03</span>} style={{ height: '100%' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 20, border: '1px dashed #C9CDD4', borderRadius: 8, background: '#F5F6F8' }}>
            <LockOutlined style={{ fontSize: 24 }} />
            <div>
              <strong>Solo personal médico</strong>
              <div style={{ color: '#5C6370', fontSize: 13, marginTop: 4 }}>Tu perfil ve la aptitud cuando el médico la registra, no el diagnóstico.</div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

function Documentos({ p }: { p: Persona }) {
  const [sel, setSel] = useState(p.documentos.find((d) => !d.restringido)?.id ?? '');
  const doc = p.documentos.find((d) => d.id === sel);
  const vp = doc ? vistaPrevia(doc, p) : null;
  return (
    <Row gutter={16}>
      <Col span={11}>
        <Card styles={{ body: { padding: 8 } }}>
          <List
            dataSource={[...p.documentos]}
            renderItem={(d) => (
              <List.Item
                className={d.id === sel ? 'doc-activo' : undefined}
                style={{ padding: '12px', borderRadius: 6, cursor: d.restringido ? 'not-allowed' : 'pointer' }}
                onClick={() => !d.restringido && setSel(d.id)}
                onKeyDown={(e) => e.key === 'Enter' && !d.restringido && setSel(d.id)}
                tabIndex={d.restringido ? -1 : 0}
                aria-pressed={d.id === sel}
                role="button"
                extra={<Tag color={d.estado === 'Pendiente de firma' ? 'warning' : d.estado === 'Firmado' ? 'success' : 'blue'}>{d.estado}</Tag>}
              >
                <List.Item.Meta
                  avatar={d.restringido ? <LockOutlined style={{ fontSize: 20 }} /> : <FileOutlined style={{ fontSize: 20 }} />}
                  title={d.nombre}
                  description={d.restringido ? 'Solo personal médico' : `${d.codigo} · ${estacion(d.estacion).nombre} · ${d.hora} · ${d.paginas} pág.`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={13}>
        {vp && (
          <article className="papel" aria-label="Vista previa">
            <header>
              <Space>
                <Isotipo tam={22} /> Acuícola Demo del Pacífico S.A.
              </Space>
              <span>{vp.codigo}</span>
            </header>
            <h3>{vp.titulo}</h3>
            <div className="campos">
              {vp.campos.map((c) => (
                <div key={c.etiqueta}>
                  <span>{c.etiqueta}</span>
                  {c.valor}
                </div>
              ))}
            </div>
            {vp.parrafos.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {vp.firmas.length > 0 && (
              <div className="firmas">
                {vp.firmas.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
            )}
          </article>
        )}
      </Col>
    </Row>
  );
}

function Validaciones({ p }: { p: Persona }) {
  return (
    <Card>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: '16px 20px', background: '#F5F6F8', borderRadius: 8, marginBottom: 16 }}>
        <Statistic title="Score de cumplimiento" value={p.score} suffix="/100" valueStyle={{ fontWeight: 650 }} />
        <ChipRiesgo riesgo={p.riesgo} />
        <span style={{ flex: 1 }} />
        <Button icon={<FileProtectOutlined />} disabled>
          Informe con evidencias
        </Button>
      </div>
      <Alert
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        style={{ marginBottom: 16 }}
        message="Lo que ve el candidato"
        description={`Nunca la fuente ni el motivo. Si algo lo detiene, solo: «${MENSAJE_DISCRETO}»`}
      />
      <Table
        size="small"
        pagination={false}
        rowKey="fuente"
        dataSource={[...p.validaciones]}
        columns={[
          { title: 'Fuente', dataIndex: 'fuente', render: (v: string) => <strong>{v}</strong> },
          { title: 'Tipo', dataIndex: 'tipo', width: 160 },
          { title: 'Resultado', dataIndex: 'estado', width: 200, render: (_: unknown, v) => <ChipFuente estado={v.estado} /> },
          { title: 'Hora', dataIndex: 'hora', width: 80 },
        ]}
      />
    </Card>
  );
}

function Auditoria({ p }: { p: Persona }) {
  return (
    <Card title="Auditoría" extra={<span style={{ color: '#5C6370' }}>Solo inserción: nadie edita ni borra la traza</span>}>
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={[...p.auditoria]}
        columns={[
          { title: 'Hora', dataIndex: 'hora', width: 80 },
          { title: 'Quién', dataIndex: 'usuario', width: 200 },
          { title: 'Acción', dataIndex: 'accion' },
          { title: 'Desde dónde', dataIndex: 'origen', width: 220, render: (v: string) => <span style={{ color: '#5C6370' }}>{v}</span> },
        ]}
      />
    </Card>
  );
}
