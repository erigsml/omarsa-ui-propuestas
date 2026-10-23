import { Alert, Avatar, Badge, Button, Card, Center, Grid, Group, NavLink, SimpleGrid, Stack, Stepper, Table, Tabs, Text, Title } from '@mantine/core';
import { IconFile, IconFileCertificate, IconLock, IconMinus, IconPrinter, IconShieldLock } from '@tabler/icons-react';
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
      <Center py={96}>
        <Stack align="center" gap={4}>
          <IconFile size={32} />
          <Text fw={600}>Elige un expediente</Text>
          <Text c="dimmed">Busca a la persona por cédula o nombre en la barra superior (atajo: /).</Text>
        </Stack>
      </Center>
    );
  }
  const actual = p.hitos.findIndex((h) => h.estado === 'actual');

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <Card mb={16} padding={24}>
        <Group gap={20} wrap="nowrap" align="center">
          <Avatar size={72} radius="xl" color="marca" variant="light" fz={26}>
            {iniciales(p)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Group gap={8}>
              <Title order={1}>{nombreCompleto(p)}</Title>
              <Badge color={p.estado === 'En revisión' ? 'yellow.9' : p.estado === 'Proceso cerrado' ? 'gray' : 'marca'} variant="filled" radius="sm" tt="none">
                {p.estado}
              </Badge>
              {p.reingreso && (
                <Badge color="blue" variant="outline" radius="sm" tt="none">
                  Reingreso
                </Badge>
              )}
            </Group>
            <Group gap={16} mt={8} c="#374151">
              <Text>
                CI{' '}
                <Text span fw={700} className="num">
                  {formatoCedula(p.cedula)}
                </Text>
              </Text>
              <Text>{p.cargo}</Text>
              <Text>{p.proceso}</Text>
              {actual >= 0 && <Text>Ahora en {estacion(p.hitos[actual]?.estacion ?? 'kiosco').nombre}</Text>}
            </Group>
          </div>
          <Button variant="default" leftSection={<IconPrinter size={16} />} disabled>
            Imprimir credencial
          </Button>
        </Group>
        <Stepper
          active={actual >= 0 ? actual : p.hitos.length}
          size="sm"
          mt={28}
          allowNextStepsSelect={false}
          color="teal"
          styles={{ steps: { flexWrap: 'nowrap' }, separator: { marginInline: 8, minWidth: 16 }, stepBody: { marginInlineStart: 8 }, stepDescription: { fontSize: 12, lineHeight: 1.35 } }}
        >
          {p.hitos.map((h) => (
            <Stepper.Step
              key={h.estacion}
              label={estacion(h.estacion).nombre}
              color={h.estado === 'actual' ? 'marca' : h.estado === 'no_aplica' ? 'gray' : 'teal'}
              completedIcon={h.estado === 'no_aplica' ? <IconMinus size={14} /> : undefined}
              style={h.estado === 'no_aplica' ? { opacity: 0.5 } : undefined}
              description={
                h.estado === 'completado' ? (
                  <>
                    {h.hora}
                    <br />
                    {h.operador}
                  </>
                ) : h.estado === 'actual' ? `Desde las ${h.hora}` : h.estado === 'no_aplica' ? 'No aplica' : 'Pendiente'
              }
            />
          ))}
        </Stepper>
      </Card>

      <Tabs defaultValue="datos" keepMounted={false}>
        <Tabs.List mb={16}>
          <Tabs.Tab value="datos">Datos</Tabs.Tab>
          <Tabs.Tab value="documentos">Documentos ({p.documentos.length})</Tabs.Tab>
          <Tabs.Tab value="validaciones">Validaciones</Tabs.Tab>
          <Tabs.Tab value="auditoria">Auditoría</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="datos">
          <Datos p={p} />
        </Tabs.Panel>
        <Tabs.Panel value="documentos">
          <Documentos p={p} />
        </Tabs.Panel>
        <Tabs.Panel value="validaciones">
          <Validaciones p={p} />
        </Tabs.Panel>
        <Tabs.Panel value="auditoria">
          <Auditoria p={p} />
        </Tabs.Panel>
      </Tabs>
    </ConCarga>
  );
}

