import { Bell, IdCard, LayoutDashboard, Megaphone, Search } from 'lucide-react';
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
  useAtajo,
  useEstado,
  useNavegacion,
  USUARIO,
} from '@propuestas/datos';
import { useCallback, useState } from 'react';
import { Toaster } from 'sonner';
import { Expediente } from './pantallas/Expediente';
import { Puesto } from './pantallas/Puesto';
import { Tablero } from './pantallas/Tablero';
import { Avatar, Badge } from './ui/basicos';
import { Button } from './ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/formulario';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Tooltip, TooltipProvider } from './ui/overlays';
import { cn } from './ui/utils';

const ICONOS = { tablero: LayoutDashboard, expediente: IdCard, puesto: Megaphone } as const;

export function App() {
  const estado = useEstado();
  const nav = useNavegacion(personaDestacada(estado));
  return (
    <TooltipProvider>
      <Toaster position="bottom-right" richColors closeButton />
      <div className="grid min-h-screen grid-cols-[248px_1fr]">
        <aside className="bg-sidebar text-sidebar-foreground sticky top-0 flex h-screen flex-col" aria-label="Menú principal">
          <div className="flex items-center gap-3 px-5 pt-5 pb-4">
            <Isotipo tam={36} />
            <div>
              <div className="text-[15px] leading-tight font-bold">Acuícola Demo</div>
              <div className="text-xs text-[#A7ADB8]">Contratación · BackOffice</div>
            </div>
          </div>
          <div className="px-5 pt-2 pb-2 text-xs font-semibold tracking-wider text-[#A7ADB8] uppercase">Operación</div>
          <nav className="grid gap-1 px-2">
            {PANTALLAS.map((p) => {
              const Icono = ICONOS[p.id];
              const activo = nav.pantalla === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => nav.ir(p.id)}
                  aria-current={activo ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-white/40',
                    activo ? 'bg-primary text-white' : 'text-[#D5D9E0] hover:bg-white/5',
                  )}
                >
                  <Icono className="size-[18px]" strokeWidth={1.75} />
                  {p.titulo}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-[#2B2F37] px-5 py-4 text-xs text-[#A7ADB8]">Prototipo · datos sintéticos</div>
        </aside>
        <div className="flex min-w-0 flex-col">
          <Barra onAbrir={nav.abrirExpediente} />
          <main className="flex-1 px-8 pt-6 pb-12">
            {nav.pantalla === 'tablero' && <Tablero onAbrir={nav.abrirExpediente} />}
            {nav.pantalla === 'expediente' && <Expediente personaId={nav.personaId} />}
            {nav.pantalla === 'puesto' && <Puesto onAbrir={nav.abrirExpediente} />}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Barra({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  useAtajo('/', useCallback(() => setAbierto(true), []));
  const resultados = buscarPersonas(estado, texto, 8);

  return (
    <header className="bg-card sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-6">
      <button
        onClick={() => setAbierto(true)}
        className="border-input text-muted-foreground flex h-9 w-[420px] items-center gap-2 rounded-md border bg-card px-3 text-sm shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
        aria-label="Buscar persona por cédula o nombre"
      >
        <Search className="size-4" />
        Buscar por cédula o nombre
        <kbd className="bg-muted ml-auto rounded border px-1.5 font-mono text-xs">/</kbd>
      </button>
      <CommandDialog open={abierto} onOpenChange={(v) => { setAbierto(v); if (!v) setTexto(''); }} titulo="Buscar persona">
        <CommandInput placeholder="Cédula (09 1234…) o nombre" value={texto} onValueChange={setTexto} />
        <CommandList>
          {texto.length >= 2 && <CommandEmpty>Sin coincidencias para «{texto}».</CommandEmpty>}
          {texto.length < 2 && <div className="text-muted-foreground px-4 py-6 text-sm">Escribe al menos 2 letras o 3 dígitos de la cédula.</div>}
          {resultados.length > 0 && (
            <CommandGroup heading="Personas">
              {resultados.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.id}
                  onSelect={() => {
                    onAbrir(p.id);
                    setAbierto(false);
                    setTexto('');
                  }}
                >
                  <Avatar className="size-8 text-xs">{p.nombres[0]}{p.apellidos[0]}</Avatar>
                  <div>
                    <div className="font-medium">{nombreCompleto(p)}</div>
                    <div className="text-muted-foreground text-xs">
                      {formatoCedula(p.cedula)} · {p.cargo}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
      <span className="flex-1" />
      <Select value={estado.empresaId} onValueChange={(v) => acciones.cambiarEmpresa(v as EmpresaId)}>
        <SelectTrigger className="w-[280px]" aria-label="Empresa">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EMPRESAS.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Tooltip texto="Notificaciones">
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="size-5" strokeWidth={1.75} />
        </Button>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md p-1 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40" aria-label="Menú de usuario">
            <Avatar fondo="bg-primary text-white text-sm">{USUARIO.iniciales}</Avatar>
            <span>
              <span className="block text-sm leading-tight font-semibold">{USUARIO.nombre}</span>
              <span className="text-muted-foreground block text-xs">{USUARIO.rol}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuCheckboxItem checked={estado.simularFalla} onCheckedChange={acciones.alternarFalla}>
            Simular falla de conexión
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {estado.simularFalla && <Badge variant="error">Sin conexión</Badge>}
    </header>
  );
}
