import { useEffect, useRef, useState } from 'react';
import { Map as MaplibreMap, NavigationControl, Popup, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTipos } from '../../hooks/useTipos';
import { useIncidencias } from '../../hooks/useIncidencias';
import { useMunicipioActual } from '../../context/MunicipioContext';

// OpenFreeMap: tiles vectoriales gratuitos, sin API key ni cuenta.
// https://openfreemap.org
const ESTILO_MAPA = 'https://tiles.openfreemap.org/styles/liberty';

const FUENTE_INCIDENCIAS = 'incidencias';
const CAPA_CLUSTERS = 'clusters';
const CAPA_CLUSTER_CONTEO = 'cluster-count';
const CAPA_PUNTO = 'punto-incidencia';

function escapeHtml(texto: string): string {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

export function MapaIncidencias() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MaplibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [mapaListo, setMapaListo] = useState(false);

  const { tipos } = useTipos();
  const { incidencias } = useIncidencias();
  const { municipio } = useMunicipioActual();

  // Crea el mapa una sola vez y registra las capas de clustering en cuanto
  // el estilo termina de cargar (no se pueden añadir fuentes/capas antes).
  // No arranca hasta tener el municipio resuelto: su centro/zoom son los del
  // municipio actual, no un valor fijo de Almería como antes.
  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current || !municipio) return;

    const mapa = new MaplibreMap({
      container: contenedorRef.current,
      style: ESTILO_MAPA,
      center: [municipio.centro_lng, municipio.centro_lat],
      zoom: municipio.zoom_inicial,
    });
    mapaRef.current = mapa;
    mapa.addControl(new NavigationControl(), 'top-right');

    mapa.on('load', () => {
      mapa.addSource(FUENTE_INCIDENCIAS, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 16,
      });

      // Círculo agregado: aparece mientras el zoom no permite distinguir
      // incidencias individuales y muestra el total de la zona.
      mapa.addLayer({
        id: CAPA_CLUSTERS,
        type: 'circle',
        source: FUENTE_INCIDENCIAS,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#043F63',
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 50, 26],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      mapa.addLayer({
        id: CAPA_CLUSTER_CONTEO,
        type: 'symbol',
        source: FUENTE_INCIDENCIAS,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Punto individual: solo visible cuando el zoom ya separa la
      // incidencia del resto del cluster.
      mapa.addLayer({
        id: CAPA_PUNTO,
        type: 'circle',
        source: FUENTE_INCIDENCIAS,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      mapa.on('click', CAPA_CLUSTERS, async (e) => {
        const feature = mapa.queryRenderedFeatures(e.point, { layers: [CAPA_CLUSTERS] })[0];
        const clusterId = feature?.properties?.cluster_id;
        if (clusterId === undefined || feature.geometry.type !== 'Point') return;

        const fuente = mapa.getSource(FUENTE_INCIDENCIAS) as GeoJSONSource;
        const zoom = await fuente.getClusterExpansionZoom(clusterId);
        mapa.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
      });

      mapa.on('click', CAPA_PUNTO, (e) => {
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;
        const props = feature.properties as Record<string, string>;

        popupRef.current?.remove();
        popupRef.current = new Popup({ offset: 14 })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(`
            <div style="font-family: sans-serif; font-size: 13px; min-width: 160px;">
              <strong>${escapeHtml(props.tipoNombre)}</strong><br/>
              ${escapeHtml(props.subtipoNombre)}<br/>
              <span style="color: #666;">${escapeHtml(props.fecha)} · ${escapeHtml(props.estado)}</span>
            </div>
          `)
          .addTo(mapa);
      });

      for (const capa of [CAPA_CLUSTERS, CAPA_PUNTO]) {
        mapa.on('mouseenter', capa, () => {
          mapa.getCanvas().style.cursor = 'pointer';
        });
        mapa.on('mouseleave', capa, () => {
          mapa.getCanvas().style.cursor = '';
        });
      }

      setMapaListo(true);
    });

    return () => {
      mapa.remove();
      mapaRef.current = null;
      setMapaListo(false);
    };
  }, [municipio]);

  // Actualiza los datos de la fuente cada vez que cambian las incidencias o
  // los tipos (para el color). MapLibre reagrupa los clusters solo.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !mapaListo || tipos.length === 0) return;

    const tiposPorId = new Map(tipos.map((tipo) => [tipo.id, tipo]));

    const fuente = mapa.getSource(FUENTE_INCIDENCIAS) as GeoJSONSource | undefined;
    fuente?.setData({
      type: 'FeatureCollection',
      features: incidencias.map((incidencia) => {
        const tipo = tiposPorId.get(incidencia.tipo_id);
        const subtipo = tipo?.subtipos?.find((s) => s.id === incidencia.subtipo_id);
        const fecha = new Date(incidencia.created_at).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [incidencia.longitud, incidencia.latitud] },
          properties: {
            id: incidencia.id,
            color: tipo?.color_primario ?? '#043F63',
            tipoNombre: tipo?.nombre ?? incidencia.tipo_id,
            subtipoNombre: subtipo?.nombre ?? incidencia.subtipo_id,
            estado: incidencia.estado,
            fecha,
          },
        };
      }),
    });
  }, [incidencias, tipos, mapaListo]);

  return <div ref={contenedorRef} className="h-full w-full" />;
}
