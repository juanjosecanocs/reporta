import { useEffect, useState } from 'react';
import { useTipos } from '../hooks/useTipos';
import { useAdminAuth } from '../hooks/useAdminAuth';
import {
  listarIncidenciasAdmin,
  actualizarEstado,
  eliminarIncidencia,
  restaurarIncidencia,
  obtenerEmailUsuario,
  contarIncidenciasEliminadasDeUsuario,
  type FiltrosAdmin,
} from '../services/adminService';
import { listarMunicipiosActivos } from '../services/municipioService';
import { crearBloqueo } from '../services/bloqueosService';
import { SUBTIPO_ICONOS, TIPO_ICONOS, ICONO_POR_DEFECTO } from '../data/iconos';
import { mensajeDeError } from '../utils/errores';
import { FichaIncidencia } from '../components/Incidencia/FichaIncidencia';
import type { Incidencia, Municipio } from '../types';

const ESTADOS: Incidencia['estado'][] = ['pendiente', 'revisada', 'resuelto', 'rechazado'];

export function AdminDashboard() {
  const { tipos } = useTipos();
  const { esSuperAdmin, municipioId: municipioPropio } = useAdminAuth();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSubtipo, setFiltroSubtipo] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [incluirBorradas, setIncluirBorradas] = useState(false);

  const [eliminando, setEliminando] = useState<{ id: string; motivo: string } | null>(null);
  const [fichaAbierta, setFichaAbierta] = useState<Incidencia | null>(null);
  const [trazabilidad, setTrazabilidad] = useState<{ email: string | null; reincidencias: number } | null>(null);
  const [cargandoTrazabilidad, setCargandoTrazabilidad] = useState(false);
  const [bloqueando, setBloqueando] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  const [bloqueoGlobal, setBloqueoGlobal] = useState(false);
  const [bloqueoHecho, setBloqueoHecho] = useState(false);
  const [errorBloqueo, setErrorBloqueo] = useState<string | null>(null);

  const subtiposDelTipo = tipos.find((t) => t.id === filtroTipo)?.subtipos ?? [];
  const municipioPorId = new Map(municipios.map((m) => [m.id, m]));

  useEffect(() => {
    if (!esSuperAdmin) return;
    listarMunicipiosActivos()
      .then(setMunicipios)
      .catch(() => {
        /* el selector de municipio es una comodidad, no crítico si falla */
      });
  }, [esSuperAdmin]);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const filtros: FiltrosAdmin = {
        estado: filtroEstado || undefined,
        tipoId: filtroTipo || undefined,
        subtipoId: filtroSubtipo || undefined,
        municipioId: esSuperAdmin ? filtroMunicipio || undefined : (municipioPropio ?? undefined),
        incluirBorradas,
      };
      setIncidencias(await listarIncidenciasAdmin(filtros));
    } catch (err) {
      setError(mensajeDeError(err, 'Error cargando incidencias'));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroTipo, filtroSubtipo, filtroMunicipio, incluirBorradas]);

  // Trazabilidad de la ficha abierta: solo tiene sentido si la incidencia
  // viene de un usuario registrado y verificado (Fase 3); una anónima no
  // tiene a quién identificar.
  useEffect(() => {
    if (!fichaAbierta?.usuario_id) {
      setTrazabilidad(null);
      return;
    }
    let cancelado = false;
    setCargandoTrazabilidad(true);
    Promise.all([
      obtenerEmailUsuario(fichaAbierta.usuario_id),
      contarIncidenciasEliminadasDeUsuario(fichaAbierta.usuario_id, fichaAbierta.id),
    ])
      .then(([email, reincidencias]) => {
        if (cancelado) return;
        setTrazabilidad({ email, reincidencias });
      })
      .catch(() => {
        if (!cancelado) setTrazabilidad(null);
      })
      .finally(() => {
        if (!cancelado) setCargandoTrazabilidad(false);
      });
    return () => {
      cancelado = true;
    };
  }, [fichaAbierta?.id, fichaAbierta?.usuario_id]);

  useEffect(() => {
    setBloqueando(false);
    setMotivoBloqueo('');
    setBloqueoGlobal(false);
    setBloqueoHecho(false);
    setErrorBloqueo(null);
  }, [fichaAbierta?.id]);

  async function confirmarBloqueo() {
    if (!fichaAbierta?.usuario_id || !motivoBloqueo.trim()) return;
    setErrorBloqueo(null);
    try {
      await crearBloqueo({
        usuarioId: fichaAbierta.usuario_id,
        municipioId: esSuperAdmin && bloqueoGlobal ? null : fichaAbierta.municipio_id,
        motivo: motivoBloqueo.trim(),
        incidenciaId: fichaAbierta.id,
      });
      setBloqueando(false);
      setBloqueoHecho(true);
    } catch (err) {
      setErrorBloqueo(mensajeDeError(err, 'Error bloqueando al usuario'));
    }
  }

  async function cambiarEstado(id: string, estado: Incidencia['estado']) {
    setIncidencias((prev) => prev.map((i) => (i.id === id ? { ...i, estado } : i)));
    setFichaAbierta((prev) => (prev && prev.id === id ? { ...prev, estado } : prev));
    try {
      await actualizarEstado(id, estado);
    } catch (err) {
      setError(mensajeDeError(err, 'Error actualizando estado'));
      cargar();
    }
  }

  async function confirmarEliminar() {
    if (!eliminando) return;
    try {
      await eliminarIncidencia(eliminando.id, eliminando.motivo);
      setEliminando(null);
      setFichaAbierta(null);
      cargar();
    } catch (err) {
      setError(mensajeDeError(err, 'Error eliminando la incidencia'));
    }
  }

  async function restaurar(id: string) {
    try {
      await restaurarIncidencia(id);
      setFichaAbierta(null);
      cargar();
    } catch (err) {
      setError(mensajeDeError(err, 'Error restaurando la incidencia'));
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex flex-wrap gap-3">
        {esSuperAdmin && (
          <select
            value={filtroMunicipio}
            onChange={(e) => setFiltroMunicipio(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los municipios</option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        )}
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
          onChange={(e) => {
            setFiltroTipo(e.target.value);
            setFiltroSubtipo('');
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        <select
          value={filtroSubtipo}
          onChange={(e) => setFiltroSubtipo(e.target.value)}
          disabled={!filtroTipo}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value="">{filtroTipo ? 'Todos los subtipos' : 'Elige un tipo primero'}</option>
          {subtiposDelTipo.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
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
            const icono =
              subtipo?.icono_name ??
              SUBTIPO_ICONOS[inc.subtipo_id] ??
              tipo?.icono_name ??
              TIPO_ICONOS[inc.tipo_id] ??
              ICONO_POR_DEFECTO;
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
                    {esSuperAdmin && ` · ${municipioPorId.get(inc.municipio_id)?.nombre ?? inc.municipio_id}`}
                    {inc.usuario_id && (
                      <span className="ml-1 font-semibold text-emerald-700">
                        · ✓ {inc.nombre_reportante || 'verificada'}
                      </span>
                    )}
                  </p>
                  {inc.descripcion_corta && <p className="mt-1 text-xs text-gray-600">{inc.descripcion_corta}</p>}
                  {borrada && (
                    <p className="mt-1 text-xs font-semibold text-red-600">Eliminada: {inc.deleted_reason}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setFichaAbierta(inc)}
                  className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary"
                >
                  Ficha
                </button>

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

      {fichaAbierta && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setFichaAbierta(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{fichaAbierta.codigo_seguimiento}</p>
                <p className="text-xs text-gray-500">
                  {new Date(fichaAbierta.created_at).toLocaleString('es-ES')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFichaAbierta(null)}
                className="text-lg text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <FichaIncidencia
              tipo={tipos.find((t) => t.id === fichaAbierta.tipo_id)}
              subtipo={tipos
                .find((t) => t.id === fichaAbierta.tipo_id)
                ?.subtipos?.find((s) => s.id === fichaAbierta.subtipo_id)}
              latitud={fichaAbierta.latitud}
              longitud={fichaAbierta.longitud}
              imagenUrl={fichaAbierta.imagen_url}
              comentario={fichaAbierta.descripcion_corta}
            />

            {fichaAbierta.usuario_id && (
              <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                {cargandoTrazabilidad ? (
                  'Comprobando quién la reportó…'
                ) : (
                  <>
                    <p>
                      ✓ Reportada por {fichaAbierta.nombre_reportante || 'usuario verificado'}
                      {trazabilidad?.email ? ` (${trazabilidad.email})` : ''}
                    </p>
                    {!!trazabilidad?.reincidencias && (
                      <p className="mt-1 font-semibold text-red-700">
                        ⚠️ Este usuario tiene otras {trazabilidad.reincidencias} incidencia
                        {trazabilidad.reincidencias === 1 ? '' : 's'} eliminada
                        {trazabilidad.reincidencias === 1 ? '' : 's'}.
                      </p>
                    )}

                    {bloqueoHecho ? (
                      <p className="mt-2 font-semibold text-red-700">🚫 Usuario bloqueado.</p>
                    ) : bloqueando ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <input
                          autoFocus
                          value={motivoBloqueo}
                          onChange={(e) => setMotivoBloqueo(e.target.value)}
                          placeholder="Motivo del bloqueo"
                          className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-800"
                        />
                        {esSuperAdmin && (
                          <label className="flex items-center gap-2 text-xs text-gray-700">
                            <input
                              type="checkbox"
                              checked={bloqueoGlobal}
                              onChange={(e) => setBloqueoGlobal(e.target.checked)}
                            />
                            Bloqueo global (todos los municipios), no solo este
                          </label>
                        )}
                        {errorBloqueo && <p className="text-xs text-red-600">{errorBloqueo}</p>}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={confirmarBloqueo}
                            disabled={!motivoBloqueo.trim()}
                            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Confirmar bloqueo
                          </button>
                          <button
                            type="button"
                            onClick={() => setBloqueando(false)}
                            className="text-xs text-gray-500 underline"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBloqueando(true)}
                        className="mt-2 rounded-lg border border-red-400 px-2 py-1 text-xs font-semibold text-red-600"
                      >
                        Bloquear usuario
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {fichaAbierta.deleted_at && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                Eliminada: {fichaAbierta.deleted_reason}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2">
              <select
                value={fichaAbierta.estado}
                onChange={(e) => cambiarEstado(fichaAbierta.id, e.target.value as Incidencia['estado'])}
                disabled={!!fichaAbierta.deleted_at}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>

              {fichaAbierta.deleted_at ? (
                <button
                  type="button"
                  onClick={() => restaurar(fichaAbierta.id)}
                  className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary"
                >
                  Restaurar
                </button>
              ) : eliminando?.id === fichaAbierta.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    value={eliminando.motivo}
                    onChange={(e) => setEliminando({ id: fichaAbierta.id, motivo: e.target.value })}
                    placeholder="Motivo"
                    className="w-full min-w-0 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={confirmarEliminar}
                    disabled={!eliminando.motivo.trim()}
                    className="shrink-0 rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEliminando({ id: fichaAbierta.id, motivo: '' })}
                  className="rounded-lg border border-red-400 px-3 py-1 text-xs font-semibold text-red-500"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
