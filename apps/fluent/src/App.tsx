import {
  Avatar,
  Badge,
  Button,
  Combobox,
  Dropdown,
  FluentProvider,
  Menu,
  MenuItem,
  MenuItemCheckbox,
  MenuList,
  MenuPopover,
  MenuTrigger,
  NavDrawer,
  NavDrawerBody,
  NavItem,
  NavSectionHeader,
  Option,
  Toaster,
  Tooltip,
  useId,
} from '@fluentui/react-components';
import {
  Alert20Regular,
  Board20Filled,
  Board20Regular,
  bundleIcon,
  DocumentPerson20Filled,
  DocumentPerson20Regular,
  PersonCall20Filled,
  PersonCall20Regular,
  Search20Regular,
} from '@fluentui/react-icons';
import {
  acciones,
  buscarPersonas,
  EMPRESAS,
  type EmpresaId,
  formatoCedula,
  Isotipo,
  nombreCompleto,
  type Pantalla,
  personaDestacada,
  useAtajo,
  useEstado,
  useNavegacion,
  USUARIO,
} from '@propuestas/datos';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Expediente } from './pantallas/Expediente';
import { Puesto } from './pantallas/Puesto';
import { Tablero } from './pantallas/Tablero';
import { tema, temaLateral } from './tema';

const Tableroi = bundleIcon(Board20Filled, Board20Regular);
const Expedientei = bundleIcon(DocumentPerson20Filled, DocumentPerson20Regular);
const Puestoi = bundleIcon(PersonCall20Filled, PersonCall20Regular);

export function App() {
  const estado = useEstado();
  const nav = useNavegacion(personaDestacada(estado));
  const toaster = useId('avisos');

  return (
    <FluentProvider theme={tema} lang="es-EC" className="shell-raiz">
      <Toaster toasterId={toaster} position="bottom-end" />
      <div className="shell">
        <FluentProvider theme={temaLateral} className="lateral">
        <aside aria-label="Menú principal" style={{ display: 'contents' }}>
          <div className="marca">
            <Isotipo tam={36} />
            <div>
              <strong>Acuícola Demo</strong>
              <span>Contratación · BackOffice</span>
            </div>
          </div>
          <NavDrawer
            open
            type="inline"
            selectedValue={nav.pantalla}
            onNavItemSelect={(_, d) => nav.ir(d.value as Pantalla)}
          >
            <NavDrawerBody>
              <NavSectionHeader>Operación</NavSectionHeader>
              <NavItem icon={<Tableroi />} value="tablero">
                Tablero de turnos
              </NavItem>
              <NavItem icon={<Expedientei />} value="expediente">
                Expedientes
              </NavItem>
              <NavItem icon={<Puestoi />} value="puesto">
                Puesto de atención
              </NavItem>
            </NavDrawerBody>
          </NavDrawer>
          <div className="lateral-pie">Prototipo · datos sintéticos</div>
        </aside>
        </FluentProvider>
        <div className="principal">
          <Barra onAbrir={nav.abrirExpediente} />
          <main className="contenido">
            {nav.pantalla === 'tablero' && <Tablero toaster={toaster} onAbrir={nav.abrirExpediente} />}
            {nav.pantalla === 'expediente' && <Expediente personaId={nav.personaId} />}
            {nav.pantalla === 'puesto' && <Puesto toaster={toaster} onAbrir={nav.abrirExpediente} />}
          </main>
        </div>
      </div>
    </FluentProvider>
  );
}

function Barra({ onAbrir }: { onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const [texto, setTexto] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const resultados = buscarPersonas(estado, texto);
  const enfocar = useCallback(() => ref.current?.focus(), []);
  useAtajo('/', enfocar);
  useEffect(() => setTexto(''), [estado.empresaId]);

  return (
    <header className="barra">
      <Combobox
        ref={ref}
        className="buscador"
        freeform
        aria-label="Buscar persona por cédula o nombre"
        placeholder="Buscar por cédula o nombre   ( / )"
        value={texto}
        expandIcon={<Search20Regular />}
        onChange={(e) => setTexto(e.target.value)}
        onOptionSelect={(_, d) => {
          if (d.optionValue) onAbrir(d.optionValue);
          setTexto('');
        }}
      >
        {resultados.map((p) => (
          <Option key={p.id} value={p.id} text={nombreCompleto(p)}>
            <div>
              <div style={{ fontWeight: 600 }}>{nombreCompleto(p)}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {formatoCedula(p.cedula)} · {p.cargo}
              </div>
            </div>
          </Option>
        ))}
        {texto.length >= 2 && resultados.length === 0 && (
          <Option disabled value="" text="">
            Sin coincidencias para «{texto}»
          </Option>
        )}
      </Combobox>
      <span className="espaciador" />
      <Dropdown
        aria-label="Empresa"
        value={EMPRESAS.find((e) => e.id === estado.empresaId)?.nombre}
        selectedOptions={[estado.empresaId]}
        onOptionSelect={(_, d) => acciones.cambiarEmpresa(d.optionValue as EmpresaId)}
        style={{ minWidth: 280 }}
      >
        {EMPRESAS.map((e) => (
          <Option key={e.id} value={e.id}>
            {e.nombre}
          </Option>
        ))}
      </Dropdown>
      <Tooltip content="Notificaciones" relationship="label">
        <Button appearance="subtle" icon={<Alert20Regular />} />
      </Tooltip>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button appearance="transparent" className="usuario" aria-label="Menú de usuario">
            <Avatar name={USUARIO.nombre} initials={USUARIO.iniciales} color="brand" size={32} />
            <span style={{ textAlign: 'left' }}>
              {USUARIO.nombre}
              <small>{USUARIO.rol}</small>
            </span>
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList
            checkedValues={{ demo: estado.simularFalla ? ['falla'] : [] }}
            onCheckedValueChange={() => acciones.alternarFalla()}
          >
            <MenuItemCheckbox name="demo" value="falla">
              Simular falla de conexión
            </MenuItemCheckbox>
            <MenuItem disabled>Cerrar sesión</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      {estado.simularFalla && (
        <Badge color="danger" appearance="tint">
          Sin conexión
        </Badge>
      )}
    </header>
  );
}
