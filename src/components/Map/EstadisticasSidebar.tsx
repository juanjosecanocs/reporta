import { useState } from 'react';

export function EstadisticasSidebar() {
  const [abierto, setAbierto] = useState(false);

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
          <p>Total incidencias: —</p>
          <p>Resueltas este mes: —</p>
          <p>Tiempo medio resolución: —</p>
        </div>
      )}
    </div>
  );
}
