import { useTipos } from '../../hooks/useTipos';
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
          style={{ borderColor: tipo.color_primario }}
        >
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tipo.color_primario }} />
          <span className="text-sm font-medium text-gray-800">{tipo.nombre}</span>
        </button>
      ))}
    </div>
  );
}
