import { AlertTriangle, ArrowLeftRight, Check, ChevronDown, Inbox, Megaphone, Undo2, Volume2 } from 'lucide-react';
import {
  acciones,
  colaDelPuesto,
  duracion,
  estacion,
  type ErroresSeguridad,
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
import { type ReactNode, useCallback, useId, useState } from 'react';
import { toast } from 'sonner';
import { ConCarga } from '../comunes';
import { Avatar, Badge, Card, Label, Separator, Textarea } from '../ui/basicos';
import { Button } from '../ui/button';
import { Checkbox, RadioGroup, RadioGroupItem } from '../ui/formulario';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/overlays';
import { cn } from '../ui/utils';
import { DialogoTransferir } from './Tablero';

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
    if (nombres.length) toast.info(n > 1 ? `Llamaste a ${nombres.length} personas` : 'Llamado en pantalla', { description: nombres.join(', ') });
  }, []);
  useAtajo('l', useCallback(() => !cola.enAtencion && llamar(1), [cola.enAtencion, llamar]));
  const rellamar = (t: TurnoVista) => toast.info('Volviste a llamar', { description: acciones.rellamar(t.id) });

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <div className="mb-6">
        <h1 className="text-[25px] leading-tight font-semibold tracking-tight">Puesto de atención</h1>
        <p className="text-muted-foreground mt-1">
          {est.nombre} · Puesto {estado.puesto.id} · {estado.puesto.operador} · Jornada matutina
        </p>
      </div>
      <Card className="mb-4 flex-row items-center gap-6 px-5 py-3 text-sm" role="status">
        <Badge variant="exito" className="gap-1.5 px-2.5 py-1">
          <span className="bg-success size-2 rounded-full" /> Operativo
        </Badge>
        <span>
          En espera <b className="num">{cola.espera.length}</b>
        </span>
        <span>
          Llamados <b className="num">{cola.llamados.length}</b>
        </span>
        <span>
          Atención promedio <b>6 min</b>
        </span>
        <span className="text-muted-foreground ml-auto">
          Atajo: <kbd className="bg-muted rounded border px-1.5 font-mono text-xs">L</kbd> llama al siguiente
        </span>
      </Card>

      <div className="grid grid-cols-[1.62fr_1fr] items-start gap-4">
        <Card className="p-6" aria-live="polite">
          {cola.enAtencion ? (
            <Atencion t={cola.enAtencion} onTransferir={setTransferir} onAbrir={onAbrir} />
          ) : primero ? (
            <div className="flex flex-col items-center py-4 text-center">
              <Badge variant="aviso" className="px-2.5 py-1 text-sm [&>svg]:size-4">
                <Megaphone /> Llamado en la TV · {primero.llamadas} {primero.llamadas === 1 ? 'vez' : 'veces'}
              </Badge>
              <Avatar className="mt-5 size-24 text-[32px]">{primero.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('')}</Avatar>
              <div className="mt-4 text-[31px] leading-tight font-semibold">{primero.nombre}</div>
              <div className="text-muted-foreground mt-1 mb-3">
                {primero.cedula} · {primero.cargo} · {primero.proceso}
                {primero.reingreso && ' · Reingreso'}
              </div>
              <span className="text-primary rounded-md bg-[#FBECEC] px-3 py-1 text-xl font-bold tracking-wider">{primero.codigo}</span>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button size="lg" className="min-w-[200px]" onClick={() => acciones.atender(primero.id)}>
                  <Check /> Atender
                </Button>
                <Button size="lg" variant="outline" onClick={() => rellamar(primero)}>
                  <Volume2 /> Re-llamar
                </Button>
                <Button size="lg" variant="outline" onClick={() => setTransferir(primero)}>
                  <ArrowLeftRight /> Transferir
                </Button>
                <Button size="lg" variant="ghost" onClick={() => toast.warning('Vuelve a la cola', { description: `${acciones.devolverACola(primero.id)} no se presentó.` })}>
                  <Undo2 /> No se presentó
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground grid place-items-center gap-1 py-16 text-center">
              <Inbox className="size-10" />
              <div className="text-foreground text-base font-semibold">{cola.espera.length ? 'Listo para atender' : 'No hay nadie en espera'}</div>
              <p className="max-w-sm">
                {cola.espera.length ? `Hay ${cola.espera.length} personas esperando. Llama a la siguiente.` : 'Cuando alguien termine en el kiosco o en otra estación, aparecerá en tu cola.'}
              </p>
            </div>
          )}
        </Card>

        <Card className="gap-0 p-5" aria-label="Cola de espera">
          <div className="flex">
            <Button size="xl" className="flex-1 rounded-r-none" disabled={bloqueado} onClick={() => llamar(1)} aria-keyshortcuts="L">
              <Megaphone className="size-5" /> Llamar siguiente
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={bloqueado}>
                <Button size="xl" className="rounded-l-none border-l border-white/30 px-4" aria-label="Llamar a varias personas">
                  <ChevronDown className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => llamar(2)}>Llamar a 2 personas</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => llamar(3)}>Llamar a 3 personas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {cola.enAtencion && <p className="text-muted-foreground mt-2 text-[12.8px]">Termina la atención actual para llamar a otra persona.</p>}
          {cola.llamados.length > 1 && (
            <>
              <Titulo>Llamados ({cola.llamados.length})</Titulo>
              {cola.llamados.slice(1).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 py-2">
                  <div>
                    <div className="text-sm font-semibold">
                      {t.codigo} · {t.nombre}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Llamado {t.llamadas} {t.llamadas === 1 ? 'vez' : 'veces'}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => rellamar(t)}>
                    <Volume2 /> Re-llamar
                  </Button>
                </div>
              ))}
            </>
          )}
          <Titulo>En espera ({cola.espera.length}) · por orden de llegada</Titulo>
          {cola.espera.length === 0 && <p className="text-muted-foreground py-4 text-center">No hay nadie en espera</p>}
          {cola.espera.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 border-b py-2.5 last:border-0">
              <span className="num w-14 font-bold whitespace-nowrap">{t.codigo}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{t.nombre}</div>
                <div className="text-muted-foreground truncate text-xs">
                  {i === 0 ? 'Siguiente · ' : ''}
                  {t.cargo}
                </div>
              </div>
              <span className={cn('num inline-flex items-center gap-1 text-sm', t.excedido && 'font-semibold text-[#9E2806]')}>
                {t.excedido && <AlertTriangle className="size-3.5" />} {duracion(t.esperaMin)}
              </span>
            </div>
          ))}
        </Card>
      </div>
      <DialogoTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(d, m) => {
          if (!transferir) return;
          toast.success('Turno transferido', { description: acciones.transferir(transferir.id, d, m) });
          setTransferir(null);
        }}
      />
    </ConCarga>
  );
}

