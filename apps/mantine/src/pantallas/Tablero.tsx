import { BarChart } from '@mantine/charts';
import {
  ActionIcon,
  Alert,
  Anchor,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Modal,
  Pagination,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangleFilled,
  IconArrowsExchange,
  IconChevronDown,
  IconChevronUp,
  IconCircleX,
  IconClock,
  IconSearch,
  IconSelector,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
  IconMoodEmpty,
} from '@tabler/icons-react';
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
  type Orden,
  ordenar,
  paginar,
  turnosActivos,
  type TurnoVista,
  useCarga,
  useEstado,
} from '@propuestas/datos';
import { type ReactNode, useMemo, useState } from 'react';
import { ChipNivel, ChipTurno, ConCarga } from '../comunes';

const POR_PAGINA = 10;
const COLOR_NIVEL = { normal: 'gray.6', atencion: 'yellow.8', critico: 'error.6' } as const;
const opcionesEstacion = ESTACIONES.filter((e) => ESTACIONES_CON_TURNO.includes(e.id)).map((e) => ({ value: e.id, label: e.nombre }));

export function Tablero({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const carga = useCarga(`tablero-${estado.empresaId}`);
  const ind = indicadores(estado);
  const cuellos = cuellosDeBotella(estado);
  const peor = [...cuellos].sort((a, b) => b.carga - a.carga)[0];
  const [texto, setTexto] = useState('');
  const [est, setEst] = useState<EstacionId | 'todas'>('todas');
  const [soloExcedidos, setSoloExcedidos] = useState(false);
  const [orden, setOrden] = useState<{ col: keyof TurnoVista; dir: Orden }>({ col: 'esperaMin', dir: 'desc' });
  const [pagina, setPagina] = useState(1);
  const [transferir, setTransferir] = useState<TurnoVista | null>(null);
  const [cerrar, setCerrar] = useState<TurnoVista | null>(null);
  const [motivo, setMotivo] = useState<string>(MOTIVOS_CIERRE[0]);

  const filtrados = useMemo(() => ordenar(filtrarTurnos(turnosActivos(estado), { texto, estacion: est, soloExcedidos }), orden.col, orden.dir), [estado, texto, est, soloExcedidos, orden]);
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pag = Math.min(pagina, paginas);
  const visibles = paginar(filtrados, pag, POR_PAGINA);

  const Th = ({ col, children, w }: { col: keyof TurnoVista; children: ReactNode; w?: number }) => {
    const activo = orden.col === col;
    const Icono = !activo ? IconSelector : orden.dir === 'asc' ? IconChevronUp : IconChevronDown;
    return (
      <Table.Th w={w} aria-sort={activo ? (orden.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <UnstyledButton className="th-orden" onClick={() => setOrden({ col, dir: activo && orden.dir === 'desc' ? 'asc' : 'desc' })}>
          {children} <Icono size={14} />
        </UnstyledButton>
      </Table.Th>
    );
  };

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <Stack gap={4} mb={24}>
        <Title order={1}>Tablero de turnos</Title>
        <Text c="dimmed">
          {FECHA_HOY} · actualizado a las {horaActual()}
        </Text>
      </Stack>

      <SimpleGrid cols={5} spacing={16} mb={16}>
        <Kpi icono={<IconUsersGroup size={18} />} titulo="Personas en planta" valor={ind.activos} nota={`${ind.enAtencion} en un puesto`} />
        <Kpi icono={<IconUsers size={18} />} titulo="En espera" valor={ind.enEspera} nota="en todas las estaciones" />
        <Kpi icono={<IconUserCheck size={18} />} titulo="Atendidos hoy" valor={ind.atendidosHoy} nota="desde las 06:00" />
        <Kpi icono={<IconClock size={18} />} titulo="Espera promedio" valor={`${ind.esperaPromedio} min`} nota={`objetivo ${ind.objetivoPromedio} min`} />
        <Kpi icono={<IconAlertTriangleFilled size={18} />} titulo="Turnos excedidos" valor={ind.excedidos} nota={ind.excedidos ? 'superan su espera máxima' : 'todo en tiempo'} alerta={ind.excedidos > 0} />
      </SimpleGrid>

      {peor?.nivel === 'critico' && (
        <Alert color="error" variant="light" icon={<IconAlertTriangleFilled />} title={`${peor.nombre} es el cuello de botella`} mb={16} styles={{ title: { fontSize: 16 } }}>
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm">
              Espera promedio de {peor.esperaPromedio} min con {peor.puestos} puestos (máximo {peor.objetivoMin} min). Abre otro puesto o transfiere turnos.
            </Text>
            <Button
              variant="white"
              color="error"
              onClick={() => {
                setEst(peor.estacion);
                setSoloExcedidos(true);
                setPagina(1);
              }}
            >
              Ver excedidos de {peor.nombre}
            </Button>
          </Group>
        </Alert>
      )}

      <Grid gutter={16} mb={16}>
        <Grid.Col span={7.5}>
          <Card h="100%">
            <Title order={2}>Cuellos de botella por estación</Title>
            <Text size="sm" c="dimmed" mb={16}>
              Espera promedio frente a la espera máxima (línea vertical)
            </Text>
            {cuellos.map((c) => (
              <div key={c.estacion} className={`cuello ${c.nivel}`}>
                <div>
                  <Text fw={600}>{c.nombre}</Text>
                  <ChipNivel nivel={c.nivel} />
                </div>
                <div style={{ position: 'relative' }} role="img" aria-label={`${c.nombre}: ${c.esperaPromedio} de ${c.objetivoMin} minutos`}>
                  <Progress value={Math.min(100, c.carga * 50)} color={COLOR_NIVEL[c.nivel]} size={10} radius="xl" />
                  <span style={{ position: 'absolute', left: '50%', top: -4, bottom: -4, width: 2, background: '#1F2329' }} />
                </div>
                <div className="meta">
                  <b className="num">{c.esperaPromedio} min</b> prom. · {c.enEspera} en cola
                  <br />
                  {c.enAtencion} en puesto · {c.puestos} puestos
                </div>
              </div>
            ))}
          </Card>
        </Grid.Col>
        <Grid.Col span={4.5}>
          <Card h="100%">
            <Title order={2}>Flujo por hora</Title>
            <Text size="sm" c="dimmed" mb={16}>
              Ingresos por kiosco y atenciones finalizadas
            </Text>
            <BarChart
              h={260}
              data={flujoPorHora(estado).map((f) => ({ ...f }))}
              dataKey="hora"
              withLegend
              legendProps={{ verticalAlign: 'bottom' }}
              series={[
                { name: 'ingresos', label: 'Ingresos', color: 'marca.4' },
                { name: 'atendidos', label: 'Finalizados', color: 'gray.6' },
              ]}
              tickLine="y"
              barProps={{ radius: [3, 3, 0, 0] }}
            />
          </Card>
        </Grid.Col>
      </Grid>

      <Card>
        <Group justify="space-between" mb={12}>
          <div>
            <Title order={2}>Turnos activos</Title>
            <Text size="sm" c="dimmed">
              {filtrados.length} turnos
            </Text>
          </div>
          <Group gap={12}>
            <TextInput
              aria-label="Filtrar turnos"
              placeholder="Nombre, cédula o turno"
              leftSection={<IconSearch size={16} />}
              value={texto}
              onChange={(e) => {
                setTexto(e.currentTarget.value);
                setPagina(1);
              }}
              w={260}
            />
            <Select
              aria-label="Estación"
              w={200}
              allowDeselect={false}
              value={est}
              onChange={(v) => {
                setEst((v ?? 'todas') as EstacionId | 'todas');
                setPagina(1);
              }}
              data={[{ value: 'todas', label: 'Todas las estaciones' }, ...opcionesEstacion]}
            />
            <Switch
              label="Solo excedidos"
              checked={soloExcedidos}
              onChange={(e) => {
                setSoloExcedidos(e.currentTarget.checked);
                setPagina(1);
              }}
            />
          </Group>
        </Group>
        {visibles.length === 0 ? (
          <Center py={48}>
            <Stack align="center" gap={4}>
              <IconMoodEmpty size={32} color="#9AA1AD" />
              <Text fw={600}>No hay turnos con esos filtros</Text>
              <Text size="sm" c="dimmed">
                Cambia la estación o borra la búsqueda.
              </Text>
            </Stack>
          </Center>
        ) : (
          <Table verticalSpacing={8} highlightOnHover striped={false} stickyHeader>
            <Table.Thead bg="#FAFAFB">
              <Table.Tr>
                <Th col="codigo" w={88}>
                  Turno
                </Th>
                <Th col="nombre">Persona</Th>
                <Th col="estacionNombre" w={160}>
                  Estación
                </Th>
                <Th col="estado" w={130}>
                  Estado
                </Th>
                <Th col="esperaMin" w={190}>
                  Espera
                </Th>
                <Table.Th w={96}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visibles.map((t) => (
                <Table.Tr key={t.id} className={t.excedido ? 'fila-excedida' : undefined}>
                  <Table.Td fw={700} className="num">
                    {t.codigo}
                  </Table.Td>
                  <Table.Td>
                    <Anchor component="button" fw={600} size="sm" onClick={() => onAbrir(t.personaId)}>
                      {t.nombre}
                    </Anchor>
                    <Text size="xs" c="dimmed">
                      {t.cedula} · {t.cargo}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {t.estacionNombre}
                    {t.puesto ? ` · ${t.puesto}` : ''}
                  </Table.Td>
                  <Table.Td>
                    <ChipTurno estado={t.estado} />
                  </Table.Td>
                  <Table.Td className="num">
                    {t.excedido ? (
                      <Text span c="#9E2806" fw={600} size="sm">
                        <IconAlertTriangleFilled size={14} style={{ verticalAlign: '-2px' }} /> {duracion(t.esperaMin)}{' '}
                        <Text span fw={400} size="sm">
                          (máx. {t.objetivoMin})
                        </Text>
                      </Text>
                    ) : (
                      duracion(t.esperaMin)
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="Transferir a otra estación">
                        <ActionIcon variant="subtle" color="gray" aria-label="Transferir" onClick={() => setTransferir(t)}>
                          <IconArrowsExchange size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Cerrar turno">
                        <ActionIcon variant="subtle" color="error" aria-label="Cerrar turno" onClick={() => setCerrar(t)}>
                          <IconCircleX size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
        <Group justify="space-between" mt={12}>
          <Text size="sm" c="dimmed">
            {filtrados.length === 0 ? 0 : (pag - 1) * POR_PAGINA + 1}–{Math.min(pag * POR_PAGINA, filtrados.length)} de {filtrados.length}
          </Text>
          <Pagination total={paginas} value={pag} onChange={setPagina} size="sm" />
        </Group>
      </Card>

      <ModalTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(d, m) => {
          if (!transferir) return;
          notifications.show({ color: 'teal', title: 'Turno transferido', message: acciones.transferir(transferir.id, d, m) });
          setTransferir(null);
        }}
      />
      <Modal opened={!!cerrar} onClose={() => setCerrar(null)} title={<Text fw={650}>¿Cerrar el turno {cerrar?.codigo}?</Text>} centered radius="lg">
        <Text size="sm" mb={16}>
          {cerrar?.nombre} sale de la cola de {cerrar?.estacionNombre} y su proceso queda cerrado por hoy. Queda registrado en la auditoría y no se puede deshacer.
        </Text>
        <Select label="Motivo" allowDeselect={false} value={motivo} onChange={(v) => v && setMotivo(v)} data={[...MOTIVOS_CIERRE]} />
        <Group justify="flex-end" mt={24}>
          <Button variant="default" onClick={() => setCerrar(null)}>
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (!cerrar) return;
              notifications.show({ color: 'gray', title: 'Turno cerrado', message: acciones.cerrar(cerrar.id, motivo) });
              setCerrar(null);
            }}
          >
            Cerrar turno
          </Button>
        </Group>
      </Modal>
    </ConCarga>
  );
}

function Kpi({ icono, titulo, valor, nota, alerta }: { icono: ReactNode; titulo: string; valor: number | string; nota: string; alerta?: boolean }) {
  return (
    <Card className={alerta ? 'kpi-alerta' : undefined} padding="md">
      <Group gap={6}>
        <ThemeIcon variant="light" color={alerta ? 'error' : 'gray'} size="sm">
          {icono}
        </ThemeIcon>
        <Text size="sm" c={alerta ? '#9E2806' : 'dimmed'}>
          {titulo}
        </Text>
      </Group>
      <Text fz={31} fw={650} lh={1.2} mt={8} className="num" c={alerta ? '#9E2806' : undefined}>
        {valor}
      </Text>
      <Text size="sm" c="dimmed" mt={4}>
        {nota}
      </Text>
    </Card>
  );
}

export function ModalTransferir({ turno, onCerrar, onConfirmar }: { turno: TurnoVista | null; onCerrar: () => void; onConfirmar: (d: EstacionId, m: string) => void }) {
  const [destino, setDestino] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<string>(MOTIVOS_TRANSFERENCIA[0]);
  const [intentado, setIntentado] = useState(false);
  const cerrar = () => {
    setDestino(null);
    setIntentado(false);
    onCerrar();
  };
  return (
    <Modal opened={!!turno} onClose={cerrar} title={<Text fw={650}>Transferir a {turno?.nombre}</Text>} centered radius="lg">
      <Text size="sm" mb={16}>
        Turno {turno?.codigo}, hoy en {turno?.estacionNombre}. Pasa al final de la cola de destino.
      </Text>
      <Stack gap={16}>
        <Select
          label="Estación de destino"
          withAsterisk
          placeholder="Elige una estación"
          value={destino}
          onChange={setDestino}
          data={opcionesEstacion.filter((o) => o.value !== turno?.estacion)}
          error={intentado && !destino ? 'Elige la estación de destino.' : undefined}
        />
        <Select label="Motivo" allowDeselect={false} value={motivo} onChange={(v) => v && setMotivo(v)} data={[...MOTIVOS_TRANSFERENCIA]} />
      </Stack>
      <Group justify="flex-end" mt={24}>
        <Button variant="default" onClick={cerrar}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            setIntentado(true);
            if (!destino) return;
            onConfirmar(destino as EstacionId, motivo);
            setDestino(null);
            setIntentado(false);
          }}
        >
          Transferir
        </Button>
      </Group>
    </Modal>
  );
}
