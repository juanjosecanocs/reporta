import { useTipos } from '../../hooks/useTipos';
import { useMunicipioActual } from '../../context/MunicipioContext';
import { TIPO_ICONOS, ICONO_POR_DEFECTO } from '../../data/iconos';
import type { Tipo } from '../../types';

interface Props {
  onSeleccionar: (tipo: Tipo) => void;
  onVolver: () => void;
}

export function SelectorTipo({ onSeleccionar, onVolver }: Props) {
  const { municipio } = useMunicipioActual();
  const { tipos, cargando, error } = useTipos(municipio?.id);

  return (
    <div className="p-4">
      <button type="button" onClick={onVolver} className="mb-3 text-sm text-primary">
        ← Volver
      </button>

      {cargando && <p className="p-4 text-center text-sm text-gray-500">Cargando tipos…</p>}
      {error && <p className="p-4 text-center text-sm text-red-500">{error}</p>}

      {!cargando && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tipos.map((tipo) => (
            <button
              key={tipo.id}
              type="button"
              onClick={() => onSeleccionar(tipo)}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center transition hover:shadow-md"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border-4 bg-white text-2xl"
                style={{ borderColor: tipo.color_primario }}
              >
                {tipo.icono_name ?? TIPO_ICONOS[tipo.id] ?? ICONO_POR_DEFECTO}
              </span>
              <span className="text-sm font-medium text-gray-800">{tipo.nombre}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
