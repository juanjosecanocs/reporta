import { useEffect, useRef } from 'react';
import { Map as MaplibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const ESTILO_MAPA = 'https://tiles.openfreemap.org/styles/liberty';

interface Props {
  latitud: number;
  longitud: number;
  onCambiar: (coords: { latitud: number; longitud: number }) => void;
}

export function MapaSeleccionUbicacion({ latitud, longitud, onCambiar }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MaplibreMap | null>(null);

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    const mapa = new MaplibreMap({
      container: contenedorRef.current,
      style: ESTILO_MAPA,
      center: [longitud, latitud],
      zoom: 16,
    });
    mapaRef.current = mapa;

    const marcador = new Marker({ draggable: true, color: '#F7931E' })
      .setLngLat([longitud, latitud])
      .addTo(mapa);

    marcador.on('dragend', () => {
      const { lat, lng } = marcador.getLngLat();
      onCambiar({ latitud: lat, longitud: lng });
    });

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
    // El mapa y el marcador se crean una sola vez con la posición inicial;
    // los ajustes posteriores los gestiona el propio marcador arrastrable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div ref={contenedorRef} className="h-56 w-full overflow-hidden rounded-lg border border-gray-200" />
      <p className="text-xs text-gray-500">Arrastra el marcador para ajustar la ubicación exacta</p>
    </div>
  );
}
