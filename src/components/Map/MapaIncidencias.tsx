import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const ALMERIA_CENTRO: [number, number] = [-2.4637, 36.8381];
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export function MapaIncidencias() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !contenedorRef.current || mapaRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    mapaRef.current = new mapboxgl.Map({
      container: contenedorRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: ALMERIA_CENTRO,
      zoom: 12,
    });
    mapaRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-center text-sm text-gray-500">
        Configura VITE_MAPBOX_TOKEN en .env para ver el mapa
      </div>
    );
  }

  return <div ref={contenedorRef} className="h-full w-full" />;
}
