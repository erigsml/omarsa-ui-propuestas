import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Divider,
  Field,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Radio,
  RadioGroup,
  SplitButton,
  Textarea,
  type MenuButtonProps,
} from '@fluentui/react-components';
import {
  ArrowSwap20Regular,
  Checkmark20Regular,
  Megaphone20Regular,
  PeopleQueue24Regular,
  PersonArrowBack20Regular,
  PersonCall24Regular,
  Speaker220Regular,
  Warning20Regular,
} from '@fluentui/react-icons';
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
import { useCallback, useState } from 'react';
import { ConCarga, useAvisos } from '../comunes';
import { DialogoTransferir } from './Tablero';

export function Puesto({ toaster, onAbrir }: { toaster: string; onAbrir: (id: string) => void }) {
  const estado = useEstado();
  const carga = useCarga(`puesto-${estado.empresaId}`, 500);
  const avisar = useAvisos(toaster);
  const cola = colaDelPuesto(estado);
  const [transferir, setTransferir] = useState<TurnoVista | null>(null);

  const llamar = useCallback(
    (n: number) => {
      const nombres = acciones.llamar(n);
      if (nombres.length) avisar(n > 1 ? `Llamaste a ${nombres.length} personas` : 'Llamado en pantalla', nombres.join(', '), 'info');
    },
    [avisar],
  );
  const llamarUno = useCallback(() => {
    if (!cola.enAtencion) llamar(1);
  }, [cola.enAtencion, llamar]);
  useAtajo('l', llamarUno);

  const primero = cola.llamados[0];
  const est = estacion(estado.puesto.estacion);
  const promedioAtencion = 6;

  return (
    <ConCarga estado={carga.estado} reintentar={carga.reintentar}>
      <div className="cabecera-pagina">
        <div>
          <h1>Puesto de atención</h1>
          <p>
            {est.nombre} · Puesto {estado.puesto.id} · {estado.puesto.operador} · Jornada matutina
          </p>
        </div>
      </div>
      <div className="estado-puesto" role="status">
        <Badge appearance="filled" color="success">
          Operativo
        </Badge>
        <span>
          En espera <b>{cola.espera.length}</b>
        </span>
        <span>
          Llamados <b>{cola.llamados.length}</b>
        </span>
        <span>
          Atención promedio <b>{promedioAtencion} min</b>
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--colorNeutralForeground3)' }}>Atajo: L llama al siguiente</span>
      </div>

      <div className="puesto">
        <section className="tarjeta" aria-live="polite">
          {cola.enAtencion ? (
            <Atencion t={cola.enAtencion} onTransferir={setTransferir} onAbrir={onAbrir} avisar={avisar} />
          ) : primero ? (
            <div className="llamada">
              <Badge appearance="tint" color="warning" icon={<Megaphone20Regular />}>
                Llamado en la TV · {primero.llamadas} {primero.llamadas === 1 ? 'vez' : 'veces'}
              </Badge>
              <div style={{ marginTop: 20 }}>
                <Avatar size={96} name={primero.nombre} color="colorful" />
              </div>
              <div className="nombre">{primero.nombre}</div>
              <div style={{ color: 'var(--colorNeutralForeground3)', marginBottom: 12 }}>
                {primero.cedula} · {primero.cargo} · {primero.proceso}
                {primero.reingreso && ' · Reingreso'}
              </div>
              <span className="codigo">{primero.codigo}</span>
              <div className="acciones">
                <Button appearance="primary" size="large" icon={<Checkmark20Regular />} onClick={() => acciones.atender(primero.id)} style={{ minWidth: 200, height: 48 }}>
                  Atender
                </Button>
                <Button size="large" icon={<Speaker220Regular />} onClick={() => avisar('Volviste a llamar', acciones.rellamar(primero.id), 'info')} style={{ height: 48 }}>
                  Re-llamar
                </Button>
                <Button size="large" icon={<ArrowSwap20Regular />} onClick={() => setTransferir(primero)} style={{ height: 48 }}>
                  Transferir
                </Button>
                <Button size="large" appearance="subtle" icon={<PersonArrowBack20Regular />} onClick={() => avisar('Vuelve a la cola', `${acciones.devolverACola(primero.id)} no se presentó.`, 'warning')} style={{ height: 48 }}>
                  No se presentó
                </Button>
              </div>
            </div>
          ) : cola.espera.length ? (
            <div className="vacio">
              <PersonCall24Regular />
              <strong>Listo para atender</strong>
              Hay {cola.espera.length} personas esperando. Llama a la siguiente.
            </div>
          ) : (
            <div className="vacio">
              <PeopleQueue24Regular />
              <strong>No hay nadie en espera</strong>
              Cuando alguien termine en el kiosco o en otra estación, aparecerá en tu cola.
            </div>
          )}
        </section>

        <aside className="tarjeta" aria-label="Cola de espera">
          <Menu positioning="below-end">
            <MenuTrigger disableButtonEnhancement>
              {(disparador: MenuButtonProps) => (
                <SplitButton
                  appearance="primary"
                  className="boton-grande"
                  disabled={!!cola.enAtencion || cola.espera.length === 0}
                  menuButton={{ ...disparador, 'aria-label': 'Llamar a varias personas' }}
                  primaryActionButton={{ onClick: () => llamar(1), 'aria-keyshortcuts': 'L', style: { flex: 1, height: 56, fontSize: 18 } }}
                  style={{ width: '100%' }}
                  icon={<PersonCall24Regular />}
                >
                  Llamar siguiente
                </SplitButton>
              )}
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={() => llamar(2)}>Llamar a 2 personas</MenuItem>
                <MenuItem onClick={() => llamar(3)}>Llamar a 3 personas</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          {cola.enAtencion && <p className="sub" style={{ marginTop: 8 }}>Termina la atención actual para llamar a otra persona.</p>}

          {cola.llamados.length > 1 && (
            <>
              <h2 style={{ marginTop: 20 }}>Llamados ({cola.llamados.length})</h2>
              {cola.llamados.slice(1).map((t) => (
                <div className="cola-item" key={t.id}>
                  <span className="cod">{t.codigo}</span>
                  <span>
                    {t.nombre}
                    <br />
                    <small>Llamado {t.llamadas} {t.llamadas === 1 ? 'vez' : 'veces'}</small>
                  </span>
                  <Button size="small" icon={<Speaker220Regular />} onClick={() => avisar('Volviste a llamar', acciones.rellamar(t.id), 'info')}>
                    Re-llamar
                  </Button>
                </div>
              ))}
            </>
          )}

          <h2 style={{ marginTop: 20 }}>En espera ({cola.espera.length})</h2>
          <p className="sub">Por orden de llegada a {est.nombre}</p>
          {cola.espera.length === 0 && <div className="vacio" style={{ padding: 24 }}>No hay nadie en espera</div>}
          {cola.espera.map((t, i) => (
            <div className="cola-item" key={t.id}>
              <span className="cod">{t.codigo}</span>
              <span>
                {t.nombre}
                <br />
                <small>
                  {i === 0 ? 'Siguiente · ' : ''}
                  {t.cargo}
                </small>
              </span>
              <span className="num" style={{ color: t.excedido ? '#9E2806' : undefined, fontWeight: t.excedido ? 600 : 400 }}>
                {t.excedido && <Warning20Regular aria-label="Excedido" style={{ verticalAlign: 'middle' }} />} {duracion(t.esperaMin)}
              </span>
            </div>
          ))}
        </aside>
      </div>

      <DialogoTransferir
        turno={transferir}
        onCerrar={() => setTransferir(null)}
        onConfirmar={(destino, motivo) => {
          if (!transferir) return;
          avisar('Turno transferido', acciones.transferir(transferir.id, destino, motivo));
          setTransferir(null);
        }}
      />
    </ConCarga>
  );
}

