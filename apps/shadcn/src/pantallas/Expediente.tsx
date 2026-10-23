import { Check, File, FileLock2, FileText, Lock, Minus, Printer, ShieldCheck } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle, Avatar, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/basicos';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/overlays';
import { cn } from '../ui/utils';

export function Expediente({ personaId }: { personaId: string }) {
  const estado = useEstado();
  const p = buscarPersona(estado, personaId);
  const carga = useCarga(`exp-${personaId}`, 500);
  if (!p || p.empresaId !== estado.empresaId) {
    return (
      <div className="text-muted-foreground grid place-items-center gap-1 py-24 text-center">
        <FileText className="size-8" />
        <div className="text-foreground font-semibold">Elige un expediente</div>
        Busca a la persona por cédula o nombre en la barra superior (atajo: /).
      </div>
    );
  }
  const actual = p.hitos.find((h) => h.estado === 'actual');

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <Card className="mb-4 gap-6 p-6">
        <div className="flex items-center gap-5">
          <Avatar className="size-[72px] text-[26px]">{iniciales(p)}</Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[25px] leading-tight font-semibold tracking-tight">{nombreCompleto(p)}</h1>
              <Badge variant={p.estado === 'En revisión' ? 'aviso' : p.estado === 'Proceso cerrado' ? 'neutro' : 'default'}>{p.estado}</Badge>
              {p.reingreso && <Badge variant="outline">Reingreso</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[#374151]">
              <span>
                CI <b className="num">{formatoCedula(p.cedula)}</b>
              </span>
              <span>{p.cargo}</span>
              <span>{p.proceso}</span>
              {actual && <span>Ahora en {estacion(actual.estacion).nombre}</span>}
            </div>
          </div>
          <Button variant="outline" disabled>
            <Printer /> Imprimir credencial
          </Button>
        </div>
        <ol className="grid grid-cols-6" aria-label="Estaciones del proceso">
          {p.hitos.map((h, i) => (
            <li key={h.estacion} className={cn('relative pt-9 text-center text-[12.8px]', h.estado === 'no_aplica' && 'opacity-50')} aria-current={h.estado === 'actual' ? 'step' : undefined}>
              <span
                className={cn(
                  'absolute top-[13px] h-0.5 bg-border',
                  i === 0 ? 'left-1/2 right-0' : i === p.hitos.length - 1 ? 'left-0 right-1/2' : 'inset-x-0',
                  h.estado === 'completado' && 'bg-success',
                )}
              />
              <span
                className={cn(
                  'absolute top-0 left-[calc(50%-14px)] grid size-7 place-items-center rounded-full border-2 bg-card text-xs font-semibold',
                  h.estado === 'completado' && 'border-success bg-success text-white',
                  h.estado === 'actual' && 'border-primary bg-primary text-white ring-4 ring-[#FBECEC]',
                  (h.estado === 'pendiente' || h.estado === 'no_aplica') && 'border-input text-muted-foreground',
                )}
              >
                {h.estado === 'completado' ? <Check className="size-4" /> : h.estado === 'no_aplica' ? <Minus className="size-4" /> : i + 1}
              </span>
              <div className="text-sm font-semibold">{estacion(h.estacion).nombre}</div>
              <div className="text-muted-foreground mt-0.5">
                {h.estado === 'completado' && (
                  <>
                    {h.hora}
                    <br />
                    {h.operador}
                  </>
                )}
                {h.estado === 'actual' && `Desde las ${h.hora}`}
                {h.estado === 'pendiente' && 'Pendiente'}
                {h.estado === 'no_aplica' && 'No aplica'}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({p.documentos.length})</TabsTrigger>
          <TabsTrigger value="validaciones">Validaciones</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
        </TabsList>
        <TabsContent value="datos">
          <Datos p={p} />
        </TabsContent>
        <TabsContent value="documentos">
          <Documentos p={p} />
        </TabsContent>
        <TabsContent value="validaciones">
          <Validaciones p={p} />
        </TabsContent>
        <TabsContent value="auditoria">
          <Auditoria p={p} />
        </TabsContent>
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
    <div className="grid grid-cols-[1.62fr_1fr] gap-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Datos personales</CardTitle>
            <CardDescription>Precargados desde la solicitud FOR-027</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-5">
            {campos.map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted-foreground text-[12.8px]">{k}</dt>
                <dd className="mt-1 font-medium break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ficha médica</CardTitle>
            <CardDescription>Información clínica confidencial (POL-03)</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/60 flex items-center gap-4 rounded-lg border border-dashed border-[#C9CDD4] p-5">
            <Lock className="size-6 shrink-0" />
            <div>
              <div className="font-semibold">Solo personal médico</div>
              <div className="text-muted-foreground mt-1 text-sm">Tu perfil ve la aptitud cuando el médico la registra, no el diagnóstico.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Documentos({ p }: { p: Persona }) {
  const [sel, setSel] = useState(p.documentos.find((d) => !d.restringido)?.id ?? '');
  const doc = p.documentos.find((d) => d.id === sel);
  const vp = doc ? vistaPrevia(doc, p) : null;
  return (
    <div className="grid grid-cols-[1fr_1.1fr] gap-4">
      <Card className="gap-0 p-2">
        {p.documentos.map((d) => (
          <button
            key={d.id}
            disabled={d.restringido}
            aria-pressed={d.id === sel}
            onClick={() => setSel(d.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md border border-transparent p-3 text-left outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed',
              d.id === sel && 'border-primary/30 bg-[#FBECEC] hover:bg-[#FBECEC]',
            )}
          >
            {d.restringido ? <FileLock2 className="size-5 shrink-0" /> : <File className="size-5 shrink-0" />}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{d.nombre}</span>
              <span className="text-muted-foreground block text-xs">
                {d.restringido ? 'Solo personal médico' : `${d.codigo} · ${estacion(d.estacion).nombre} · ${d.hora} · ${d.paginas} pág.`}
              </span>
            </span>
            <Badge variant={d.estado === 'Pendiente de firma' ? 'aviso' : d.estado === 'Firmado' ? 'exito' : 'info'}>{d.estado}</Badge>
          </button>
        ))}
      </Card>
      {vp && (
        <article className="papel" aria-label="Vista previa">
          <header>
            <span className="flex items-center gap-2">
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
    </div>
  );
}

function Validaciones({ p }: { p: Persona }) {
  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="bg-muted/60 flex items-center gap-8 rounded-lg px-5 py-4">
          <div>
            <div className="text-muted-foreground text-[12.8px]">Score de cumplimiento</div>
            <div className="num text-[31px] font-semibold">{p.score}/100</div>
          </div>
          <ChipRiesgo riesgo={p.riesgo} />
          <span className="flex-1" />
          <Button variant="outline" disabled>
            <ShieldCheck /> Informe con evidencias
          </Button>
        </div>
        <Alert variant="info">
          <ShieldCheck />
          <AlertTitle>Lo que ve el candidato</AlertTitle>
          <AlertDescription>Nunca la fuente ni el motivo. Si algo lo detiene, solo: «{MENSAJE_DISCRETO}»</AlertDescription>
        </Alert>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fuente</TableHead>
              <TableHead className="w-40">Tipo</TableHead>
              <TableHead className="w-52">Resultado</TableHead>
              <TableHead className="w-20">Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {p.validaciones.map((v) => (
              <TableRow key={v.fuente}>
                <TableCell className="py-2.5 font-semibold">{v.fuente}</TableCell>
                <TableCell>{v.tipo}</TableCell>
                <TableCell>
                  <ChipFuente estado={v.estado} />
                </TableCell>
                <TableCell className="num">{v.hora}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Auditoria({ p }: { p: Persona }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Auditoría</CardTitle>
          <CardDescription>Solo inserción: nadie edita ni borra la traza</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Hora</TableHead>
              <TableHead className="w-52">Quién</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead className="w-56">Desde dónde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {p.auditoria.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="num">{e.hora}</TableCell>
                <TableCell>{e.usuario}</TableCell>
                <TableCell>{e.accion}</TableCell>
                <TableCell className="text-muted-foreground">{e.origen}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
