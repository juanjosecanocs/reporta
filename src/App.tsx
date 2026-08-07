import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { MapaIncidencias } from './components/Map/MapaIncidencias';
import { EstadisticasSidebar } from './components/Map/EstadisticasSidebar';
import { SelectorTipo } from './components/Incidencia/SelectorTipo';
import { SelectorSubtipo } from './components/Incidencia/SelectorSubtipo';
import { CameraCapture } from './components/Incidencia/CameraCapture';
import { useGeolocalizacion } from './hooks/useGeolocalizacion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useHistorialIncidencias } from './hooks/useLocalStorage';
import { crearIncidencia, adjuntarImagen } from './services/storageService';
import type { Tipo, Subtipo } from './types';

type Paso = 'mapa' | 'tipo' | 'subtipo' | 'foto' | 'revision' | 'enviado';

function useUuidCliente() {
  const [uuid] = useLocalStorage<string>('reporta_uuid_cliente', crypto.randomUUID());
  return uuid;
}

function App() {
  const [paso, setPaso] = useState<Paso>('mapa');
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [subtipo, setSubtipo] = useState<Subtipo | null>(null);
  const [foto, setFoto] = useState<Blob | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [codigoSeguimiento, setCodigoSeguimiento] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const uuidCliente = useUuidCliente();
  const { coordenadas, cargando: cargandoUbicacion, error: errorUbicacion, obtenerUbicacion } = useGeolocalizacion();
  const { agregar: agregarAlHistorial } = useHistorialIncidencias();

  function reiniciar() {
    setPaso('mapa');
    setTipo(null);
    setSubtipo(null);
    setFoto(null);
    setDescripcion('');
    setCodigoSeguimiento(null);
    setErrorEnvio(null);
  }

  function iniciarReporte() {
    setPaso('tipo');
    obtenerUbicacion();
  }

  async function enviarIncidencia() {
    if (!tipo || !subtipo || !coordenadas) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const incidencia = await crearIncidencia({
        tipo_id: tipo.id,
        subtipo_id: subtipo.id,
        latitud: coordenadas.latitud,
        longitud: coordenadas.longitud,
        descripcion_corta: descripcion || undefined,
        uuid_cliente: uuidCliente,
      });

      if (foto) {
        await adjuntarImagen(incidencia.id, foto, { originalSizeBytes: foto.size, comprimida: true });
      }

      agregarAlHistorial({
        codigo_seguimiento: incidencia.codigo_seguimiento,
        tipo_id: tipo.id,
        subtipo_id: subtipo.id,
        created_at: incidencia.created_at,
      });

      setCodigoSeguimiento(incidencia.codigo_seguimiento);
      setPaso('enviado');
    } catch (err) {
      setErrorEnvio(err instanceof Error ? err.message : 'Error enviando la incidencia');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex h-svh flex-col">
      <Header />

      <main className="relative flex-1">
        {paso === 'mapa' && (
          <>
            <MapaIncidencias />
            <EstadisticasSidebar />
            <button
              type="button"
              onClick={iniciarReporte}
              className="absolute bottom-6 right-6 z-10 rounded-full bg-secondary px-6 py-4 font-bold text-white shadow-lg transition hover:brightness-95"
            >
              REPORTA INCIDENCIA
            </button>
          </>
        )}

        {paso === 'tipo' && (
          <SelectorTipo
            onSeleccionar={(t) => {
              setTipo(t);
              setPaso('subtipo');
            }}
          />
        )}

        {paso === 'subtipo' && tipo && (
          <SelectorSubtipo
            tipo={tipo}
            onVolver={() => setPaso('tipo')}
            onSeleccionar={(s) => {
              setSubtipo(s);
              setPaso('foto');
            }}
          />
        )}

        {paso === 'foto' && (
          <div>
            <CameraCapture onCapturada={setFoto} />
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!foto}
                onClick={() => setPaso('revision')}
                className="rounded-lg bg-primary px-6 py-2 font-semibold text-white disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {paso === 'revision' && tipo && subtipo && (
          <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Revisa tu incidencia</h2>
            <p className="text-sm text-gray-600">
              <strong>{tipo.nombre}</strong> · {subtipo.nombre}
            </p>
            <p className="text-sm text-gray-600">
              {cargandoUbicacion && 'Obteniendo ubicación GPS…'}
              {errorUbicacion && `Error de ubicación: ${errorUbicacion}`}
              {coordenadas && `Ubicación: ${coordenadas.latitud.toFixed(5)}, ${coordenadas.longitud.toFixed(5)}`}
            </p>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              className="rounded-lg border border-gray-300 p-2 text-sm"
              rows={3}
            />
            {errorEnvio && <p className="text-sm text-red-500">{errorEnvio}</p>}
            <button
              type="button"
              onClick={enviarIncidencia}
              disabled={enviando || !coordenadas}
              className="rounded-lg bg-secondary px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {enviando ? 'Enviando…' : 'ENVÍA'}
            </button>
          </div>
        )}

        {paso === 'enviado' && codigoSeguimiento && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800">¡Incidencia enviada!</h2>
            <p className="text-sm text-gray-600">Guarda este código para seguir su estado:</p>
            <p className="text-2xl font-bold tracking-widest text-primary">{codigoSeguimiento}</p>
            <button
              type="button"
              onClick={reiniciar}
              className="mt-4 rounded-lg border border-primary px-6 py-2 font-semibold text-primary"
            >
              Volver al mapa
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