function Atencion({
  t,
  onTransferir,
  onAbrir,
  avisar,
}: {
  t: TurnoVista;
  onTransferir: (t: TurnoVista) => void;
  onAbrir: (id: string) => void;
  avisar: ReturnType<typeof useAvisos>;
}) {
  const estado = useEstado();
  const p = buscarPersona(estado, t.personaId);
  const destino = p ? siguienteEstacion(p, t.estacion) : undefined;
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
    avisar(aprobar ? 'Atención finalizada' : 'Novedad registrada', msg, aprobar ? 'success' : 'warning');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Avatar size={56} name={t.nombre} initials={p ? iniciales(p) : ''} color="colorful" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 650 }}>{t.nombre}</div>
          <div style={{ color: 'var(--colorNeutralForeground3)' }}>
            {t.codigo} · {t.cedula} · {t.cargo}
          </div>
        </div>
        <Badge appearance="filled" color="success">
          En atención
        </Badge>
        <Button appearance="subtle" onClick={() => onAbrir(t.personaId)}>
          Ver expediente
        </Button>
      </div>
      <Divider style={{ margin: '20px 0' }} />
      <form
        className="form-seg"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          enviar(true);
        }}
      >
        <Field required validationMessage={errores.consentimiento} validationState={errores.consentimiento ? 'error' : 'none'}>
          <Checkbox
            label="La persona firmó la autorización de pruebas de seguridad"
            checked={v.consentimiento}
            onChange={(_, d) => actualizar({ consentimiento: !!d.checked })}
          />
        </Field>
        <Field label="Prueba de drogas" required validationMessage={errores.drogas}>
          <RadioGroup layout="horizontal" value={v.drogas} onChange={(_, d) => actualizar({ drogas: d.value as FormularioSeguridad['drogas'] })}>
            <Radio value="no_reactivo" label="No reactivo" />
            <Radio value="reactivo" label="Reactivo" />
          </RadioGroup>
        </Field>
        <Field label="Tatuajes por zona" hint="Marca solo las zonas con tatuajes visibles">
          <div style={{ display: 'flex', gap: 16 }}>
            {ZONAS_TATUAJE.map((z) => (
              <Checkbox
                key={z}
                label={z}
                checked={v.tatuajes.includes(z)}
                onChange={(_, d) => actualizar({ tatuajes: d.checked ? [...v.tatuajes, z] : v.tatuajes.filter((x) => x !== z) })}
              />
            ))}
          </div>
        </Field>
        <Field label="Observaciones para la auditoría" required validationMessage={errores.observaciones} hint="Quedan en la traza del expediente">
          <Textarea value={v.observaciones} onChange={(_, d) => actualizar({ observaciones: d.value })} resize="vertical" rows={3} />
        </Field>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button appearance="subtle" icon={<ArrowSwap20Regular />} onClick={() => onTransferir(t)}>
            Transferir a otro módulo
          </Button>
          <Button icon={<Warning20Regular />} onClick={() => enviar(false)}>
            Registrar novedad
          </Button>
          <Button appearance="primary" type="submit" icon={<Checkmark20Regular />}>
            Aprobar: pasar a {destino ? estacion(destino).nombre : 'fin'}
          </Button>
        </div>
      </form>
    </div>
  );
}
