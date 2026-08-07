import { useCallback, useState } from 'react';

export interface Coordenadas {
  latitud: number;
  longitud: number;
  precision_metros: number;
}

interface EstadoGeolocalizacion {
  coordenadas: Coordenadas | null;
  cargando: boolean;
  error: string | null;
}

export function useGeolocalizacion() {
  const [estado, setEstado] = useState<EstadoGeolocalizacion>({
    coordenadas: null,
    cargando: false,
    error: null,
  });

  const obtenerUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      setEstado({ coordenadas: null, cargando: false, error: 'Geolocalización no soportada en este dispositivo' });
      return;
    }

    setEstado((prev) => ({ ...prev, cargando: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setEstado({
          coordenadas: {
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision_metros: position.coords.accuracy,
          },
          cargando: false,
          error: null,
        });
      },
      (error) => {
        setEstado({ coordenadas: null, cargando: false, error: error.message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { ...estado, obtenerUbicacion };
}
