import {
  ClockCircleOutlined,
  CloseCircleOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
  UserSwitchOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { type ProColumns, ProTable } from '@ant-design/pro-components';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import {
  acciones,
  cuellosDeBotella,
  duracion,
  ESTACIONES,
  ESTACIONES_CON_TURNO,
  type EstacionId,
  FECHA_HOY,
  filtrarTurnos,
  flujoPorHora,
  horaActual,
  indicadores,
  MOTIVOS_CIERRE,
  MOTIVOS_TRANSFERENCIA,
  turnosActivos,
  type TurnoVista,
  useCarga,
  useEstado,
} from '@propuestas/datos';
import { type ReactNode, useMemo, useState } from 'react';
import { ChipNivel, ChipTurno, ConCarga } from '../comunes';

const COLOR_NIVEL = { normal: '#6B7280', atencion: '#B7791F', critico: '#C4320A' } as const;

export function Tablero({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const carga = useCarga(`tablero-${estado.empresaId}`);
  const { notification } = App.useApp();
  const ind = indicadores(estado);
  const cuellos = cuellosDeBotella(estado);
  const peor = [...cuellos].sort((a, b) => b.carga - a.carga)[0];
  const [texto, setTexto] = useState('');
  const [est, setEst] = useState<EstacionId | 'todas'>('todas');
  const [soloExcedidos, setSoloExcedidos] = useState(false);
  const [transferir, setTransferir] = useState<TurnoVista | null>(null);
  const [cerrar, setCerrar] = useState<TurnoVista | null>(null);
  const [motivoCierre, setMotivoCierre] = useState<string>(MOTIVOS_CIERRE[0]);

  const filas = useMemo(() => filtrarTurnos(turnosActivos(estado), { texto, estacion: est, soloExcedidos }), [estado, texto, est, soloExcedidos]);

  const columnas: ProColumns<TurnoVista>[] = [
    { title: 'Turno', dataIndex: 'codigo', width: 88, sorter: (a, b) => a.codigo.localeCompare(b.codigo), render: (_, t) => <strong className="num">{t.codigo}</strong> },
    {
      title: 'Persona',
      dataIndex: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
      render: (_, t) => (
        <div>
          <Typography.Link strong onClick={() => onAbrir(t.personaId)}>
            {t.nombre}
          </Typography.Link>
          <div style={{ fontSize: 12, color: '#5C6370' }}>
            {t.cedula} · {t.cargo}
          </div>
        </div>
      ),
    },
    { title: 'Estación', dataIndex: 'estacionNombre', width: 160, sorter: (a, b) => a.estacionNombre.localeCompare(b.estacionNombre), render: (_, t) => `${t.estacionNombre}${t.puesto ? ` · ${t.puesto}` : ''}` },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 130,
      filters: [
        { text: 'En espera', value: 'espera' },
        { text: 'Llamado', value: 'llamado' },
        { text: 'En atención', value: 'atencion' },
      ],
      onFilter: (v, t) => t.estado === v,
      render: (_, t) => <ChipTurno estado={t.estado} />,
    },
    {
      title: 'Espera',
      dataIndex: 'esperaMin',
      width: 190,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.esperaMin - b.esperaMin,
      render: (_, t) =>
        t.excedido ? (
          <span className="num" style={{ color: '#9E2806', fontWeight: 600 }}>
            <WarningFilled /> {duracion(t.esperaMin)} <span style={{ fontWeight: 400 }}>(máx. {t.objetivoMin})</span>
          </span>
        ) : (
          <span className="num">{duracion(t.esperaMin)}</span>
        ),
    },
    {
      title: 'Acciones',
      valueType: 'option',
      width: 96,
      render: (_, t) => [
        <Tooltip title="Transferir a otra estación" key="t">
          <Button type="text" size="small" icon={<SwapOutlined />} aria-label="Transferir" onClick={() => setTransferir(t)} />
        </Tooltip>,
        <Tooltip title="Cerrar turno" key="c">
          <Button type="text" size="small" danger icon={<CloseCircleOutlined />} aria-label="Cerrar turno" onClick={() => setCerrar(t)} />
        </Tooltip>,
      ],
    },
  ];

  const datosFlujo = flujoPorHora(estado).flatMap((f) => [
    { hora: f.hora, serie: 'Ingresos', valor: f.ingresos },
    { hora: f.hora, serie: 'Finalizados', valor: f.atendidos },
  ]);

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <div className="cabecera">
        <h1>Tablero de turnos</h1>
        <p>
          {FECHA_HOY} · actualizado a las {horaActual()}
        </p>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Kpi icono={<TeamOutlined />} titulo="Personas en planta" valor={ind.activos} nota={`${ind.enAtencion} en un puesto`} />
        <Kpi icono={<UserSwitchOutlined />} titulo="En espera" valor={ind.enEspera} nota="en todas las estaciones" />
        <Kpi icono={<UserOutlined />} titulo="Atendidos hoy" valor={ind.atendidosHoy} nota="desde las 06:00" />
        <Kpi icono={<ClockCircleOutlined />} titulo="Espera promedio" valor={ind.esperaPromedio} sufijo="min" nota={`objetivo ${ind.objetivoPromedio} min`} />
        <Kpi icono={<WarningFilled />} titulo="Turnos excedidos" valor={ind.excedidos} nota={ind.excedidos ? 'superan su espera máxima' : 'todo en tiempo'} alerta={ind.excedidos > 0} />
      </Row>

      {peor?.nivel === 'critico' && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={<strong>{peor.nombre} es el cuello de botella</strong>}
          description={`Espera promedio de ${peor.esperaPromedio} min con ${peor.puestos} puestos (máximo ${peor.objetivoMin} min). Abre otro puesto o transfiere turnos.`}
          action={
            <Button
              onClick={() => {
                setEst(peor.estacion);
                setSoloExcedidos(true);
              }}
            >
              Ver excedidos de {peor.nombre}
            </Button>
          }
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={15}>
          <Card title="Cuellos de botella por estación" extra={<span style={{ color: '#5C6370', fontSize: 12.8 }}>Línea vertical = espera máxima</span>} style={{ height: '100%' }}>
            {cuellos.map((c) => (
              <div key={c.estacion} className={`cuello ${c.nivel}`}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                  <ChipNivel nivel={c.nivel} />
                </div>
                <div style={{ position: 'relative' }} role="img" aria-label={`${c.nombre}: ${c.esperaPromedio} de ${c.objetivoMin} minutos`}>
                  <Progress percent={Math.min(100, c.carga * 50)} showInfo={false} strokeColor={COLOR_NIVEL[c.nivel]} size={['100%', 10]} />
                  <span style={{ position: 'absolute', left: '50%', top: 2, bottom: 2, width: 2, background: '#1F2329' }} />
                </div>
                <div className="meta">
                  <b className="num">{c.esperaPromedio} min</b> prom. · {c.enEspera} en cola
                  <br />
                  {c.enAtencion} en puesto · {c.puestos} puestos
                </div>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={9}>
          <Card title="Flujo por hora" extra={<span style={{ color: '#5C6370', fontSize: 12.8 }}>Ingresos y finalizados</span>} style={{ height: '100%' }}>
            <Column
              data={datosFlujo}
              xField="hora"
              yField="valor"
              colorField="serie"
              group
              height={280}
              scale={{ color: { range: ['#DD343B', '#4B5563'] } }}
              axis={{ y: { title: false }, x: { title: false } }}
              legend={{ color: { position: 'bottom', layout: { justifyContent: 'center' } } }}
              style={{ radiusTopLeft: 3, radiusTopRight: 3, maxWidth: 18 }}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<TurnoVista>
        headerTitle={
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Turnos activos</div>
            <div style={{ fontSize: 12.8, color: '#5C6370', fontWeight: 400 }}>{filas.length} turnos</div>
          </div>
        }
        rowKey="id"
        columns={columnas}
        dataSource={filas}
        search={false}
        size="small"
        cardBordered
        options={{ density: true, setting: true, reload: false, fullScreen: false }}
        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t, r) => `${r[0]}–${r[1]} de ${t}` }}
        rowClassName={(t) => (t.excedido ? 'fila-excedida' : '')}
        locale={{ emptyText: <Empty description="No hay turnos con esos filtros. Cambia la estación o borra la búsqueda." /> }}
        toolBarRender={() => [
          <Input.Search key="b" allowClear placeholder="Nombre, cédula o turno" aria-label="Filtrar turnos" value={texto} onChange={(e) => setTexto(e.target.value)} style={{ width: 260 }} />,
          <Select
            key="e"
            aria-label="Estación"
            value={est}
            onChange={setEst}
            style={{ width: 200 }}
            options={[{ value: 'todas', label: 'Todas las estaciones' }, ...ESTACIONES.filter((e) => ESTACIONES_CON_TURNO.includes(e.id)).map((e) => ({ value: e.id, label: e.nombre }))]}
          />,
          <Space key="x">
            <Switch checked={soloExcedidos} onChange={setSoloExcedidos} aria-label="Solo excedidos" />
            Solo excedidos
          </Space>,
        ]}
      />

      <ModalTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(destino, motivo) => {
          if (!transferir) return;
          notification.success({ message: 'Turno transferido', description: acciones.transferir(transferir.id, destino, motivo), placement: 'bottomRight' });
          setTransferir(null);
        }}
      />
      <Modal
        open={!!cerrar}
        title={`¿Cerrar el turno ${cerrar?.codigo ?? ''}?`}
        okText="Cerrar turno"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        onCancel={() => setCerrar(null)}
        onOk={() => {
          if (!cerrar) return;
          notification.info({ message: 'Turno cerrado', description: acciones.cerrar(cerrar.id, motivoCierre), placement: 'bottomRight' });
          setCerrar(null);
        }}
      >
        <p>
          {cerrar?.nombre} sale de la cola de {cerrar?.estacionNombre} y su proceso queda cerrado por hoy. Queda registrado en la auditoría y no se puede deshacer.
        </p>
        <Form layout="vertical">
          <Form.Item label="Motivo">
            <Select value={motivoCierre} onChange={setMotivoCierre} options={MOTIVOS_CIERRE.map((m) => ({ value: m, label: m }))} />
          </Form.Item>
        </Form>
      </Modal>
    </ConCarga>
  );
}

