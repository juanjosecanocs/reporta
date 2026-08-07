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
              className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 transition hover:border-secondary hover:bg-orange-50"
            >
              {subtipo.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