function Datos({ p }: { p: Persona }) {
  const campos = [
    ['Nombres', p.nombres],
    ['Apellidos', p.apellidos],
    ['Cédula', formatoCedula(p.cedula)],
    ['Fecha de nacimiento', p.fechaNacimiento],
    ['Teléfono', p.telefono],
    ['Correo', p.correo],
    ['Dirección', p.direccion],
    ['Cargo', p.cargo],
    ['Proceso', p.proceso],
  ];
  return (
    <Grid gutter={16}>
      <Grid.Col span={7.5}>
        <Card h="100%">
          <Title order={2}>Datos personales</Title>
          <Text size="sm" c="dimmed" mb={20}>
            Precargados desde la solicitud FOR-027
          </Text>
          <SimpleGrid cols={3} spacing={24} verticalSpacing={20}>
            {campos.map(([k, v]) => (
              <div key={k}>
                <Text size="sm" c="dimmed">
                  {k}
                </Text>
                <Text fw={500} mt={4} style={{ overflowWrap: 'anywhere' }}>
                  {v}
                </Text>
              </div>
            ))}
          </SimpleGrid>
        </Card>
      </Grid.Col>
      <Grid.Col span={4.5}>
        <Card h="100%">
          <Title order={2}>Ficha médica</Title>
          <Text size="sm" c="dimmed" mb={20}>
            Información clínica confidencial (POL-03)
          </Text>
          <Group gap={16} wrap="nowrap" p={20} style={{ border: '1px dashed #C9CDD4', borderRadius: 8, background: '#F5F6F8' }}>
            <IconLock size={24} />
            <div>
              <Text fw={650}>Solo personal médico</Text>
              <Text size="sm" c="dimmed" mt={4}>
                Tu perfil ve la aptitud cuando el médico la registra, no el diagnóstico.
              </Text>
            </div>
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );
}

function Documentos({ p }: { p: Persona }) {
  const [sel, setSel] = useState(p.documentos.find((d) => !d.restringido)?.id ?? '');
  const doc = p.documentos.find((d) => d.id === sel);
  const vp = doc ? vistaPrevia(doc, p) : null;
  return (
    <Grid gutter={16}>
      <Grid.Col span={5.5}>
        <Card padding={8}>
          {p.documentos.map((d) => (
            <NavLink
              key={d.id}
              active={d.id === sel}
              disabled={d.restringido}
              onClick={() => setSel(d.id)}
              leftSection={d.restringido ? <IconLock size={20} /> : <IconFile size={20} />}
              label={<Text fw={600} size="sm">{d.nombre}</Text>}
              description={d.restringido ? 'Solo personal médico' : `${d.codigo} · ${estacion(d.estacion).nombre} · ${d.hora} · ${d.paginas} pág.`}
              rightSection={
                <Badge variant="light" radius="sm" tt="none" color={d.estado === 'Pendiente de firma' ? 'yellow.9' : d.estado === 'Firmado' ? 'teal' : 'blue'}>
                  {d.estado}
                </Badge>
              }
              py={10}
              style={{ borderRadius: 6 }}
            />
          ))}
        </Card>
      </Grid.Col>
      <Grid.Col span={6.5}>
        {vp && (
          <article className="papel" aria-label="Vista previa">
            <header>
              <Group gap={8}>
                <Isotipo tam={22} /> Acuícola Demo del Pacífico S.A.
              </Group>
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
      </Grid.Col>
    </Grid>
  );
}

function Validaciones({ p }: { p: Persona }) {
  return (
    <Card>
      <Group gap={32} p="16px 20px" mb={16} style={{ background: '#F5F6F8', borderRadius: 8 }}>
        <div>
          <Text size="sm" c="dimmed">
            Score de cumplimiento
          </Text>
          <Text fz={31} fw={650} className="num">
            {p.score}/100
          </Text>
        </div>
        <ChipRiesgo riesgo={p.riesgo} />
        <span style={{ flex: 1 }} />
        <Button variant="default" leftSection={<IconFileCertificate size={16} />} disabled>
          Informe con evidencias
        </Button>
      </Group>
      <Alert color="blue" variant="light" icon={<IconShieldLock />} title="Lo que ve el candidato" mb={16}>
        Nunca la fuente ni el motivo. Si algo lo detiene, solo: «{MENSAJE_DISCRETO}»
      </Alert>
      <Table verticalSpacing={10}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Fuente</Table.Th>
            <Table.Th w={160}>Tipo</Table.Th>
            <Table.Th w={200}>Resultado</Table.Th>
            <Table.Th w={80}>Hora</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {p.validaciones.map((v) => (
            <Table.Tr key={v.fuente}>
              <Table.Td fw={600}>{v.fuente}</Table.Td>
              <Table.Td>{v.tipo}</Table.Td>
              <Table.Td>
                <ChipFuente estado={v.estado} />
              </Table.Td>
              <Table.Td className="num">{v.hora}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}

function Auditoria({ p }: { p: Persona }) {
  return (
    <Card>
      <Title order={2}>Auditoría</Title>
      <Text size="sm" c="dimmed" mb={16}>
        Solo inserción: nadie edita ni borra la traza
      </Text>
      <Table verticalSpacing={8} striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={80}>Hora</Table.Th>
            <Table.Th w={200}>Quién</Table.Th>
            <Table.Th>Acción</Table.Th>
            <Table.Th w={220}>Desde dónde</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {p.auditoria.map((e) => (
            <Table.Tr key={e.id}>
              <Table.Td className="num">{e.hora}</Table.Td>
              <Table.Td>{e.usuario}</Table.Td>
              <Table.Td>{e.accion}</Table.Td>
              <Table.Td c="dimmed">{e.origen}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
