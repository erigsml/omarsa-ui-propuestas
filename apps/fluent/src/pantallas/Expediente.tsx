import {
  Avatar,
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TabList,
} from '@fluentui/react-components';
import {
  Checkmark16Filled,
  Document24Regular,
  DocumentLock24Regular,
  LockClosed24Regular,
  Print20Regular,
  ShieldLock20Regular,
} from '@fluentui/react-icons';
import {
  ESTACIONES,
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

type Pestana = 'datos' | 'documentos' | 'validaciones' | 'auditoria';

export function Expediente({ personaId }: { personaId: string }) {
  const estado = useEstado();
  const p = buscarPersona(estado, personaId);
  const carga = useCarga(`exp-${personaId}`, 500);
  const [pestana, setPestana] = useState<Pestana>('datos');

  if (!p || p.empresaId !== estado.empresaId) {
    return (
      <div className="vacio">
        <Document24Regular />
        <strong>Elige un expediente</strong>
        Busca a la persona por cédula o nombre en la barra superior (atajo: /).
      </div>
    );
  }
  const actual = p.hitos.find((h) => h.estado === 'actual');

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <section className="tarjeta" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div className="ficha">
            <Avatar name={nombreCompleto(p)} initials={iniciales(p)} size={72} color="colorful" />
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <h1>{nombreCompleto(p)}</h1>
                <Badge appearance={p.estado === 'En proceso' ? 'filled' : 'tint'} color={p.estado === 'En revisión' ? 'warning' : p.estado === 'Proceso cerrado' ? 'subtle' : 'brand'}>
                  {p.estado}
                </Badge>
                {p.reingreso && (
                  <Badge appearance="outline" color="informative">
                    Reingreso
                  </Badge>
                )}
              </div>
              <div className="datos">
                <span>
                  CI <b className="num">{formatoCedula(p.cedula)}</b>
                </span>
                <span>{p.cargo}</span>
                <span>{p.proceso}</span>
                {actual && <span>Ahora en {estacion(actual.estacion).nombre}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Button icon={<Print20Regular />} disabled>
              Imprimir credencial
            </Button>
          </div>
        </div>
        <ol className="linea" aria-label="Estaciones del proceso" style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}>
          {p.hitos.map((h, i) => (
            <li key={h.estacion} className={`paso ${h.estado}`} aria-current={h.estado === 'actual' ? 'step' : undefined}>
              <span className="punto">{h.estado === 'completado' ? <Checkmark16Filled /> : i + 1}</span>
              <div className="titulo">{estacion(h.estacion).nombre}</div>
              <div className="detalle">
                {h.estado === 'completado' && `${h.hora} · ${h.operador}`}
                {h.estado === 'actual' && `Desde las ${h.hora}`}
                {h.estado === 'pendiente' && 'Pendiente'}
                {h.estado === 'no_aplica' && 'No aplica'}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <TabList selectedValue={pestana} onTabSelect={(_, d) => setPestana(d.value as Pestana)} style={{ margin: '16px 0' }}>
        <Tab value="datos">Datos</Tab>
        <Tab value="documentos">Documentos ({p.documentos.length})</Tab>
        <Tab value="validaciones">Validaciones</Tab>
        <Tab value="auditoria">Auditoría</Tab>
      </TabList>

      {pestana === 'datos' && <Datos p={p} />}
      {pestana === 'documentos' && <Documentos p={p} />}
      {pestana === 'validaciones' && <Validaciones p={p} />}
      {pestana === 'auditoria' && <Auditoria p={p} />}
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
    <div className="rejilla-2-1" style={{ marginTop: 0 }}>
      <section className="tarjeta">
        <h2>Datos personales</h2>
        <p className="sub">Precargados desde la solicitud FOR-027</p>
        <dl className="dl">
          {campos.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="tarjeta">
        <h2>Ficha médica</h2>
        <p className="sub">Información clínica confidencial (POL-03)</p>
        <div className="bloqueado">
          <LockClosed24Regular />
          <div>
            <strong>Solo personal médico</strong>
            <div style={{ color: 'var(--colorNeutralForeground3)', fontSize: 13, marginTop: 4 }}>
              Tu perfil ve la aptitud cuando el médico la registra, no el diagnóstico.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Documentos({ p }: { p: Persona }) {
  const [sel, setSel] = useState(p.documentos.find((d) => !d.restringido)?.id ?? '');
  const doc = p.documentos.find((d) => d.id === sel);
  const vp = doc ? vistaPrevia(doc, p) : null;
  return (
    <div className="docs">
      <section className="tarjeta" style={{ padding: 8 }}>
        {p.documentos.map((d) => (
          <button key={d.id} className="doc-item" aria-pressed={d.id === sel} disabled={d.restringido} onClick={() => setSel(d.id)}>
            {d.restringido ? <DocumentLock24Regular /> : <Document24Regular />}
            <span style={{ flex: 1 }}>
              <span className="nom">{d.nombre}</span>
              <span className="meta" style={{ display: 'block' }}>
                {d.restringido ? 'Solo personal médico' : `${d.codigo} · ${estacion(d.estacion).nombre} · ${d.hora} · ${d.paginas} pág.`}
              </span>
            </span>
            <Badge appearance="tint" color={d.estado === 'Pendiente de firma' ? 'warning' : d.estado === 'Firmado' ? 'success' : 'informative'}>
              {d.estado}
            </Badge>
          </button>
        ))}
      </section>
      <section aria-label="Vista previa">
        {vp && (
          <article className="papel">
            <header>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Isotipo tam={22} /> Acuícola Demo del Pacífico S.A.
              </span>
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
      </section>
    </div>
  );
}

function Validaciones({ p }: { p: Persona }) {
  return (
    <section className="tarjeta">
      <div className="riesgo">
        <div>
          <div style={{ fontSize: 12.8, color: 'var(--colorNeutralForeground3)' }}>Score de cumplimiento</div>
          <div className="score num">{p.score}/100</div>
        </div>
        <ChipRiesgo riesgo={p.riesgo} />
        <span style={{ flex: 1 }} />
        <Button icon={<ShieldLock20Regular />} disabled>
          Informe con evidencias
        </Button>
      </div>
      <MessageBar intent="info" style={{ marginBottom: 12 }}>
        <MessageBarBody>
          <MessageBarTitle>Lo que ve el candidato</MessageBarTitle>
          Nunca la fuente ni el motivo. Si algo lo detiene, solo: «{MENSAJE_DISCRETO}»
        </MessageBarBody>
      </MessageBar>
      <div role="table" aria-label="Fuentes consultadas">
        <div className="fuente" role="row" style={{ fontSize: 12.8, color: 'var(--colorNeutralForeground3)' }}>
          <span role="columnheader">Fuente</span>
          <span role="columnheader">Tipo</span>
          <span role="columnheader">Resultado</span>
          <span role="columnheader">Hora</span>
        </div>
        {p.validaciones.map((v) => (
          <div className="fuente" role="row" key={v.fuente}>
            <strong role="cell">{v.fuente}</strong>
            <span role="cell">{v.tipo}</span>
            <span role="cell">
              <ChipFuente estado={v.estado} />
            </span>
            <span role="cell" className="num">
              {v.hora}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Auditoria({ p }: { p: Persona }) {
  return (
    <section className="tarjeta">
      <h2>Auditoría</h2>
      <p className="sub">Solo inserción: nadie edita ni borra la traza</p>
      <Table size="small" aria-label="Eventos de auditoría">
        <TableHeader>
          <TableRow>
            <TableHeaderCell style={{ width: 80 }}>Hora</TableHeaderCell>
            <TableHeaderCell style={{ width: 200 }}>Quién</TableHeaderCell>
            <TableHeaderCell>Acción</TableHeaderCell>
            <TableHeaderCell style={{ width: 220 }}>Desde dónde</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {p.auditoria.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="num">{e.hora}</TableCell>
              <TableCell>{e.usuario}</TableCell>
              <TableCell>{e.accion}</TableCell>
              <TableCell style={{ color: 'var(--colorNeutralForeground3)' }}>{e.origen}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="sub" style={{ marginTop: 12 }}>
        {ESTACIONES.length} estaciones en el flujo · {p.auditoria.length} eventos
      </p>
    </section>
  );
}
