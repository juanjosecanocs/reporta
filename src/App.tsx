import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { MapaIncidencias } from './components/Map/MapaIncidencias';
import { EstadisticasSidebar } from './components/Map/EstadisticasSidebar';
import { SelectorTipo } from './components/Incidencia/SelectorTipo';
import { SelectorSubtipo } from './components/Incidencia/SelectorSubtipo';
import { CameraCapture } from './components/Incidencia/CameraCapture';
import { FichaIncidencia } from './components/Incidencia/FichaIncidencia';
import { HistorialIncidencias } from './components/Incidencia/HistorialIncidencias';
import { useGeolocalizacion, type Coordenadas } from './hooks/useGeolocalizacion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useHistorialIncidencias } from './hooks/useLocalStorage';
import { crearIncidencia, adjuntarImagen } from './services/storageService';
import type { Tipo, Subtipo } from './types';

type Paso = 'mapa' | 'tipo' | 'subtipo' | 'foto' | 'revision' | 'enviado' | 'historial';

function useUuidCliente() {
  const [uuid] = useLocalStorage<string>('reporta_uuid_cliente', crypto.randomUUID());
  return uuid;
}

function App() {
  const [paso, setPaso] = useState<Paso>('mapa');
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [subtipo, setSubtipo] = useState<Subtipo | null>(null);
  const [foto, setFoto] = useState<Blob | null>(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [codigoSeguimiento, setCodigoSeguimiento] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [coordenadasAjustadas, setCoordenadasAjustadas] = useState<Coordenadas | null>(null);

  const uuidCliente = useUuidCliente();
  const { coordenadas, cargando: cargandoUbicacion, error: errorUbicacion, obtenerUbicacion } = useGeolocalizacion();
  const { agregar: agregarAlHistorial } = useHistorialIncidencias();

  const coordenadasEfectivas = coordenadasAjustadas ?? coordenadas;

  function reiniciar() {
    setPaso('mapa');
    setTipo(null);
    setSubtipo(null);
    setFoto(null);
    setFotoPreviewUrl(null);
    setDescripcion('');
    setCodigoSeguimiento(null);
    setErrorEnvio(null);
    setCoordenadasAjustadas(null);
  }

  function iniciarReporte() {
    setPaso('tipo');
    obtenerUbicacion();
  }

  async function enviarIncidencia() {
    if (!tipo || !subtipo || !coordenadasEfectivas) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const incidencia = await crearIncidencia({
        tipo_id: tipo.id,
        subtipo_id: subtipo.id,
        latitud: coordenadasEfectivas.latitud,
        longitud: coordenadasEfectivas.longitud,
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
      <Header onLogoClick={paso === 'mapa' ? undefined : reiniciar} />

      <main className="relative flex-1">
        {paso === 'mapa' && (
          <>
            <MapaIncidencias />
            <EstadisticasSidebar />
            <button
              type="button"
              onClick={() => setPaso('historial')}
              className="absolute right-4 top-4 z-10 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-lg transition hover:bg-gray-50"
            >
              📋 Mi historial
            </button>
            <button
              type="button"
              onClick={iniciarReporte}
              className="absolute bottom-6 right-6 z-10 rounded-full bg-secondary px-6 py-4 font-bold text-white shadow-lg transition hover:brightness-95"
            >
              REPORTA INCIDENCIA
            </button>
          </>
        )}

        {paso === 'historial' && <HistorialIncidencias onVolver={() => setPaso('mapa')} />}

        {paso === 'tipo' && (
          <SelectorTipo
            onVolver={reiniciar}
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
            <CameraCapture
              onCapturada={(blob) => {
                setFoto(blob);
                setFotoPreviewUrl(URL.createObjectURL(blob));
              }}
            />
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
            {cargandoUbicacion && <p className="text-sm text-gray-600">Obteniendo ubicación GPS…</p>}
            {errorUbicacion && <p className="text-sm text-red-500">Error de ubicación: {errorUbicacion}</p>}
            {coordenadasEfectivas && (
              <FichaIncidencia
                tipo={tipo}
                subtipo={subtipo}
                latitud={coordenadasEfectivas.latitud}
                longitud={coordenadasEfectivas.longitud}
                imagenUrl={fotoPreviewUrl}
                arrastrable
                onCambiarUbicacion={(c) => setCoordenadasAjustadas({ ...c, precision_metros: 0 })}
                comentario={descripcion}
                onComentarioChange={setDescripcion}
              />
            )}
            {errorEnvio && <p className="text-sm text-red-500">{errorEnvio}</p>}
            <button
              type="button"
              onClick={enviarIncidencia}
              disabled={enviando || !coordenadasEfectivas}
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
            <button type="button" onClick={() => setPaso('historial')} className="text-sm text-primary underline">
              Ver mi historial
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
