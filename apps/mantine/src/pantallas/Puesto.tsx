import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Divider,
  Grid,
  Group,
  Menu,
  Radio,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconArrowBackUp,
  IconArrowsExchange,
  IconCheck,
  IconChevronDown,
  IconInbox,
  IconSpeakerphone,
  IconVolume,
} from '@tabler/icons-react';
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
  const cola = colaDelPuesto(estado);
  const [transferir, setTransferir] = useState<TurnoVista | null>(null);
  const est = estacion(estado.puesto.estacion);
  const primero = cola.llamados[0];
  const bloqueado = !!cola.enAtencion || cola.espera.length === 0;

  const llamar = useCallback((n: number) => {
    const nombres = acciones.llamar(n);
    if (nombres.length) notifications.show({ color: 'blue', title: n > 1 ? `Llamaste a ${nombres.length} personas` : 'Llamado en pantalla', message: nombres.join(', ') });
  }, []);
  useAtajo('l', useCallback(() => !cola.enAtencion && llamar(1), [cola.enAtencion, llamar]));
  const rellamar = (t: TurnoVista) => notifications.show({ color: 'blue', title: 'Volviste a llamar', message: acciones.rellamar(t.id) });

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <Stack gap={4} mb={24}>
        <Title order={1}>Puesto de atención</Title>
        <Text c="dimmed">
          {est.nombre} · Puesto {estado.puesto.id} · {estado.puesto.operador} · Jornada matutina
        </Text>
      </Stack>
      <Card padding="sm" px={20} mb={16}>
        <Group gap={24} role="status">
          <Badge color="teal" variant="dot" size="lg" tt="none">
            Operativo
          </Badge>
          <Text size="sm">
            En espera <b className="num">{cola.espera.length}</b>
          </Text>
          <Text size="sm">
            Llamados <b className="num">{cola.llamados.length}</b>
          </Text>
          <Text size="sm">
            Atención promedio <b>6 min</b>
          </Text>
          <Text size="sm" c="dimmed" ml="auto">
            Atajo: L llama al siguiente
          </Text>
        </Group>
      </Card>

      <Grid gutter={16} align="flex-start">
        <Grid.Col span={7.5}>
          <Card aria-live="polite" padding={24}>
            {cola.enAtencion ? (
              <Atencion t={cola.enAtencion} onTransferir={setTransferir} onAbrir={onAbrir} />
            ) : primero ? (
              <Stack align="center" gap={0} py={16}>
                <Badge color="yellow.9" variant="light" leftSection={<IconSpeakerphone size={14} />} tt="none" size="lg">
                  Llamado en la TV · {primero.llamadas} {primero.llamadas === 1 ? 'vez' : 'veces'}
                </Badge>
                <Avatar size={96} radius={96} mt={20} color="marca" variant="light" fz={32}>
                  {primero.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                </Avatar>
                <Text fz={31} fw={650} lh={1.2} mt={16}>
                  {primero.nombre}
                </Text>
                <Text c="dimmed" mt={4} mb={12}>
                  {primero.cedula} · {primero.cargo} · {primero.proceso}
                  {primero.reingreso && ' · Reingreso'}
                </Text>
                <span className="codigo">{primero.codigo}</span>
                <Group mt={24} gap={12} justify="center">
                  <Button size="lg" leftSection={<IconCheck size={20} />} miw={200} onClick={() => acciones.atender(primero.id)}>
                    Atender
                  </Button>
                  <Button size="lg" variant="default" leftSection={<IconVolume size={20} />} onClick={() => rellamar(primero)}>
                    Re-llamar
                  </Button>
                  <Button size="lg" variant="default" leftSection={<IconArrowsExchange size={20} />} onClick={() => setTransferir(primero)}>
                    Transferir
                  </Button>
                  <Button
                    size="lg"
                    variant="subtle"
                    color="gray"
                    leftSection={<IconArrowBackUp size={20} />}
                    onClick={() => notifications.show({ color: 'yellow', title: 'Vuelve a la cola', message: `${acciones.devolverACola(primero.id)} no se presentó.` })}
                  >
                    No se presentó
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Center py={64}>
                <Stack align="center" gap={4}>
                  <IconInbox size={40} color="#9AA1AD" />
                  <Text fw={650} fz={16}>
                    {cola.espera.length ? 'Listo para atender' : 'No hay nadie en espera'}
                  </Text>
                  <Text c="dimmed" ta="center" maw={360}>
                    {cola.espera.length
                      ? `Hay ${cola.espera.length} personas esperando. Llama a la siguiente.`
                      : 'Cuando alguien termine en el kiosco o en otra estación, aparecerá en tu cola.'}
                  </Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={4.5}>
          <Card aria-label="Cola de espera">
            <Group gap={0} wrap="nowrap">
              <Button size="xl" h={56} fz={18} flex={1} leftSection={<IconSpeakerphone size={22} />} disabled={bloqueado} onClick={() => llamar(1)} aria-keyshortcuts="L" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                Llamar siguiente
              </Button>
              <Menu position="bottom-end" disabled={bloqueado}>
                <Menu.Target>
                  <ActionIcon size={56} variant="filled" disabled={bloqueado} aria-label="Llamar a varias personas" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: '1px solid rgba(255,255,255,.3)' }}>
                    <IconChevronDown size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => llamar(2)}>Llamar a 2 personas</Menu.Item>
                  <Menu.Item onClick={() => llamar(3)}>Llamar a 3 personas</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
            {cola.enAtencion && (
              <Text size="sm" c="dimmed" mt={8}>
                Termina la atención actual para llamar a otra persona.
              </Text>
            )}
            {cola.llamados.length > 1 && (
              <>
                <Divider my={16} label={`Llamados (${cola.llamados.length})`} labelPosition="left" />
                {cola.llamados.slice(1).map((t) => (
                  <Group key={t.id} justify="space-between" py={8} wrap="nowrap">
                    <div>
                      <Text fw={600} size="sm">
                        {t.codigo} · {t.nombre}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Llamado {t.llamadas} {t.llamadas === 1 ? 'vez' : 'veces'}
                      </Text>
                    </div>
                    <Button size="xs" variant="default" leftSection={<IconVolume size={14} />} onClick={() => rellamar(t)}>
                      Re-llamar
                    </Button>
                  </Group>
                ))}
              </>
            )}
            <Divider my={16} label={`En espera (${cola.espera.length}) · por orden de llegada`} labelPosition="left" />
            {cola.espera.length === 0 && (
              <Text c="dimmed" ta="center" py={16}>
                No hay nadie en espera
              </Text>
            )}
            {cola.espera.map((t, i) => (
              <Group key={t.id} wrap="nowrap" py={10} gap={12} style={{ borderBottom: '1px solid #EEF0F3' }}>
                <Text fw={700} w={56} className="num" style={{ whiteSpace: 'nowrap' }}>
                  {t.codigo}
                </Text>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>
                    {t.nombre}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {i === 0 ? 'Siguiente · ' : ''}
                    {t.cargo}
                  </Text>
                </div>
                <Text size="sm" className="num" c={t.excedido ? '#9E2806' : undefined} fw={t.excedido ? 600 : 400}>
                  {t.excedido && <IconAlertTriangleFilled size={13} style={{ verticalAlign: '-2px' }} />} {duracion(t.esperaMin)}
                </Text>
              </Group>
            ))}
          </Card>
        </Grid.Col>
      </Grid>
      <ModalTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(d, m) => {
          if (!transferir) return;
          notifications.show({ color: 'teal', title: 'Turno transferido', message: acciones.transferir(transferir.id, d, m) });
          setTransferir(null);
        }}
      />
    </ConCarga>
  );
}

