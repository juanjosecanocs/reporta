import { useEffect, useRef } from 'react';
import { Map as MaplibreMap, Marker, NavigationControl, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTipos } from '../../hooks/useTipos';
import { useIncidencias } from '../../hooks/useIncidencias';

const ALMERIA_CENTRO: [number, number] = [-2.4637, 36.8381];

// OpenFreeMap: tiles vectoriales gratuitos, sin API key ni cuenta.
// https://openfreemap.org
const ESTILO_MAPA = 'https://tiles.openfreemap.org/styles/liberty';

function escapeHtml(texto: string): string {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

export function MapaIncidencias() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MaplibreMap | null>(null);
  const marcadoresRef = useRef<Marker[]>([]);

  const { tipos } = useTipos();
  const { incidencias } = useIncidencias();

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    mapaRef.current = new MaplibreMap({
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

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || tipos.length === 0) return;

    marcadoresRef.current.forEach((marcador) => marcador.remove());
    marcadoresRef.current = [];

    const tiposPorId = new Map(tipos.map((tipo) => [tipo.id, tipo]));

    for (const incidencia of incidencias) {
      const tipo = tiposPorId.get(incidencia.tipo_id);
      const subtipo = tipo?.subtipos?.find((s) => s.id === incidencia.subtipo_id);
      const color = tipo?.color_primario ?? '#043F63';

      const el = document.createElement('div');
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.4)';
      el.style.cursor = 'pointer';

      const fecha = new Date(incidencia.created_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const popup = new Popup({ offset: 14 }).setHTML(`
        <div style="font-family: sans-serif; font-size: 13px; min-width: 160px;">
          <strong>${escapeHtml(tipo?.nombre ?? incidencia.tipo_id)}</strong><br/>
          ${escapeHtml(subtipo?.nombre ?? incidencia.subtipo_id)}<br/>
          <span style="color: #666;">${fecha} · ${escapeHtml(incidencia.estado)}</span>
        </div>
      `);

      const marcador = new Marker({ element: el })
        .setLngLat([incidencia.longitud, incidencia.latitud])
        .setPopup(popup)
        .addTo(mapa);

      marcadoresRef.current.push(marcador);
    }
  }, [incidencias, tipos]);

  return <div ref={contenedorRef} className="h-full w-full" />;
}
