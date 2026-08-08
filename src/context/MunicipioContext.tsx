import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { obtenerMunicipioPorSlug } from '../services/municipioService';
import type { Municipio } from '../types';

const SLUG_POR_DEFECTO = import.meta.env.VITE_DEFAULT_MUNICIPIO_SLUG || 'almeria';

/**
 * Resuelve el slug de municipio a partir del hostname. Mientras no exista
 * dominio propio (Fase 0/5), reporta-almeria.netlify.app y localhost no
 * llevan subdominio de municipio real, así que caen al slug por defecto.
 */
function resolverSlugDesdeHostname(hostname: string): string {
  const esHostSinMunicipio =
    hostname === 'localhost' ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.endsWith('.netlify.app');

  if (esHostSinMunicipio) return SLUG_POR_DEFECTO;
  return hostname.split('.')[0] || SLUG_POR_DEFECTO;
}

interface EstadoMunicipio {
  municipio: Municipio | null;
  cargando: boolean;
  error: string | null;
}

const MunicipioContext = createContext<EstadoMunicipio>({
  municipio: null,
  cargando: true,
  error: null,
});

export function MunicipioProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoMunicipio>({
    municipio: null,
    cargando: true,
    error: null,
  });

  useEffect(() => {
    let cancelado = false;
    const slug = resolverSlugDesdeHostname(window.location.hostname);

    obtenerMunicipioPorSlug(slug)
      .then((municipio) => {
        if (cancelado) return;
        if (!municipio) {
          setEstado({ municipio: null, cargando: false, error: `No existe un municipio activo con slug "${slug}"` });
          return;
        }
        setEstado({ municipio, cargando: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelado) return;
        setEstado({
          municipio: null,
          cargando: false,
          error: error instanceof Error ? error.message : 'Error cargando el municipio',
        });
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return <MunicipioContext.Provider value={estado}>{children}</MunicipioContext.Provider>;
}

export function useMunicipioActual(): EstadoMunicipio {
  return useContext(MunicipioContext);
}
