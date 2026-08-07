import { SUBTIPO_ICONOS, ICONO_POR_DEFECTO } from '../../data/iconos';
import type { Subtipo, Tipo } from '../../types';

interface Props {
  tipo: Tipo;
  onSeleccionar: (subtipo: Subtipo) => void;
  onVolver: () => void;
}

export function SelectorSubtipo({ tipo, onSeleccionar, onVolver }: Props) {
  const subtipos = tipo.subtipos ?? [];

  return (
    <div className="p-4">
      <button type="button" onClick={onVolver} className="mb-3 text-sm text-primary">
        ← Volver
      </button>
      <h2 className="mb-3 text-lg font-semibold text-gray-800">{tipo.nombre}</h2>
      {subtipos.length === 0 ? (
        <p className="text-sm text-gray-500">No hay subtipos disponibles para este tipo.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {subtipos.map((subtipo) => (
            <button
              key={subtipo.id}
              type="button"
              onClick={() => onSeleccionar(subtipo)}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-800 transition hover:border-secondary hover:bg-orange-50"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] bg-white text-lg"
                style={{ borderColor: tipo.color_primario }}
              >
                {subtipo.icono_name ?? SUBTIPO_ICONOS[subtipo.id] ?? ICONO_POR_DEFECTO}
              </span>
              <span className="flex-1">{subtipo.nombre}</span>
              <span className="text-gray-400">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
