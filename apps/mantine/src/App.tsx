import {
  ActionIcon,
  AppShell,
  Autocomplete,
  Avatar,
  Badge,
  createTheme,
  Group,
  Kbd,
  MantineProvider,
  Menu,
  NavLink,
  Select,
  Text,
  Tooltip,
  UnstyledButton,
  type MantineColorsTuple,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { IconBell, IconId, IconLayoutDashboard, IconSearch, IconSpeakerphone } from '@tabler/icons-react';
import {
  acciones,
  buscarPersonas,
  EMPRESAS,
  type EmpresaId,
  formatoCedula,
  Isotipo,
  nombreCompleto,
  PANTALLAS,
  personaDestacada,
  RAMPA_MARCA,
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

const tema = createTheme({
  primaryColor: 'marca',
  primaryShade: 6,
  colors: {
    marca: [...RAMPA_MARCA] as unknown as MantineColorsTuple,
    // Error bermellón, distinto del rojo de marca.
    error: ['#FEF0EA', '#FDDCCE', '#F9B89D', '#F3906A', '#EA6A3F', '#D9481B', '#C4320A', '#A12808', '#7E1F06', '#5B1604'],
  },
  fontFamily: FUENTE,
  headings: { fontFamily: FUENTE, fontWeight: '650', sizes: { h1: { fontSize: '25px', lineHeight: '1.2' }, h2: { fontSize: '16px', lineHeight: '1.3' } } },
  defaultRadius: 'sm',
  radius: { md: '8px' },
  components: {
    Card: { defaultProps: { withBorder: true, radius: 'md', padding: 'lg' } },
  },
});

const ICONOS = { tablero: IconLayoutDashboard, expediente: IconId, puesto: IconSpeakerphone } as const;

export function App() {
  const estado = useEstado();
  const nav = useNavegacion(personaDestacada(estado));
  return (
    <MantineProvider theme={tema} forceColorScheme="light">
      <Notifications position="bottom-right" />
      <AppShell layout="alt" navbar={{ width: 248, breakpoint: 0 }} header={{ height: 64 }} padding={0}>
        <AppShell.Navbar className="lateral" p={0}>
          <Group gap={12} p="20px 20px 16px">
            <Isotipo tam={36} />
            <div>
              <Text fw={700} size="15px" lh={1.2}>
                Acuícola Demo
              </Text>
              <Text size="12px" c="#A7ADB8">
                Contratación · BackOffice
              </Text>
            </div>
          </Group>
          <Text size="xs" fw={600} c="#A7ADB8" px={20} mt={8} mb={8} tt="uppercase" style={{ letterSpacing: '0.06em' }}>
            Operación
          </Text>
          <nav aria-label="Menú principal" style={{ padding: '0 8px', display: 'grid', gap: 4 }}>
            {PANTALLAS.map((p) => {
              const Icono = ICONOS[p.id];
              return (
                <NavLink
                  key={p.id}
                  label={p.titulo}
                  leftSection={<Icono size={18} stroke={1.6} />}
                  active={nav.pantalla === p.id}
                  onClick={() => nav.ir(p.id)}
                  aria-current={nav.pantalla === p.id ? 'page' : undefined}
                  h={44}
                  fw={500}
                />
              );
            })}
          </nav>
          <Text size="12px" c="#A7ADB8" mt="auto" p="16px 20px" style={{ borderTop: '1px solid #2B2F37' }}>
            Prototipo · datos sintéticos
          </Text>
        </AppShell.Navbar>
        <AppShell.Header px={24}>
          <Barra onAbrir={nav.abrirExpediente} />
        </AppShell.Header>
        <AppShell.Main>
          <div style={{ padding: '24px 32px 48px' }}>
            {nav.pantalla === 'tablero' && <Tablero onAbrir={nav.abrirExpediente} />}
            {nav.pantalla === 'expediente' && <Expediente personaId={nav.personaId} />}
            {nav.pantalla === 'puesto' && <Puesto onAbrir={nav.abrirExpediente} />}
          </div>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

function Barra({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const [texto, setTexto] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useAtajo('/', useCallback(() => ref.current?.focus(), []));
  const resultados = buscarPersonas(estado, texto);
  const porEtiqueta = new Map(resultados.map((p) => [`${nombreCompleto(p)} · ${formatoCedula(p.cedula)}`, p.id]));

  return (
    <Group h="100%" gap={16} wrap="nowrap">
      <Autocomplete
        ref={ref}
        w={420}
        aria-label="Buscar persona por cédula o nombre"
        placeholder="Buscar por cédula o nombre"
        leftSection={<IconSearch size={16} />}
        rightSection={<Kbd size="xs">/</Kbd>}
        value={texto}
        onChange={setTexto}
        data={[...porEtiqueta.keys()]}
        filter={({ options }) => options}
        onOptionSubmit={(v) => {
          const id = porEtiqueta.get(v);
          if (id) onAbrir(id);
          setTexto('');
        }}
      />
      <span style={{ flex: 1 }} />
      <Select
        aria-label="Empresa"
        w={280}
        allowDeselect={false}
        value={estado.empresaId}
        onChange={(v) => v && acciones.cambiarEmpresa(v as EmpresaId)}
        data={EMPRESAS.map((e) => ({ value: e.id, label: e.nombre }))}
      />
      <Tooltip label="Notificaciones">
        <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Notificaciones">
          <IconBell size={20} stroke={1.6} />
        </ActionIcon>
      </Tooltip>
      <Menu position="bottom-end" shadow="md">
        <Menu.Target>
          <UnstyledButton aria-label="Menú de usuario">
            <Group gap={8} wrap="nowrap">
              <Avatar color="marca" variant="filled" radius="xl">
                {USUARIO.iniciales}
              </Avatar>
              <div>
                <Text size="sm" fw={600} lh={1.2}>
                  {USUARIO.nombre}
                </Text>
                <Text size="xs" c="dimmed">
                  {USUARIO.rol}
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={acciones.alternarFalla}>{estado.simularFalla ? '✓ ' : ''}Simular falla de conexión</Menu.Item>
          <Menu.Item disabled>Cerrar sesión</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      {estado.simularFalla && (
        <Badge color="error" variant="light">
          Sin conexión
        </Badge>
      )}
    </Group>
  );
}
