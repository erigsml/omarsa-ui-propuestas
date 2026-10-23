import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { AlertTriangle, ArrowDown, ArrowLeftRight, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Clock, SearchX, UserCheck, Users, UsersRound, XCircle } from 'lucide-react';
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
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { ChipNivel, ChipTurno, ConCarga } from '../comunes';
import { Alert, AlertDescription, AlertTitle, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Progress, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/basicos';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '../ui/formulario';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tooltip,
} from '../ui/overlays';
import { cn } from '../ui/utils';

const COLOR_NIVEL = { normal: 'bg-[#6B7280]', atencion: 'bg-[#B7791F]', critico: 'bg-destructive' } as const;
const opcionesEstacion = ESTACIONES.filter((e) => ESTACIONES_CON_TURNO.includes(e.id));

export function Tablero({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const carga = useCarga(`tablero-${estado.empresaId}`);
  const ind = indicadores(estado);
  const cuellos = cuellosDeBotella(estado);
  const peor = [...cuellos].sort((a, b) => b.carga - a.carga)[0];
  const [texto, setTexto] = useState('');
  const [est, setEst] = useState<EstacionId | 'todas'>('todas');
  const [soloExcedidos, setSoloExcedidos] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'esperaMin', desc: true }]);
  const [paginacion, setPaginacion] = useState({ pageIndex: 0, pageSize: 10 });
  const [transferir, setTransferir] = useState<TurnoVista | null>(null);
  const [cerrar, setCerrar] = useState<TurnoVista | null>(null);
  const [motivo, setMotivo] = useState<string>(MOTIVOS_CIERRE[0]);

  const filas = useMemo(() => filtrarTurnos(turnosActivos(estado), { texto, estacion: est, soloExcedidos }), [estado, texto, est, soloExcedidos]);

  const columnas = useMemo<ColumnDef<TurnoVista>[]>(
    () => [
      { accessorKey: 'codigo', header: 'Turno', cell: ({ row }) => <span className="num font-bold">{row.original.codigo}</span> },
      {
        accessorKey: 'nombre',
        header: 'Persona',
        cell: ({ row: { original: t } }) => (
          <div>
            <button className="text-primary rounded-sm font-semibold hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none" onClick={() => onAbrir(t.personaId)}>
              {t.nombre}
            </button>
            <div className="text-muted-foreground text-xs">
              {t.cedula} · {t.cargo}
            </div>
          </div>
        ),
      },
      { accessorKey: 'estacionNombre', header: 'Estación', cell: ({ row: { original: t } }) => `${t.estacionNombre}${t.puesto ? ` · ${t.puesto}` : ''}` },
      { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <ChipTurno estado={row.original.estado} /> },
      {
        accessorKey: 'esperaMin',
        header: 'Espera',
        cell: ({ row: { original: t } }) =>
          t.excedido ? (
            <span className="num inline-flex items-center gap-1 font-semibold text-[#9E2806]">
              <AlertTriangle className="size-3.5" /> {duracion(t.esperaMin)} <span className="font-normal">(máx. {t.objetivoMin})</span>
            </span>
          ) : (
            <span className="num">{duracion(t.esperaMin)}</span>
          ),
      },
      {
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        enableSorting: false,
        cell: ({ row: { original: t } }) => (
          <div className="flex gap-1">
            <Tooltip texto="Transferir a otra estación">
              <Button variant="ghost" size="icon-sm" aria-label="Transferir" onClick={() => setTransferir(t)}>
                <ArrowLeftRight />
              </Button>
            </Tooltip>
            <Tooltip texto="Cerrar turno">
              <Button variant="ghost" size="icon-sm" aria-label="Cerrar turno" className="text-destructive hover:text-destructive" onClick={() => setCerrar(t)}>
                <XCircle />
              </Button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [onAbrir],
  );

  const tabla = useReactTable({
    data: filas,
    columns: columnas,
    state: { sorting, pagination: paginacion },
    onSortingChange: setSorting,
    onPaginationChange: setPaginacion,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (t) => t.id,
  });
  const resetPagina = () => setPaginacion((p) => ({ ...p, pageIndex: 0 }));
  const desde = filas.length ? paginacion.pageIndex * paginacion.pageSize + 1 : 0;
  const hasta = Math.min((paginacion.pageIndex + 1) * paginacion.pageSize, filas.length);

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <div className="mb-6">
        <h1 className="text-[25px] leading-tight font-semibold tracking-tight">Tablero de turnos</h1>
        <p className="text-muted-foreground mt-1">
          {FECHA_HOY} · actualizado a las {horaActual()}
        </p>
      </div>

      <section className="mb-4 grid grid-cols-5 gap-4" aria-label="Indicadores del día">
        <Kpi icono={<UsersRound />} titulo="Personas en planta" valor={ind.activos} nota={`${ind.enAtencion} en un puesto`} />
        <Kpi icono={<Users />} titulo="En espera" valor={ind.enEspera} nota="en todas las estaciones" />
        <Kpi icono={<UserCheck />} titulo="Atendidos hoy" valor={ind.atendidosHoy} nota="desde las 06:00" />
        <Kpi icono={<Clock />} titulo="Espera promedio" valor={`${ind.esperaPromedio} min`} nota={`objetivo ${ind.objetivoPromedio} min`} />
        <Kpi icono={<AlertTriangle />} titulo="Turnos excedidos" valor={ind.excedidos} nota={ind.excedidos ? 'superan su espera máxima' : 'todo en tiempo'} alerta={ind.excedidos > 0} />
      </section>

      {peor?.nivel === 'critico' && (
        <Alert variant="error" className="mb-4 py-4">
          <AlertTriangle />
          <AlertTitle className="text-base">{peor.nombre} es el cuello de botella</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>
              Espera promedio de {peor.esperaPromedio} min con {peor.puestos} puestos (máximo {peor.objetivoMin} min). Abre otro puesto o transfiere turnos.
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setEst(peor.estacion);
                setSoloExcedidos(true);
                resetPagina();
              }}
            >
              Ver excedidos de {peor.nombre}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-4 grid grid-cols-[1.62fr_1fr] gap-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Cuellos de botella por estación</CardTitle>
              <CardDescription>Espera promedio frente a la espera máxima (línea vertical)</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-1">
            {cuellos.map((c) => (
              <div key={c.estacion} className={cn('grid grid-cols-[120px_1fr_176px] items-center gap-4 rounded-md px-3 py-2.5', c.nivel === 'critico' && 'bg-destructive-soft shadow-[inset_3px_0_0_var(--destructive)]')}>
                <div>
                  <div className="font-semibold">{c.nombre}</div>
                  <ChipNivel nivel={c.nivel} />
                </div>
                <div className="relative" role="img" aria-label={`${c.nombre}: ${c.esperaPromedio} de ${c.objetivoMin} minutos`}>
                  <Progress value={Math.min(100, c.carga * 50)} indicador={COLOR_NIVEL[c.nivel]} />
                  <span className="bg-foreground absolute -top-1 -bottom-1 left-1/2 w-0.5" />
                </div>
                <div className="text-muted-foreground text-right text-[12.8px]">
                  <b className="num text-foreground">{c.esperaPromedio} min</b> prom. · {c.enEspera} en cola
                  <br />
                  {c.enAtencion} en puesto · {c.puestos} puestos
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Flujo por hora</CardTitle>
              <CardDescription>Ingresos por kiosco y atenciones finalizadas</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flujoPorHora(estado)} barGap={4} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#EEF0F3" />
                <XAxis dataKey="hora" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#5C6370' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#5C6370' }} />
                <RTooltip cursor={{ fill: '#F1F2F5' }} contentStyle={{ borderRadius: 8, border: '1px solid #E3E6EB', fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="atendidos" name="Finalizados" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="items-center">
          <div>
            <CardTitle>Turnos activos</CardTitle>
            <CardDescription>{filas.length} turnos</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Input
              aria-label="Filtrar turnos"
              placeholder="Nombre, cédula o turno"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                resetPagina();
              }}
              className="w-[260px]"
            />
            <Select
              value={est}
              onValueChange={(v) => {
                setEst(v as EstacionId | 'todas');
                resetPagina();
              }}
            >
              <SelectTrigger className="w-[200px]" aria-label="Estación">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las estaciones</SelectItem>
                {opcionesEstacion.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="solo-excedidos"
                checked={soloExcedidos}
                onCheckedChange={(v) => {
                  setSoloExcedidos(v);
                  resetPagina();
                }}
              />
              <Label htmlFor="solo-excedidos" className="font-normal">
                Solo excedidos
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filas.length === 0 ? (
            <div className="text-muted-foreground grid place-items-center gap-1 py-12 text-center">
              <SearchX className="size-8" />
              <div className="text-foreground font-semibold">No hay turnos con esos filtros</div>
              Cambia la estación o borra la búsqueda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                {tabla.getHeaderGroups().map((g) => (
                  <TableRow key={g.id}>
                    {g.headers.map((h) => {
                      const dir = h.column.getIsSorted();
                      return (
                        <TableHead key={h.id} aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                          {h.column.getCanSort() ? (
                            <button className="inline-flex items-center gap-1 rounded-sm uppercase outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" onClick={h.column.getToggleSortingHandler()}>
                              {flexRender(h.column.columnDef.header, h.getContext())}
                              {dir === 'asc' ? <ArrowUp className="size-3.5" /> : dir === 'desc' ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-40" />}
                            </button>
                          ) : (
                            flexRender(h.column.columnDef.header, h.getContext())
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {tabla.getRowModel().rows.map((r) => (
                  <TableRow key={r.id} className={cn(r.original.excedido && '[&>td:first-child]:shadow-[inset_3px_0_0_var(--destructive)]')}>
                    {r.getVisibleCells().map((c) => (
                      <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="text-muted-foreground mt-3 flex items-center justify-between text-[12.8px]">
            <span>
              {desde}–{hasta} de {filas.length}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" aria-label="Página anterior" disabled={!tabla.getCanPreviousPage()} onClick={() => tabla.previousPage()}>
                <ChevronLeft />
              </Button>
              Página {paginacion.pageIndex + 1} de {Math.max(1, tabla.getPageCount())}
              <Button variant="outline" size="icon-sm" aria-label="Página siguiente" disabled={!tabla.getCanNextPage()} onClick={() => tabla.nextPage()}>
                <ChevronRight />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogoTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(d, m) => {
          if (!transferir) return;
          toast.success('Turno transferido', { description: acciones.transferir(transferir.id, d, m) });
          setTransferir(null);
        }}
      />
      <AlertDialog open={!!cerrar} onOpenChange={(v) => !v && setCerrar(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>¿Cerrar el turno {cerrar?.codigo}?</AlertDialogTitle>
          <AlertDialogDescription>
            {cerrar?.nombre} sale de la cola de {cerrar?.estacionNombre} y su proceso queda cerrado por hoy. Queda registrado en la auditoría y no se puede deshacer.
          </AlertDialogDescription>
          <div className="grid gap-2">
            <Label>Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_CIERRE.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!cerrar) return;
                toast('Turno cerrado', { description: acciones.cerrar(cerrar.id, motivo) });
                setCerrar(null);
              }}
            >
              Cerrar turno
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ConCarga>
  );
}

function Kpi({ icono, titulo, valor, nota, alerta }: { icono: ReactNode; titulo: string; valor: number | string; nota: string; alerta?: boolean }) {
  return (
    <Card className={cn('gap-0 px-5 py-4', alerta && 'border-destructive bg-destructive-soft')}>
      <div className={cn('text-muted-foreground flex items-center gap-1.5 text-[12.8px] [&>svg]:size-4', alerta && 'text-[#9E2806]')}>
        {icono} {titulo}
      </div>
      <div className={cn('num mt-2 text-[31px] leading-tight font-semibold', alerta && 'text-[#9E2806]')}>{valor}</div>
      <div className="text-muted-foreground mt-1 text-[12.8px]">{nota}</div>
    </Card>
  );
}

export function DialogoTransferir({ turno, onCerrar, onConfirmar }: { turno: TurnoVista | null; onCerrar: () => void; onConfirmar: (d: EstacionId, m: string) => void }) {
  const [destino, setDestino] = useState<string>('');
  const [motivo, setMotivo] = useState<string>(MOTIVOS_TRANSFERENCIA[0]);
  const [intentado, setIntentado] = useState(false);
  const cerrar = () => {
    setDestino('');
    setIntentado(false);
    onCerrar();
  };
  const error = intentado && !destino;
  return (
    <Dialog open={!!turno} onOpenChange={(v) => !v && cerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir a {turno?.nombre}</DialogTitle>
          <DialogDescription>
            Turno {turno?.codigo}, hoy en {turno?.estacionNombre}. Pasa al final de la cola de destino.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="destino">
            Estación de destino <span className="text-destructive">*</span>
          </Label>
          <Select value={destino} onValueChange={setDestino}>
            <SelectTrigger id="destino" className="w-full" aria-invalid={error} aria-describedby={error ? 'destino-error' : undefined}>
              <SelectValue placeholder="Elige una estación" />
            </SelectTrigger>
            <SelectContent>
              {opcionesEstacion
                .filter((e) => e.id !== turno?.estacion)
                .map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {error && (
            <p id="destino-error" className="text-destructive flex items-center gap-1 text-sm">
              <AlertTriangle className="size-3.5" /> Elige la estación de destino.
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Motivo</Label>
          <Select value={motivo} onValueChange={setMotivo}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOTIVOS_TRANSFERENCIA.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={cerrar}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setIntentado(true);
              if (!destino) return;
              onConfirmar(destino as EstacionId, motivo);
              setDestino('');
              setIntentado(false);
            }}
          >
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
