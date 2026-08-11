import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { obtenerMunicipioPorSlug } from '../services/municipioService';
import { mensajeDeError } from '../utils/errores';
import type { Municipio } from '../types';

const SLUG_POR_DEFECTO = import.meta.env.VITE_DEFAULT_MUNICIPIO_SLUG || 'almeria';

/**
 * Resuelve el slug de municipio a partir del hostname. localhost, IPs,
 * *.netlify.app y el dominio raíz propio (app-reporta.es, sin subdominio de
 * municipio) caen al slug por defecto; un subdominio real bajo el dominio
 * propio (almeria.app-reporta.es) usa ese subdominio como slug (Fase 5).
 */
function resolverSlugDesdeHostname(hostname: string): string {
  const partes = hostname.split('.');
  const esHostSinMunicipio =
    hostname === 'localhost' ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.endsWith('.netlify.app') ||
    partes.length <= 2;

  if (esHostSinMunicipio) return SLUG_POR_DEFECTO;
  return partes[0] || SLUG_POR_DEFECTO;
}

function dominioRaiz(hostname: string): string {
  return hostname.split('.').slice(-2).join('.');
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
    const hostname = window.location.hostname;
    const slug = resolverSlugDesdeHostname(hostname);

    obtenerMunicipioPorSlug(slug)
      .then((municipio) => {
        if (cancelado) return;
        if (!municipio) {
          // Subdominio de municipio sin fila activa (ej. dado de baja o con
          // el slug mal escrito): en vez de un error técnico, se manda al
          // dominio raíz para que caiga al municipio por defecto. Si el que
          // falla es el propio slug por defecto, no hay a dónde redirigir
          // sin bucle, así que ahí sí se muestra el error.
          if (slug !== SLUG_POR_DEFECTO) {
            window.location.href = `${window.location.protocol}//${dominioRaiz(hostname)}${window.location.pathname}`;
            return;
          }
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
          error: mensajeDeError(error, 'Error cargando el municipio'),
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