function Atencion({ t, onTransferir, onAbrir }: { t: TurnoVista; onTransferir: (t: TurnoVista) => void; onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const p = buscarPersona(estado, t.personaId);
  const destino = p ? siguienteEstacion(p, t.estacion) : undefined;
  const aprobar = useRef(true);
  const form = useForm<FormularioSeguridad>({
    mode: 'controlled',
    initialValues: { ...FORMULARIO_VACIO, tatuajes: [] },
    validateInputOnBlur: true,
    validate: (v) => validarSeguridad(v, aprobar.current),
  });
  const enviar = (aprueba: boolean) => {
    aprobar.current = aprueba;
    const r = form.validate();
    if (r.hasErrors) return;
    const msg = acciones.finalizar(t.id, aprueba, form.getValues().observaciones.trim());
    notifications.show(aprueba ? { color: 'teal', title: 'Atención finalizada', message: msg, icon: <IconCheck size={18} /> } : { color: 'yellow', title: 'Novedad registrada', message: msg });
  };

  return (
    <div>
      <Group gap={16} wrap="nowrap">
        <Avatar size={56} radius="xl" color="marca" variant="light">
          {p ? iniciales(p) : ''}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text fz={20} fw={650}>
            {t.nombre}
          </Text>
          <Text c="dimmed" size="sm">
            {t.codigo} · {t.cedula} · {t.cargo}
          </Text>
        </div>
        <Badge color="teal" variant="filled" tt="none">
          En atención
        </Badge>
        <Button variant="subtle" onClick={() => onAbrir(t.personaId)}>
          Ver expediente
        </Button>
      </Group>
      <Divider my={20} />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          enviar(true);
        }}
      >
        <Stack gap={20}>
          <Checkbox label="La persona firmó la autorización de pruebas de seguridad" {...form.getInputProps('consentimiento', { type: 'checkbox' })} />
          <Radio.Group label="Prueba de drogas" withAsterisk {...form.getInputProps('drogas')}>
            <Group mt={8}>
              <Radio value="no_reactivo" label="No reactivo" />
              <Radio value="reactivo" label="Reactivo" />
            </Group>
          </Radio.Group>
          <Checkbox.Group label="Tatuajes por zona" description="Marca solo las zonas con tatuajes visibles" {...form.getInputProps('tatuajes')}>
            <Group mt={8}>
              {ZONAS_TATUAJE.map((z) => (
                <Checkbox key={z} value={z} label={z} />
              ))}
            </Group>
          </Checkbox.Group>
          <Textarea label="Observaciones para la auditoría" description="Quedan en la traza del expediente" withAsterisk autosize minRows={3} {...form.getInputProps('observaciones')} />
          <Group justify="flex-end" gap={12}>
            <Button variant="subtle" color="gray" leftSection={<IconArrowsExchange size={18} />} onClick={() => onTransferir(t)}>
              Transferir a otro módulo
            </Button>
            <Button variant="default" leftSection={<IconAlertTriangle size={18} />} onClick={() => enviar(false)}>
              Registrar novedad
            </Button>
            <Button type="submit" leftSection={<IconCheck size={18} />}>
              Aprobar: pasar a {destino ? estacion(destino).nombre : 'fin'}
            </Button>
          </Group>
        </Stack>
      </form>
    </div>
  );
}
