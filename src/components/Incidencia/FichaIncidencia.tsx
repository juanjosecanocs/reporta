import type { ReactNode } from 'react';
import { MapaSeleccionUbicacion } from './MapaSeleccionUbicacion';
import { SUBTIPO_ICONOS, TIPO_ICONOS, ICONO_POR_DEFECTO } from '../../data/iconos';
import type { Tipo, Subtipo } from '../../types';

interface Props {
  tipo?: Tipo;
  subtipo?: Subtipo;
  latitud: number;
  longitud: number;
  imagenUrl?: string | null;
  arrastrable?: boolean;
  onCambiarUbicacion?: (coords: { latitud: number; longitud: number }) => void;
  comentario?: string | null;
  onComentarioChange?: (valor: string) => void;
  cabeceraExtra?: ReactNode;
}

/**
 * Ficha resumen de una incidencia: tipo/subtipo, foto, mapa y comentario.
 * Se usa tanto en la revisión previa al envío (ciudadano, mapa arrastrable,
 * comentario editable) como en el panel de administración (solo lectura).
 */
export function FichaIncidencia({
  tipo,
  subtipo,
  latitud,
  longitud,
  imagenUrl,
  arrastrable = false,
  onCambiarUbicacion,
  comentario,
  onComentarioChange,
  cabeceraExtra,
}: Props) {
  const icono = (subtipo && SUBTIPO_ICONOS[subtipo.id]) ?? (tipo && TIPO_ICONOS[tipo.id]) ?? ICONO_POR_DEFECTO;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] bg-white text-xl"
          style={{ borderColor: tipo?.color_primario ?? '#043F63' }}
        >
          {icono}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">{tipo?.nombre ?? '—'}</p>
          <p className="truncate text-xs text-gray-500">{subtipo?.nombre ?? '—'}</p>
        </div>
        {cabeceraExtra}
      </div>

      {imagenUrl && (
        <img src={imagenUrl} alt="Foto de la incidencia" className="max-h-64 w-full rounded-lg object-cover" />
      )}

      <MapaSeleccionUbicacion
        latitud={latitud}
        longitud={longitud}
        arrastrable={arrastrable}
        onCambiar={onCambiarUbicacion}
      />

      {onComentarioChange ? (
        <textarea
          value={comentario ?? ''}
          onChange={(e) => onComentarioChange(e.target.value)}
          placeholder="Descripción opcional"
          className="rounded-lg border border-gray-300 p-2 text-sm"
          rows={3}
        />
      ) : comentario ? (
        <p className="rounded-lg bg-gray-50 p-2 text-sm text-gray-700">{comentario}</p>
      ) : (
        <p className="text-xs italic text-gray-400">Sin descripción</p>
      )}
    </div>
  );
}
