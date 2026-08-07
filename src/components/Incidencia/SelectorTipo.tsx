import { useTipos } from '../../hooks/useTipos';
import { TIPO_ICONOS, ICONO_POR_DEFECTO } from '../../data/iconos';
import type { Tipo } from '../../types';

interface Props {
  onSeleccionar: (tipo: Tipo) => void;
}

export function SelectorTipo({ onSeleccionar }: Props) {
  const { tipos, cargando, error } = useTipos();

  if (cargando) return <p className="p-4 text-center text-sm text-gray-500">Cargando tipos…</p>;
  if (error) return <p className="p-4 text-center text-sm text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
      {tipos.map((tipo) => (
        <button
          key={tipo.id}
          type="button"
          onClick={() => onSeleccionar(tipo)}
          className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center transition hover:shadow-md"
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: tipo.color_primario }}
          >
            {TIPO_ICONOS[tipo.id] ?? ICONO_POR_DEFECTO}
          </span>
          <span className="text-sm font-medium text-gray-800">{tipo.nombre}</span>
        </button>
      ))}
    </div>
  );
}
