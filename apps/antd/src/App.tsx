import {
  AppstoreOutlined,
  BellOutlined,
  IdcardOutlined,
  SearchOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import {
  App as AntApp,
  AutoComplete,
  Avatar,
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  type InputRef,
  Layout,
  Menu,
  Select,
  Tag,
  Tooltip,
} from 'antd';
import esES from 'antd/locale/es_ES';
import {
  acciones,
  buscarPersonas,
  EMPRESAS,
  ESTADO_COLOR,
  formatoCedula,
  Isotipo,
  MARCA,
  nombreCompleto,
  type Pantalla,
  personaDestacada,
  useAtajo,
  useEstado,
  useNavegacion,
  USUARIO,
} from '@propuestas/datos';
import { useCallback, useRef, useState } from 'react';
import { Expediente } from './pantallas/Expediente';
import { Puesto } from './pantallas/Puesto';
import { Tablero } from './pantallas/Tablero';

const FUENTE = "'Inter Variable', 'Segoe UI', system-ui, sans-serif";

export function App() {
  const estado = useEstado();
  const nav = useNavegacion(personaDestacada(estado));
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: MARCA.accion,
          colorLink: MARCA.accion,
          colorError: ESTADO_COLOR.error,
          colorWarning: '#B7791F',
          colorSuccess: ESTADO_COLOR.exito,
          colorInfo: ESTADO_COLOR.info,
          colorBgLayout: '#F5F6F8',
          colorTextSecondary: '#5C6370',
          fontFamily: FUENTE,
          fontSize: 14,
          borderRadius: 6,
          borderRadiusLG: 8,
        },
        components: {
          Layout: { siderBg: '#17191E', headerBg: '#fff' },
          Menu: { darkItemBg: '#17191E', darkItemSelectedBg: MARCA.accion, itemHeight: 44 },
          Card: { headerFontSize: 16 },
          Table: { headerBg: '#FAFAFB', cellPaddingBlockSM: 8 },
        },
      }}
    >
      <AntApp>
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(to right, #17191E 248px, #F5F6F8 248px)' }}>
          <Layout.Sider width={248} style={{ position: 'sticky', top: 0, height: '100vh' }}>
            <div className="marca">
              <Isotipo tam={36} />
              <div>
                <strong>Acuícola Demo</strong>
                <span>Contratación · BackOffice</span>
              </div>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[nav.pantalla]}
              onClick={(e) => nav.ir(e.key as Pantalla)}
              style={{ padding: '8px 8px 0', borderInlineEnd: 0 }}
              items={[
                { type: 'group', label: 'Operación', children: [
                  { key: 'tablero', icon: <AppstoreOutlined />, label: 'Tablero de turnos' },
                  { key: 'expediente', icon: <IdcardOutlined />, label: 'Expedientes' },
                  { key: 'puesto', icon: <SoundOutlined />, label: 'Puesto de atención' },
                ] },
              ]}
            />
            <div style={{ position: 'absolute', bottom: 0, padding: '16px 20px', color: '#A7ADB8', fontSize: 12, borderTop: '1px solid #2B2F37', width: '100%' }}>
              Prototipo · datos sintéticos
            </div>
          </Layout.Sider>
          <Layout>
            <Barra onAbrir={nav.abrirExpediente} />
            <Layout.Content style={{ padding: '24px 32px 48px' }}>
              {nav.pantalla === 'tablero' && <Tablero onAbrir={nav.abrirExpediente} />}
              {nav.pantalla === 'expediente' && <Expediente personaId={nav.personaId} />}
              {nav.pantalla === 'puesto' && <Puesto onAbrir={nav.abrirExpediente} />}
            </Layout.Content>
          </Layout>
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}

function Barra({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const [texto, setTexto] = useState('');
  const ref = useRef<InputRef>(null);
  useAtajo('/', useCallback(() => ref.current?.focus(), []));
  const resultados = buscarPersonas(estado, texto);

  return (
    <header className="barra">
      <AutoComplete
        style={{ width: 420 }}
        value={texto}
        onChange={setTexto}
        onSelect={(id: string) => {
          onAbrir(id);
          setTexto('');
        }}
        options={resultados.map((p) => ({
          value: p.id,
          label: (
            <div>
              <div style={{ fontWeight: 600 }}>{nombreCompleto(p)}</div>
              <div style={{ fontSize: 12, color: '#5C6370' }}>
                {formatoCedula(p.cedula)} · {p.cargo}
              </div>
            </div>
          ),
        }))}
        notFoundContent={texto.length >= 2 ? `Sin coincidencias para «${texto}»` : null}
      >
        <Input ref={ref} prefix={<SearchOutlined />} placeholder="Buscar por cédula o nombre" suffix={<Tag style={{ marginInlineEnd: 0 }}>/</Tag>} aria-label="Buscar persona por cédula o nombre" />
      </AutoComplete>
      <span style={{ flex: 1 }} />
      <Select
        aria-label="Empresa"
        value={estado.empresaId}
        onChange={acciones.cambiarEmpresa}
        style={{ width: 280 }}
        options={EMPRESAS.map((e) => ({ value: e.id, label: e.nombre }))}
      />
      <Tooltip title="Notificaciones">
        <Badge dot>
          <Button type="text" icon={<BellOutlined />} aria-label="Notificaciones" />
        </Badge>
      </Tooltip>
      <Dropdown
        menu={{
          items: [
            { key: 'falla', label: estado.simularFalla ? '✓ Simular falla de conexión' : 'Simular falla de conexión', onClick: acciones.alternarFalla },
            { key: 'salir', label: 'Cerrar sesión', disabled: true },
          ],
        }}
      >
        <Button type="text" style={{ height: 48, display: 'flex', gap: 8, alignItems: 'center' }} aria-label="Menú de usuario">
          <Avatar style={{ background: MARCA.accion }}>{USUARIO.iniciales}</Avatar>
          <span style={{ textAlign: 'left', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600 }}>{USUARIO.nombre}</div>
            <div style={{ fontSize: 12, color: '#5C6370' }}>{USUARIO.rol}</div>
          </span>
        </Button>
      </Dropdown>
      {estado.simularFalla && <Tag color="error">Sin conexión</Tag>}
    </header>
  );
}
