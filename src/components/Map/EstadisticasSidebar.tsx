import { useState } from 'react';
import { useEstadisticas, formatearHoras } from '../../hooks/useEstadisticas';

export function EstadisticasSidebar() {
  const [abierto, setAbierto] = useState(false);
  const { total, resueltasEsteMes, tiempoMedioResolucionHoras, cargando } = useEstadisticas();

  return (
    <div className="absolute bottom-4 left-4 z-10 w-64 rounded-lg bg-white shadow-lg">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-primary"
      >
        Estadísticas
        <span className={`transition-transform ${abierto ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {abierto && (
        <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
          {cargando ? (
            <p>Cargando…</p>
          ) : (
            <>
              <p>Total incidencias: {total ?? '—'}</p>
              <p>Resueltas este mes: {resueltasEsteMes ?? '—'}</p>
              <p>
                Tiempo medio resolución:{' '}
                {tiempoMedioResolucionHoras !== null ? formatearHoras(tiempoMedioResolucionHoras) : '—'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