function Kpi({ icono, titulo, valor, sufijo, nota, alerta }: { icono: ReactNode; titulo: string; valor: number; sufijo?: string; nota: string; alerta?: boolean }) {
  return (
    <Col flex="1">
      <Card className={alerta ? 'kpi-alerta' : undefined} styles={{ body: { padding: '16px 20px' } }}>
        <Statistic
          title={
            <span style={{ color: alerta ? '#9E2806' : undefined }}>
              {icono} {titulo}
            </span>
          }
          value={valor}
          suffix={sufijo}
          valueStyle={{ fontSize: 31, fontWeight: 650, color: alerta ? '#9E2806' : undefined }}
        />
        <div style={{ fontSize: 12.8, color: '#5C6370' }}>{nota}</div>
      </Card>
    </Col>
  );
}

export function ModalTransferir({ turno, onCerrar, onConfirmar }: { turno: TurnoVista | null; onCerrar: () => void; onConfirmar: (d: EstacionId, m: string) => void }) {
  const [form] = Form.useForm<{ destino: EstacionId; motivo: string }>();
  const opciones = ESTACIONES.filter((e) => ESTACIONES_CON_TURNO.includes(e.id) && e.id !== turno?.estacion);
  return (
    <Modal
      open={!!turno}
      title={`Transferir a ${turno?.nombre ?? ''}`}
      okText="Transferir"
      cancelText="Cancelar"
      destroyOnHidden
      onCancel={onCerrar}
      onOk={async () => {
        const v = await form.validateFields();
        onConfirmar(v.destino, v.motivo);
        form.resetFields();
      }}
    >
      <p>
        Turno {turno?.codigo}, hoy en {turno?.estacionNombre}. Pasa al final de la cola de destino.
      </p>
      <Form form={form} layout="vertical" preserve={false} initialValues={{ motivo: MOTIVOS_TRANSFERENCIA[0] }}>
        <Form.Item name="destino" label="Estación de destino" rules={[{ required: true, message: 'Elige la estación de destino.' }]}>
          <Select placeholder="Elige una estación" options={opciones.map((e) => ({ value: e.id, label: e.nombre }))} />
        </Form.Item>
        <Form.Item name="motivo" label="Motivo">
          <Select options={MOTIVOS_TRANSFERENCIA.map((m) => ({ value: m, label: m }))} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