const Titulo = ({ children }: { children: ReactNode }) => (
  <div className="text-muted-foreground mt-5 mb-1 flex items-center gap-3 text-xs font-semibold tracking-wide uppercase">
    {children}
    <Separator className="flex-1" />
  </div>
);

function Error({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} className="text-destructive mt-1.5 flex items-center gap-1 text-sm" role="alert">
      <AlertTriangle className="size-3.5 shrink-0" /> {texto}
    </p>
  );
}

function Atencion({ t, onTransferir, onAbrir }: { t: TurnoVista; onTransferir: (t: TurnoVista) => void; onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const p = buscarPersona(estado, t.personaId);
  const destino = p ? siguienteEstacion(p, t.estacion) : undefined;
  const id = useId();
  const [v, setV] = useState<FormularioSeguridad>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<ErroresSeguridad>({});
  const [tocado, setTocado] = useState(false);
  const actualizar = (cambio: Partial<FormularioSeguridad>) => {
    const nuevo = { ...v, ...cambio };
    setV(nuevo);
    if (tocado) setErrores(validarSeguridad(nuevo, true));
  };
  const enviar = (aprobar: boolean) => {
    setTocado(true);
    const e = validarSeguridad(v, aprobar);
    setErrores(e);
    if (Object.keys(e).length) return;
    const msg = acciones.finalizar(t.id, aprobar, v.observaciones.trim());
    if (aprobar) toast.success('Atención finalizada', { description: msg });
    else toast.warning('Novedad registrada', { description: msg });
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar className="size-14 text-lg">{p ? iniciales(p) : ''}</Avatar>
        <div className="flex-1">
          <div className="text-xl font-semibold">{t.nombre}</div>
          <div className="text-muted-foreground text-sm">
            {t.codigo} · {t.cedula} · {t.cargo}
          </div>
        </div>
        <Badge variant="exito">En atención</Badge>
        <Button variant="link" onClick={() => onAbrir(t.personaId)}>
          Ver expediente
        </Button>
      </div>
      <Separator className="my-5" />
      <form
        noValidate
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          enviar(true);
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Checkbox id={`${id}-c`} checked={v.consentimiento} onCheckedChange={(c) => actualizar({ consentimiento: c === true })} aria-invalid={!!errores.consentimiento} aria-describedby={`${id}-ce`} />
            <Label htmlFor={`${id}-c`} className="font-normal">
              La persona firmó la autorización de pruebas de seguridad
            </Label>
          </div>
          <Error id={`${id}-ce`} texto={errores.consentimiento} />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Prueba de drogas <span className="text-destructive">*</span>
          </legend>
          <RadioGroup className="flex gap-6" value={v.drogas} onValueChange={(d) => actualizar({ drogas: d as FormularioSeguridad['drogas'] })} aria-describedby={`${id}-de`}>
            {[
              ['no_reactivo', 'No reactivo'],
              ['reactivo', 'Reactivo'],
            ].map(([valor, texto]) => (
              <div key={valor} className="flex items-center gap-2">
                <RadioGroupItem value={valor ?? ''} id={`${id}-${valor}`} aria-invalid={!!errores.drogas} />
                <Label htmlFor={`${id}-${valor}`} className="font-normal">
                  {texto}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Error id={`${id}-de`} texto={errores.drogas} />
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">Tatuajes por zona</legend>
          <p className="text-muted-foreground mb-2 text-xs">Marca solo las zonas con tatuajes visibles</p>
          <div className="flex gap-6">
            {ZONAS_TATUAJE.map((z) => (
              <div key={z} className="flex items-center gap-2">
                <Checkbox id={`${id}-${z}`} checked={v.tatuajes.includes(z)} onCheckedChange={(c) => actualizar({ tatuajes: c === true ? [...v.tatuajes, z] : v.tatuajes.filter((x) => x !== z) })} />
                <Label htmlFor={`${id}-${z}`} className="font-normal">
                  {z}
                </Label>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-o`}>
            Observaciones para la auditoría <span className="text-destructive">*</span>
          </Label>
          <Textarea id={`${id}-o`} rows={3} value={v.observaciones} onChange={(e) => actualizar({ observaciones: e.target.value })} onBlur={() => tocado || setErrores((x) => ({ ...x, observaciones: validarSeguridad(v, true).observaciones }))} aria-invalid={!!errores.observaciones} aria-describedby={`${id}-oe ${id}-oh`} />
          <p id={`${id}-oh`} className="text-muted-foreground text-xs">
            Quedan en la traza del expediente
          </p>
          <Error id={`${id}-oe`} texto={errores.observaciones} />
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => onTransferir(t)}>
            <ArrowLeftRight /> Transferir a otro módulo
          </Button>
          <Button type="button" variant="outline" onClick={() => enviar(false)}>
            <AlertTriangle /> Registrar novedad
          </Button>
          <Button type="submit">
            <Check /> Aprobar: pasar a {destino ? estacion(destino).nombre : 'fin'}
          </Button>
        </div>
      </form>
    </div>
  );
}
