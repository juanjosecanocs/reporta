import { useEffect, useState } from 'react';
import { useTipos } from '../hooks/useTipos';
import {
  listarIncidenciasAdmin,
  actualizarEstado,
  eliminarIncidencia,
  restaurarIncidencia,
  type FiltrosAdmin,
} from '../services/adminService';
import { SUBTIPO_ICONOS, TIPO_ICONOS, ICONO_POR_DEFECTO } from '../data/iconos';
import type { Incidencia } from '../types';

const ESTADOS: Incidencia['estado'][] = ['pendiente', 'revisada', 'resuelto', 'rechazado'];

interface Props {
  onCerrarSesion: () => void;
}

export function AdminDashboard({ onCerrarSesion }: Props) {
  const { tipos } = useTipos();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [incluirBorradas, setIncluirBorradas] = useState(false);

  const [eliminando, setEliminando] = useState<{ id: string; motivo: string } | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const filtros: FiltrosAdmin = {
        estado: filtroEstado || undefined,
        tipoId: filtroTipo || undefined,
        incluirBorradas,
      };
      setIncidencias(await listarIncidenciasAdmin(filtros));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando incidencias');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroTipo, incluirBorradas]);

  async function cambiarEstado(id: string, estado: Incidencia['estado']) {
    setIncidencias((prev) => prev.map((i) => (i.id === id ? { ...i, estado } : i)));
    try {
      await actualizarEstado(id, estado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando estado');
      cargar();
    }
  }

  async function confirmarEliminar() {
    if (!eliminando) return;
    try {
      await eliminarIncidencia(eliminando.id, eliminando.motivo);
      setEliminando(null);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando la incidencia');
    }
  }

  async function restaurar(id: string) {
    try {
      await restaurarIncidencia(id);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error restaurando la incidencia');
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">REPORTA · Panel admin</h1>
        <button type="button" onClick={onCerrarSesion} className="text-sm text-gray-500 underline">
          Cerrar sesión
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={incluirBorradas}
            onChange={(e) => setIncluirBorradas(e.target.checked)}
          />
          Mostrar eliminadas
        </label>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {cargando ? (
        <p className="text-sm text-gray-500">Cargando…</p>
      ) : incidencias.length === 0 ? (
        <p className="text-sm text-gray-500">No hay incidencias con estos filtros.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {incidencias.map((inc) => {
            const tipo = tipos.find((t) => t.id === inc.tipo_id);
            const subtipo = tipo?.subtipos?.find((s) => s.id === inc.subtipo_id);
            const icono = SUBTIPO_ICONOS[inc.subtipo_id] ?? TIPO_ICONOS[inc.tipo_id] ?? ICONO_POR_DEFECTO;
            const borrada = !!inc.deleted_at;
            const enProcesoDeBorrar = eliminando?.id === inc.id;

            return (
              <div
                key={inc.id}
                className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 ${
                  borrada ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                {inc.imagen_url ? (
                  <img src={inc.imagen_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-[3px] bg-white text-xl"
                    style={{ borderColor: tipo?.color_primario ?? '#043F63' }}
                  >
                    {icono}
                  </span>
                )}

                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {tipo?.nombre ?? inc.tipo_id} · {subtipo?.nombre ?? inc.subtipo_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(inc.created_at).toLocaleString('es-ES')} · {inc.codigo_seguimiento} ·{' '}
                    {inc.latitud.toFixed(4)}, {inc.longitud.toFixed(4)}
                  </p>
                  {inc.descripcion_corta && <p className="mt-1 text-xs text-gray-600">{inc.descripcion_corta}</p>}
                  {borrada && (
                    <p className="mt-1 text-xs font-semibold text-red-600">Eliminada: {inc.deleted_reason}</p>
                  )}
                </div>

                <select
                  value={inc.estado}
                  onChange={(e) => cambiarEstado(inc.id, e.target.value as Incidencia['estado'])}
                  disabled={borrada}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>

                {borrada ? (
                  <button
                    type="button"
                    onClick={() => restaurar(inc.id)}
                    className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary"
                  >
                    Restaurar
                  </button>
                ) : enProcesoDeBorrar ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={eliminando.motivo}
                      onChange={(e) => setEliminando({ id: inc.id, motivo: e.target.value })}
                      placeholder="Motivo"
                      className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={confirmarEliminar}
                      disabled={!eliminando.motivo.trim()}
                      className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEliminando(null)}
                      className="text-xs text-gray-500 underline"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEliminando({ id: inc.id, motivo: '' })}
                    className="rounded-lg border border-red-400 px-3 py-1 text-xs font-semibold text-red-500"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
