import {
  CheckOutlined,
  DownOutlined,
  InboxOutlined,
  NotificationOutlined,
  RollbackOutlined,
  SoundOutlined,
  SwapOutlined,
  UserOutlined,
  WarningFilled,
  WarningOutlined,
} from '@ant-design/icons';
import { App, Avatar, Badge, Button, Card, Checkbox, Col, Divider, Dropdown, Empty, Form, Input, List, Radio, Row, Space, Tag } from 'antd';
import {
  acciones,
  colaDelPuesto,
  duracion,
  estacion,
  FORMULARIO_VACIO,
  type FormularioSeguridad,
  iniciales,
  persona as buscarPersona,
  siguienteEstacion,
  type TurnoVista,
  useAtajo,
  useCarga,
  useEstado,
  validarSeguridad,
  ZONAS_TATUAJE,
} from '@propuestas/datos';
import { useCallback, useRef, useState } from 'react';
import { ConCarga } from '../comunes';
import { ModalTransferir } from './Tablero';

export function Puesto({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const carga = useCarga(`puesto-${estado.empresaId}`, 500);
  const { notification } = App.useApp();
  const cola = colaDelPuesto(estado);
  const [transferir, setTransferir] = useState<TurnoVista | null>(null);
  const est = estacion(estado.puesto.estacion);
  const primero = cola.llamados[0];

  const llamar = useCallback(
    (n: number) => {
      const nombres = acciones.llamar(n);
      if (nombres.length) notification.info({ message: n > 1 ? `Llamaste a ${nombres.length} personas` : 'Llamado en pantalla', description: nombres.join(', '), placement: 'bottomRight' });
    },
    [notification],
  );
  useAtajo('l', useCallback(() => !cola.enAtencion && llamar(1), [cola.enAtencion, llamar]));

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <div className="cabecera">
        <h1>Puesto de atención</h1>
        <p>
          {est.nombre} · Puesto {estado.puesto.id} · {estado.puesto.operador} · Jornada matutina
        </p>
      </div>
      <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: '12px 20px' } }}>
        <Space size={24} role="status" style={{ width: '100%' }}>
          <Badge status="success" text="Operativo" />
          <span>
            En espera <b className="num">{cola.espera.length}</b>
          </span>
          <span>
            Llamados <b className="num">{cola.llamados.length}</b>
          </span>
          <span>
            Atención promedio <b>6 min</b>
          </span>
          <span style={{ color: '#5C6370' }}>Atajo: L llama al siguiente</span>
        </Space>
      </Card>

      <Row gutter={16} align="top">
        <Col span={15}>
          <Card aria-live="polite">
            {cola.enAtencion ? (
              <Atencion t={cola.enAtencion} onTransferir={setTransferir} onAbrir={onAbrir} />
            ) : primero ? (
              <div className="llamada">
                <Tag color="warning" icon={<NotificationOutlined />}>
                  Llamado en la TV · {primero.llamadas} {primero.llamadas === 1 ? 'vez' : 'veces'}
                </Tag>
                <div style={{ marginTop: 20 }}>
                  <Avatar size={96} icon={<UserOutlined />} style={{ background: '#E5E7EB', color: '#374151' }} />
                </div>
                <div className="nombre">{primero.nombre}</div>
                <div style={{ color: '#5C6370', marginBottom: 12 }}>
                  {primero.cedula} · {primero.cargo} · {primero.proceso}
                  {primero.reingreso && ' · Reingreso'}
                </div>
                <span className="codigo">{primero.codigo}</span>
                <Space size={12} wrap style={{ marginTop: 24, justifyContent: 'center', width: '100%' }}>
                  <Button type="primary" size="large" icon={<CheckOutlined />} onClick={() => acciones.atender(primero.id)} style={{ minWidth: 200 }}>
                    Atender
                  </Button>
                  <Button size="large" icon={<SoundOutlined />} onClick={() => notification.info({ message: 'Volviste a llamar', description: acciones.rellamar(primero.id), placement: 'bottomRight' })}>
                    Re-llamar
                  </Button>
                  <Button size="large" icon={<SwapOutlined />} onClick={() => setTransferir(primero)}>
                    Transferir
                  </Button>
                  <Button size="large" type="text" icon={<RollbackOutlined />} onClick={() => notification.warning({ message: 'Vuelve a la cola', description: `${acciones.devolverACola(primero.id)} no se presentó.`, placement: 'bottomRight' })}>
                    No se presentó
                  </Button>
                </Space>
              </div>
            ) : (
              <Empty
                image={<InboxOutlined style={{ fontSize: 56, color: '#9AA1AD' }} />}
                description={
                  cola.espera.length ? (
                    <>
                      <strong>Listo para atender</strong>
                      <br />
                      Hay {cola.espera.length} personas esperando. Llama a la siguiente.
                    </>
                  ) : (
                    <>
                      <strong>No hay nadie en espera</strong>
                      <br />
                      Cuando alguien termine en el kiosco o en otra estación, aparecerá en tu cola.
                    </>
                  )
                }
              />
            )}
          </Card>
        </Col>
        <Col span={9}>
          <Card aria-label="Cola de espera">
            <Space.Compact block>
              <Button type="primary" size="large" style={{ flex: 1, height: 56, fontSize: 18 }} icon={<SoundOutlined />} disabled={!!cola.enAtencion || cola.espera.length === 0} onClick={() => llamar(1)} aria-keyshortcuts="L">
                Llamar siguiente
              </Button>
              <Dropdown
                disabled={!!cola.enAtencion || cola.espera.length === 0}
                menu={{ items: [{ key: '2', label: 'Llamar a 2 personas' }, { key: '3', label: 'Llamar a 3 personas' }], onClick: (e) => llamar(Number(e.key)) }}
              >
                <Button type="primary" size="large" style={{ height: 56 }} icon={<DownOutlined />} aria-label="Llamar a varias personas" />
              </Dropdown>
            </Space.Compact>
            {cola.enAtencion && <p style={{ color: '#5C6370', fontSize: 12.8, marginTop: 8 }}>Termina la atención actual para llamar a otra persona.</p>}

            {cola.llamados.length > 1 && (
              <>
                <Divider orientation="left" plain>
                  Llamados ({cola.llamados.length})
                </Divider>
                <List
                  size="small"
                  dataSource={cola.llamados.slice(1)}
                  renderItem={(t) => (
                    <List.Item actions={[<Button key="r" size="small" icon={<SoundOutlined />} onClick={() => notification.info({ message: 'Volviste a llamar', description: acciones.rellamar(t.id), placement: 'bottomRight' })}>Re-llamar</Button>]}>
                      <List.Item.Meta title={`${t.codigo} · ${t.nombre}`} description={`Llamado ${t.llamadas} ${t.llamadas === 1 ? 'vez' : 'veces'}`} />
                    </List.Item>
                  )}
                />
              </>
            )}
            <Divider orientation="left" plain>
              En espera ({cola.espera.length}) · por orden de llegada
            </Divider>
            <List
              size="small"
              locale={{ emptyText: 'No hay nadie en espera' }}
              dataSource={cola.espera}
              renderItem={(t, i) => (
                <List.Item extra={<span className="num" style={{ color: t.excedido ? '#9E2806' : undefined, fontWeight: t.excedido ? 600 : 400 }}>{t.excedido && <WarningFilled />} {duracion(t.esperaMin)}</span>}>
                  <List.Item.Meta
                    avatar={<b className="num" style={{ display: 'inline-block', width: 48 }}>{t.codigo}</b>}
                    title={t.nombre}
                    description={`${i === 0 ? 'Siguiente · ' : ''}${t.cargo}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <ModalTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(d, m) => {
          if (!transferir) return;
          notification.success({ message: 'Turno transferido', description: acciones.transferir(transferir.id, d, m), placement: 'bottomRight' });
          setTransferir(null);
        }}
      />
    </ConCarga>
  );
}

function Atencion({ t, onTransferir, onAbrir }: { t: TurnoVista; onTransferir: (t: TurnoVista) => void; onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const { notification } = App.useApp();
  const p = buscarPersona(estado, t.personaId);
  const destino = p ? siguienteEstacion(p, t.estacion) : undefined;
  const [form] = Form.useForm<FormularioSeguridad>();
  const aprobar = useRef(true);
  const regla = (campo: keyof FormularioSeguridad) => ({
    validator: () => {
      const e = validarSeguridad({ ...FORMULARIO_VACIO, ...form.getFieldsValue() }, aprobar.current)[campo];
      return e ? Promise.reject(new Error(e)) : Promise.resolve();
    },
  });
  const enviar = async (aprueba: boolean) => {
    aprobar.current = aprueba;
    try {
      const v = await form.validateFields();
      const msg = acciones.finalizar(t.id, aprueba, String(v.observaciones).trim());
      if (aprueba) notification.success({ message: 'Atención finalizada', description: msg, placement: 'bottomRight' });
      else notification.warning({ message: 'Novedad registrada', description: msg, placement: 'bottomRight' });
    } catch {
      /* los errores ya se muestran junto a cada campo */
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Avatar size={56} style={{ background: '#F1A7AB', color: '#6C0A10', fontWeight: 600 }}>
          {p ? iniciales(p) : ''}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 650 }}>{t.nombre}</div>
          <div style={{ color: '#5C6370' }}>
            {t.codigo} · {t.cedula} · {t.cargo}
          </div>
        </div>
        <Tag color="success">En atención</Tag>
        <Button type="link" onClick={() => onAbrir(t.personaId)}>
          Ver expediente
        </Button>
      </div>
      <Divider />
      <Form form={form} layout="vertical" initialValues={FORMULARIO_VACIO} requiredMark validateTrigger="onBlur" onFinish={() => enviar(true)}>
        <Form.Item name="consentimiento" valuePropName="checked" rules={[regla('consentimiento')]} validateTrigger="onChange">
          <Checkbox>La persona firmó la autorización de pruebas de seguridad</Checkbox>
        </Form.Item>
        <Form.Item name="drogas" label="Prueba de drogas" required rules={[regla('drogas')]} validateTrigger="onChange">
          <Radio.Group options={[{ value: 'no_reactivo', label: 'No reactivo' }, { value: 'reactivo', label: 'Reactivo' }]} />
        </Form.Item>
        <Form.Item name="tatuajes" label="Tatuajes por zona" extra="Marca solo las zonas con tatuajes visibles">
          <Checkbox.Group options={[...ZONAS_TATUAJE]} />
        </Form.Item>
        <Form.Item name="observaciones" label="Observaciones para la auditoría" required rules={[regla('observaciones')]} extra="Quedan en la traza del expediente">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
          <Button type="text" icon={<SwapOutlined />} onClick={() => onTransferir(t)}>
            Transferir a otro módulo
          </Button>
          <Button icon={<WarningOutlined />} onClick={() => enviar(false)}>
            Registrar novedad
          </Button>
          <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
            Aprobar: pasar a {destino ? estacion(destino).nombre : 'fin'}
          </Button>
        </Space>
      </Form>
    </div>
  );
}
