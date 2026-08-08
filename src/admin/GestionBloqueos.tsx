import { useEffect, useState } from 'react';
import { listarBloqueos, desbloquear, type BloqueoConDetalle } from '../services/bloqueosService';
import { useAdminAuth } from '../hooks/useAdminAuth';

export function GestionBloqueos() {
  const { esSuperAdmin } = useAdminAuth();
  const [bloqueos, setBloqueos] = useState<BloqueoConDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setBloqueos(await listarBloqueos());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando los bloqueos');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function alDesbloquear(id: string) {
    setError(null);
    try {
      await desbloquear(id);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desbloqueando');
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h2 className="mb-1 text-lg font-semibold text-gray-800">Usuarios bloqueados</h2>
      <p className="mb-4 text-sm text-gray-500">
        {esSuperAdmin
          ? 'Todos los bloqueos: por municipio y globales.'
          : 'Bloqueos de tu municipio, más los bloqueos globales (afectan a cualquier municipio).'}
      </p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {cargando ? (
        <p className="text-sm text-gray-500">Cargando…</p>
      ) : bloqueos.length === 0 ? (
        <p className="text-sm text-gray-500">No hay usuarios bloqueados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {bloqueos.map((b) => {
            const activo = !b.desbloqueado_at;
            return (
              <div
                key={b.id}
                className={`flex flex-wrap items-start gap-3 rounded-lg border px-3 py-2 ${
                  activo ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50 opacity-70'
                }`}
              >
                <div className="min-w-[220px] flex-1">
                  <p className="text-sm font-medium text-gray-800">{b.emailUsuario ?? b.usuario_id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(b.created_at).toLocaleString('es-ES')} · {b.municipio_id ? 'Municipio' : 'Global'}
                    {b.codigoIncidencia && ` · Incidencia ${b.codigoIncidencia}`}
                    {b.emailAdmin && ` · Bloqueado por ${b.emailAdmin}`}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">Motivo: {b.motivo}</p>
                  {!activo && (
                    <p className="mt-1 text-xs text-gray-500">
                      Desbloqueado el {new Date(b.desbloqueado_at!).toLocaleString('es-ES')}
                    </p>
                  )}
                </div>
                {activo && (
                  <button
                    type="button"
                    onClick={() => alDesbloquear(b.id)}
                    className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary"
                  >
                    Desbloquear
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
