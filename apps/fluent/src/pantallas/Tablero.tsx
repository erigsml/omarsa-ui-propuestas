import { GroupedVerticalBarChart } from '@fluentui/react-charts';
import {
  Button,
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Option,
  SearchBox,
  Select,
  type SortDirection,
  Switch,
  type TableColumnDefinition,
  TableCellLayout,
  Tooltip,
} from '@fluentui/react-components';
import {
  ArrowSwap20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Clock20Regular,
  DismissCircle20Regular,
  People20Regular,
  PersonClock20Regular,
  PersonAvailable20Regular,
  Warning20Filled,
  SearchInfo24Regular,
} from '@fluentui/react-icons';
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
  ordenar,
  paginar,
  turnosActivos,
  type TurnoVista,
  useCarga,
  useEstado,
} from '@propuestas/datos';
import { type ReactNode, useMemo, useState } from 'react';
import { ChipNivel, ChipTurno, ConCarga, useAvisos } from '../comunes';

const POR_PAGINA = 10;

interface Props {
  toaster: string;
  onAbrir: (personaId: string) => void;
}

export function Tablero({ toaster, onAbrir }: Props) {
  const estado = useEstado();
  const carga = useCarga(`tablero-${estado.empresaId}`);
  const avisar = useAvisos(toaster);
  const ind = indicadores(estado);
  const cuellos = cuellosDeBotella(estado);
  const peor = [...cuellos].sort((a, b) => b.carga - a.carga)[0];

  const [texto, setTexto] = useState('');
  const [est, setEst] = useState<EstacionId | 'todas'>('todas');
  const [soloExcedidos, setSoloExcedidos] = useState(false);
  const [orden, setOrden] = useState<{ col: keyof TurnoVista; dir: SortDirection }>({ col: 'esperaMin', dir: 'descending' });
  const [pagina, setPagina] = useState(1);
  const [transferir, setTransferir] = useState<TurnoVista | null>(null);
  const [cerrar, setCerrar] = useState<TurnoVista | null>(null);

  const filtrados = useMemo(
    () => ordenar(filtrarTurnos(turnosActivos(estado), { texto, estacion: est, soloExcedidos }), orden.col, orden.dir === 'ascending' ? 'asc' : 'desc'),
    [estado, texto, est, soloExcedidos, orden],
  );
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, paginas);
  const visibles = paginar(filtrados, paginaSegura, POR_PAGINA);

  const columnas: TableColumnDefinition<TurnoVista>[] = [
    createTableColumn<TurnoVista>({ columnId: 'codigo', compare: () => 0, renderHeaderCell: () => 'Turno', renderCell: (t) => <strong className="num">{t.codigo}</strong> }),
    createTableColumn<TurnoVista>({
      columnId: 'nombre',
      compare: () => 0,
      renderHeaderCell: () => 'Persona',
      renderCell: (t) => (
        <TableCellLayout description={`${t.cedula} · ${t.cargo}`}>
          <Button appearance="transparent" size="small" style={{ padding: 0, minWidth: 0, fontWeight: 600 }} onClick={() => onAbrir(t.personaId)}>
            {t.nombre}
          </Button>
        </TableCellLayout>
      ),
    }),
    createTableColumn<TurnoVista>({ columnId: 'estacionNombre', compare: () => 0, renderHeaderCell: () => 'Estación', renderCell: (t) => `${t.estacionNombre}${t.puesto ? ` · ${t.puesto}` : ''}` }),
    createTableColumn<TurnoVista>({ columnId: 'estado', compare: () => 0, renderHeaderCell: () => 'Estado', renderCell: (t) => <ChipTurno estado={t.estado} /> }),
    createTableColumn<TurnoVista>({
      columnId: 'esperaMin',
      compare: () => 0,
      renderHeaderCell: () => 'Espera',
      renderCell: (t) =>
        t.excedido ? (
          <span className="num" style={{ color: '#9E2806', fontWeight: 600, display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <Warning20Filled aria-hidden /> {duracion(t.esperaMin)} <span style={{ fontWeight: 400 }}>(máx. {t.objetivoMin})</span>
          </span>
        ) : (
          <span className="num">{duracion(t.esperaMin)}</span>
        ),
    }),
    createTableColumn<TurnoVista>({
      columnId: 'acciones',
      renderHeaderCell: () => <span className="sr-only">Acciones</span>,
      renderCell: (t) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip content="Transferir a otra estación" relationship="label">
            <Button size="small" appearance="subtle" icon={<ArrowSwap20Regular />} onClick={() => setTransferir(t)} />
          </Tooltip>
          <Tooltip content="Cerrar turno" relationship="label">
            <Button size="small" appearance="subtle" icon={<DismissCircle20Regular />} onClick={() => setCerrar(t)} />
          </Tooltip>
        </div>
      ),
    }),
  ];

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <div className="cabecera-pagina">
        <div>
          <h1>Tablero de turnos</h1>
          <p>
            {FECHA_HOY} · actualizado a las {horaActual()}
          </p>
        </div>
      </div>

      <section className="kpis" aria-label="Indicadores del día">
        <Kpi icono={<People20Regular />} etiqueta="Personas en planta" valor={ind.activos} nota={`${ind.enAtencion} en un puesto`} />
        <Kpi icono={<PersonClock20Regular />} etiqueta="En espera" valor={ind.enEspera} nota="en todas las estaciones" />
        <Kpi icono={<PersonAvailable20Regular />} etiqueta="Atendidos hoy" valor={ind.atendidosHoy} nota="desde las 06:00" />
        <Kpi icono={<Clock20Regular />} etiqueta="Espera promedio" valor={`${ind.esperaPromedio} min`} nota={`objetivo ${ind.objetivoPromedio} min`} />
        <Kpi icono={<Warning20Filled />} etiqueta="Turnos excedidos" valor={ind.excedidos} nota={ind.excedidos ? 'superan su espera máxima' : 'todo en tiempo'} alerta={ind.excedidos > 0} />
      </section>

      {ind.excedidos > 0 && peor && peor.nivel === 'critico' && (
        <MessageBar intent="error" layout="multiline" style={{ marginBottom: 16 }}>
          <MessageBarBody>
            <MessageBarTitle>{peor.nombre} es el cuello de botella</MessageBarTitle>
            Espera promedio de {peor.esperaPromedio} min con {peor.puestos} puestos (máximo {peor.objetivoMin} min). Abre otro puesto o transfiere turnos.
          </MessageBarBody>
          <MessageBarActions>
            <Button
              onClick={() => {
                setEst(peor.estacion);
                setSoloExcedidos(true);
                setPagina(1);
              }}
            >
              Ver excedidos de {peor.nombre}
            </Button>
          </MessageBarActions>
        </MessageBar>
      )}

      <div className="rejilla-2-1">
        <section className="tarjeta" aria-labelledby="t-cuellos">
          <h2 id="t-cuellos">Cuellos de botella por estación</h2>
          <p className="sub">Espera promedio frente a la espera máxima (línea vertical)</p>
          {cuellos.map((c) => (
            <div key={c.estacion} className={`cuello ${c.nivel}`}>
              <div>
                <div className="nombre">{c.nombre}</div>
                <ChipNivel nivel={c.nivel} />
              </div>
              <div className="pista" role="img" aria-label={`${c.nombre}: ${c.esperaPromedio} de ${c.objetivoMin} minutos`}>
                <div className={`relleno ${c.nivel}`} style={{ width: `${Math.min(100, (c.carga / 2) * 100)}%` }} />
                <div className="objetivo" style={{ left: '50%' }} />
              </div>
              <div className="meta">
                <b>{c.esperaPromedio} min</b> prom. · {c.enEspera} en cola
                <br />
                {c.enAtencion} en puesto · {c.puestos} puestos
              </div>
            </div>
          ))}
        </section>
        <section className="tarjeta" aria-labelledby="t-flujo">
          <h2 id="t-flujo">Flujo por hora</h2>
          <p className="sub">Ingresos por kiosco y atenciones finalizadas</p>
          <div style={{ height: 260, overflow: 'hidden' }}>
          <GroupedVerticalBarChart
            height={240}
            width={400}
            hideLegend={false}
            yAxisTickCount={4}
            data={flujoPorHora(estado).map((f) => ({
              name: f.hora,
              series: [
                { key: 'i', data: f.ingresos, legend: 'Ingresos', color: '#DD343B' },
                { key: 'a', data: f.atendidos, legend: 'Finalizados', color: '#4B5563' },
              ],
            }))}
          />
          </div>
        </section>
      </div>

      <section className="tarjeta" aria-labelledby="t-turnos">
        <h2 id="t-turnos">Turnos activos</h2>
        <p className="sub">{filtrados.length} turnos · ordenados por {orden.col === 'esperaMin' ? 'espera' : String(orden.col)}</p>
        <div className="filtros">
          <SearchBox
            placeholder="Nombre, cédula o turno"
            aria-label="Filtrar turnos"
            value={texto}
            onChange={(_, d) => {
              setTexto(d.value);
              setPagina(1);
            }}
            style={{ width: 280 }}
          />
          <Dropdown
            aria-label="Estación"
            value={est === 'todas' ? 'Todas las estaciones' : ESTACIONES.find((e) => e.id === est)?.nombre}
            selectedOptions={[est]}
            onOptionSelect={(_, d) => {
              setEst(d.optionValue as EstacionId | 'todas');
              setPagina(1);
            }}
          >
            <Option value="todas">Todas las estaciones</Option>
            {ESTACIONES.filter((e) => ESTACIONES_CON_TURNO.includes(e.id)).map((e) => (
              <Option key={e.id} value={e.id}>
                {e.nombre}
              </Option>
            ))}
          </Dropdown>
          <Switch
            label="Solo excedidos"
            checked={soloExcedidos}
            onChange={(_, d) => {
              setSoloExcedidos(d.checked);
              setPagina(1);
            }}
          />
        </div>
        {visibles.length === 0 ? (
          <div className="vacio">
            <SearchInfo24Regular />
            <strong>No hay turnos con esos filtros</strong>
            Cambia la estación o borra la búsqueda.
            <div style={{ marginTop: 12 }}>
              <Button
                onClick={() => {
                  setTexto('');
                  setEst('todas');
                  setSoloExcedidos(false);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        ) : (
          <DataGrid
            items={visibles}
            columns={columnas}
            getRowId={(t) => t.id}
            sortable
            sortState={{ sortColumn: orden.col, sortDirection: orden.dir }}
            onSortChange={(_, s) => s.sortColumn && s.sortColumn !== 'acciones' && setOrden({ col: s.sortColumn as keyof TurnoVista, dir: s.sortDirection })}
            size="small"
          >
            <DataGridHeader>
              <DataGridRow>{({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}</DataGridRow>
            </DataGridHeader>
            <DataGridBody<TurnoVista>>
              {({ item, rowId }) => (
                <DataGridRow<TurnoVista> key={rowId} style={item.excedido ? { boxShadow: 'inset 3px 0 0 #C4320A' } : undefined}>
                  {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        )}
        <div className="paginacion">
          <span>
            {filtrados.length === 0 ? 0 : (paginaSegura - 1) * POR_PAGINA + 1}–{Math.min(paginaSegura * POR_PAGINA, filtrados.length)} de {filtrados.length}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Button size="small" appearance="subtle" icon={<ChevronLeft20Regular />} aria-label="Página anterior" disabled={paginaSegura <= 1} onClick={() => setPagina(paginaSegura - 1)} />
            <span>
              Página {paginaSegura} de {paginas}
            </span>
            <Button size="small" appearance="subtle" icon={<ChevronRight20Regular />} aria-label="Página siguiente" disabled={paginaSegura >= paginas} onClick={() => setPagina(paginaSegura + 1)} />
          </div>
        </div>
      </section>

      <DialogoTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(destino, motivo) => {
          if (!transferir) return;
          avisar('Turno transferido', acciones.transferir(transferir.id, destino, motivo));
          setTransferir(null);
        }}
      />
      <Dialog open={!!cerrar} onOpenChange={(_, d) => !d.open && setCerrar(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>¿Cerrar el turno {cerrar?.codigo}?</DialogTitle>
            <DialogContent>
              {cerrar?.nombre} sale de la cola de {cerrar?.estacionNombre} y su proceso queda cerrado por hoy. Queda registrado en la auditoría y no se puede deshacer.
              <Field label="Motivo" style={{ marginTop: 16 }}>
                <Select id="motivo-cierre" defaultValue={MOTIVOS_CIERRE[0]}>
                  {MOTIVOS_CIERRE.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
              </Field>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCerrar(null)}>Cancelar</Button>
              <Button
                appearance="primary"
                style={{ background: '#C4320A' }}
                onClick={() => {
                  if (!cerrar) return;
                  const motivo = (document.getElementById('motivo-cierre') as HTMLSelectElement | null)?.value ?? MOTIVOS_CIERRE[0];
                  avisar('Turno cerrado', acciones.cerrar(cerrar.id, motivo), 'info');
                  setCerrar(null);
                }}
              >
                Cerrar turno
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </ConCarga>
  );
}

function Kpi({ icono, etiqueta, valor, nota, alerta }: { icono: ReactNode; etiqueta: string; valor: number | string; nota: string; alerta?: boolean }) {
  return (
    <div className={`kpi${alerta ? ' alerta' : ''}`}>
      <div className="etq">
        {icono} {etiqueta}
      </div>
      <div className="valor">{valor}</div>
      <div className="nota">{nota}</div>
    </div>
  );
}

export function DialogoTransferir({
  turno,
  onCerrar,
  onConfirmar,
}: {
  turno: TurnoVista | null;
  onCerrar: () => void;
  onConfirmar: (destino: EstacionId, motivo: string) => void;
}) {
  const opciones = ESTACIONES.filter((e) => ESTACIONES_CON_TURNO.includes(e.id) && e.id !== turno?.estacion);
  const [destino, setDestino] = useState<EstacionId | ''>('');
  const [motivo, setMotivo] = useState<string>(MOTIVOS_TRANSFERENCIA[0]);
  const [intentado, setIntentado] = useState(false);
  const cerrar = () => {
    setDestino('');
    setIntentado(false);
    onCerrar();
  };
  return (
    <Dialog open={!!turno} onOpenChange={(_, d) => !d.open && cerrar()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Transferir a {turno?.nombre}</DialogTitle>
          <DialogContent style={{ display: 'grid', gap: 16 }}>
            <span>
              Turno {turno?.codigo}, hoy en {turno?.estacionNombre}. Pasa al final de la cola de destino.
            </span>
            <Field label="Estación de destino" required validationMessage={intentado && !destino ? 'Elige la estación de destino.' : undefined}>
              <Dropdown placeholder="Elige una estación" value={opciones.find((o) => o.id === destino)?.nombre ?? ''} onOptionSelect={(_, d) => setDestino(d.optionValue as EstacionId)}>
                {opciones.map((e) => (
                  <Option key={e.id} value={e.id}>
                    {e.nombre}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label="Motivo">
              <Select value={motivo} onChange={(_, d) => setMotivo(d.value)}>
                {MOTIVOS_TRANSFERENCIA.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrar}>Cancelar</Button>
            <Button
              appearance="primary"
              onClick={() => {
                setIntentado(true);
                if (!destino) return;
                onConfirmar(destino, motivo);
                setDestino('');
                setIntentado(false);
              }}
            >
              Transferir
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
