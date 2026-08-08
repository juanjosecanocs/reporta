import { useEffect, useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import {
  listarTiposAdmin,
  crearTipo,
  actualizarTipo,
  cambiarActivoTipo,
  eliminarTipoDefinitivo,
  reordenarTipo,
  crearSubtipo,
  actualizarSubtipo,
  cambiarActivoSubtipo,
  eliminarSubtipoDefinitivo,
  reordenarSubtipo,
  type DatosTipo,
  type DatosSubtipo,
} from '../services/tiposAdminService';
import { ICONO_POR_DEFECTO } from '../data/iconos';
import type { Tipo, Subtipo } from '../types';

const TIPO_VACIO: DatosTipo = { nombre: '', descripcion: '', icono_name: '', color_primario: '#043F63', color_secundario: '#0A5A8A' };
const SUBTIPO_VACIO: DatosSubtipo = { nombre: '', descripcion: '', icono_name: '', urgencia: 3 };

function FormularioTipo({
  inicial,
  onGuardar,
  onCancelar,
}: {
  inicial: DatosTipo;
  onGuardar: (datos: DatosTipo) => Promise<void>;
  onCancelar: () => void;
}) {
  const [datos, setDatos] = useState<DatosTipo>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    if (!datos.nombre.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={datos.nombre}
          onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
          placeholder="Nombre del tipo"
          className="min-w-[160px] flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          value={datos.icono_name ?? ''}
          onChange={(e) => setDatos({ ...datos, icono_name: e.target.value })}
          placeholder="Emoji"
          className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm"
        />
        <input
          type="color"
          value={datos.color_primario}
          onChange={(e) => setDatos({ ...datos, color_primario: e.target.value })}
          className="h-8 w-10 rounded border border-gray-300"
          title="Color primario"
        />
        <input
          type="color"
          value={datos.color_secundario ?? '#0A5A8A'}
          onChange={(e) => setDatos({ ...datos, color_secundario: e.target.value })}
          className="h-8 w-10 rounded border border-gray-300"
          title="Color secundario"
        />
      </div>
      <input
        value={datos.descripcion ?? ''}
        onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
        placeholder="Descripción (opcional)"
        className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || !datos.nombre.trim()}
          className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="text-xs text-gray-500 underline">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FormularioSubtipo({
  inicial,
  onGuardar,
  onCancelar,
}: {
  inicial: DatosSubtipo;
  onGuardar: (datos: DatosSubtipo) => Promise<void>;
  onCancelar: () => void;
}) {
  const [datos, setDatos] = useState<DatosSubtipo>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    if (!datos.nombre.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-secondary/30 bg-secondary/5 p-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={datos.nombre}
          onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
          placeholder="Nombre del subtipo"
          className="min-w-[160px] flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          value={datos.icono_name ?? ''}
          onChange={(e) => setDatos({ ...datos, icono_name: e.target.value })}
          placeholder="Emoji"
          className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm"
        />
        <select
          value={datos.urgencia}
          onChange={(e) => setDatos({ ...datos, urgencia: Number(e.target.value) })}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              Urgencia {n}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || !datos.nombre.trim()}
          className="rounded-lg bg-secondary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="text-xs text-gray-500 underline">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FilaSubtipo({
  subtipo,
  hermanos,
  esPrimero,
  esUltimo,
  esSuperAdmin,
  onCambio,
}: {
  subtipo: Subtipo;
  hermanos: Subtipo[];
  esPrimero: boolean;
  esUltimo: boolean;
  esSuperAdmin: boolean;
  onCambio: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accion(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
      onCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  if (editando) {
    return (
      <FormularioSubtipo
        inicial={{
          nombre: subtipo.nombre,
          descripcion: '',
          icono_name: subtipo.icono_name ?? '',
          urgencia: subtipo.urgencia,
        }}
        onGuardar={async (datos) => {
          await actualizarSubtipo(subtipo.id, datos);
          setEditando(false);
          onCambio();
        }}
        onCancelar={() => setEditando(false)}
      />
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 ${subtipo.activo ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-sm">
        {subtipo.icono_name ?? ICONO_POR_DEFECTO}
      </span>
      <span className="min-w-[140px] flex-1 text-sm text-gray-800">{subtipo.nombre}</span>
      <span className="text-xs text-gray-400">Urg. {subtipo.urgencia}</span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={esPrimero}
          onClick={() => accion(async () => reordenarSubtipo(hermanos, subtipo.id, 'subir'))}
          className="rounded border border-gray-300 px-1.5 py-0.5 text-xs disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={esUltimo}
          onClick={() => accion(async () => reordenarSubtipo(hermanos, subtipo.id, 'bajar'))}
          className="rounded border border-gray-300 px-1.5 py-0.5 text-xs disabled:opacity-30"
        >
          ↓
        </button>
      </div>

      {esSuperAdmin && (
        <button type="button" onClick={() => setEditando(true)} className="rounded border border-primary px-2 py-0.5 text-xs font-semibold text-primary">
          Editar
        </button>
      )}
      <button
        type="button"
        onClick={() => accion(async () => cambiarActivoSubtipo(subtipo.id, !subtipo.activo))}
        className="rounded border border-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-600"
      >
        {subtipo.activo ? 'Desactivar' : 'Activar'}
      </button>
      {esSuperAdmin && (
        <button
          type="button"
          onClick={() => accion(async () => eliminarSubtipoDefinitivo(subtipo.id))}
          className="rounded border border-red-400 px-2 py-0.5 text-xs font-semibold text-red-500"
        >
          Eliminar
        </button>
      )}
      {error && <p className="w-full text-xs text-red-500">{error}</p>}
    </div>
  );
}

function FilaTipo({
  tipo,
  esPrimero,
  esUltimo,
  todosTipos,
  esSuperAdmin,
  onCambio,
}: {
  tipo: Tipo;
  esPrimero: boolean;
  esUltimo: boolean;
  todosTipos: Tipo[];
  esSuperAdmin: boolean;
  onCambio: () => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const [editando, setEditando] = useState(false);
  const [creandoSubtipo, setCreandoSubtipo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtipos = [...(tipo.subtipos ?? [])].sort((a, b) => a.orden - b.orden);

  async function accion(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
      onCambio();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  }

  return (
    <div className={`rounded-lg border ${tipo.activo ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button type="button" onClick={() => setExpandido((v) => !v)} className="text-gray-400">
          {expandido ? '▾' : '▸'}
        </button>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] bg-white text-lg"
          style={{ borderColor: tipo.color_primario }}
        >
          {tipo.icono_name ?? ICONO_POR_DEFECTO}
        </span>
        <div className="min-w-[160px] flex-1">
          <p className="text-sm font-semibold text-gray-800">{tipo.nombre}</p>
          <p className="text-xs text-gray-400">{subtipos.length} subtipos · orden {tipo.orden}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={esPrimero}
            onClick={() => accion(async () => reordenarTipo(todosTipos, tipo.id, 'subir'))}
            className="rounded border border-gray-300 px-1.5 py-0.5 text-xs disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={esUltimo}
            onClick={() => accion(async () => reordenarTipo(todosTipos, tipo.id, 'bajar'))}
            className="rounded border border-gray-300 px-1.5 py-0.5 text-xs disabled:opacity-30"
          >
            ↓
          </button>
        </div>

        {esSuperAdmin && (
          <button type="button" onClick={() => setEditando((v) => !v)} className="rounded border border-primary px-2 py-1 text-xs font-semibold text-primary">
            Editar
          </button>
        )}
        <button
          type="button"
          onClick={() => accion(async () => cambiarActivoTipo(tipo.id, !tipo.activo))}
          className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600"
        >
          {tipo.activo ? 'Desactivar' : 'Activar'}
        </button>
        {esSuperAdmin && (
          <button
            type="button"
            onClick={() => accion(async () => eliminarTipoDefinitivo(tipo.id))}
            className="rounded border border-red-400 px-2 py-1 text-xs font-semibold text-red-500"
          >
            Eliminar
          </button>
        )}
      </div>

      {error && <p className="px-3 pb-2 text-xs text-red-500">{error}</p>}

      {editando && esSuperAdmin && (
        <div className="px-3 pb-3">
          <FormularioTipo
            inicial={{
              nombre: tipo.nombre,
              descripcion: tipo.descripcion ?? '',
              icono_name: tipo.icono_name ?? '',
              color_primario: tipo.color_primario,
              color_secundario: tipo.color_secundario ?? tipo.color_primario,
            }}
            onGuardar={async (datos) => {
              await actualizarTipo(tipo.id, datos);
              setEditando(false);
              onCambio();
            }}
            onCancelar={() => setEditando(false)}
          />
        </div>
      )}

      {expandido && (
        <div className="flex flex-col gap-1.5 border-t border-gray-100 p-3">
          {subtipos.length === 0 && !creandoSubtipo && (
            <p className="text-xs text-gray-400">Sin subtipos todavía.</p>
          )}
          {subtipos.map((s, i) => (
            <FilaSubtipo
              key={s.id}
              subtipo={s}
              hermanos={subtipos}
              esPrimero={i === 0}
              esUltimo={i === subtipos.length - 1}
              esSuperAdmin={esSuperAdmin}
              onCambio={onCambio}
            />
          ))}

          {esSuperAdmin &&
            (creandoSubtipo ? (
              <FormularioSubtipo
                inicial={SUBTIPO_VACIO}
                onGuardar={async (datos) => {
                  await crearSubtipo(tipo.id, datos);
                  setCreandoSubtipo(false);
                  onCambio();
                }}
                onCancelar={() => setCreandoSubtipo(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setCreandoSubtipo(true)}
                className="self-start rounded-lg border border-dashed border-secondary px-3 py-1 text-xs font-semibold text-secondary"
              >
                + Nuevo subtipo
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export function GestionTipos() {
  const { esSuperAdmin } = useAdminAuth();
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creandoTipo, setCreandoTipo] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setTipos(await listarTiposAdmin());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando tipos');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const tiposOrdenados = [...tipos].sort((a, b) => a.orden - b.orden);

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-1 text-lg font-semibold text-gray-800">Tipos y subtipos</h2>
      <p className="mb-4 text-sm text-gray-500">
        {esSuperAdmin
          ? 'Crea, edita, reordena o desactiva las categorías de incidencias. Los cambios se reflejan al momento en la app.'
          : 'Puedes activar, desactivar y reordenar tipos y subtipos. Crear, editar o eliminar categorías está reservado a un super-administrador, porque son compartidas por todos los municipios.'}
      </p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {cargando ? (
        <p className="text-sm text-gray-500">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tiposOrdenados.map((tipo, i) => (
            <FilaTipo
              key={tipo.id}
              tipo={tipo}
              esPrimero={i === 0}
              esUltimo={i === tiposOrdenados.length - 1}
              todosTipos={tiposOrdenados}
              esSuperAdmin={esSuperAdmin}
              onCambio={cargar}
            />
          ))}
        </div>
      )}

      {esSuperAdmin && (
        <div className="mt-4">
          {creandoTipo ? (
            <FormularioTipo
              inicial={TIPO_VACIO}
              onGuardar={async (datos) => {
                await crearTipo(datos);
                setCreandoTipo(false);
                cargar();
              }}
              onCancelar={() => setCreandoTipo(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCreandoTipo(true)}
              className="rounded-lg border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary"
            >
              + Nuevo tipo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
