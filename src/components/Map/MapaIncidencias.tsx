import { useEffect, useRef } from 'react';
import { Map, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const ALMERIA_CENTRO: [number, number] = [-2.4637, 36.8381];

// OpenFreeMap: tiles vectoriales gratuitos, sin API key ni cuenta.
// https://openfreemap.org
const ESTILO_MAPA = 'https://tiles.openfreemap.org/styles/liberty';

export function MapaIncidencias() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    mapaRef.current = new Map({
      container: contenedorRef.current,
      style: ESTILO_MAPA,
      center: ALMERIA_CENTRO,
      zoom: 12,
    });
    mapaRef.current.addControl(new NavigationControl(), 'top-right');

    return () => {
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
  }, []);

  return <div ref={contenedorRef} className="h-full w-full" />;
}
