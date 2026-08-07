import { useCallback, useState } from 'react';

/** Hook genérico de localStorage con serialización JSON. */
export function useLocalStorage<T>(key: string, valorInicial: T) {
  const [valor, setValorState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  const setValor = useCallback(
    (nuevoValor: T | ((prev: T) => T)) => {
      setValorState((prev) => {
        const resuelto = nuevoValor instanceof Function ? nuevoValor(prev) : nuevoValor;
        try {
          window.localStorage.setItem(key, JSON.stringify(resuelto));
        } catch {
          // localStorage no disponible (modo privado, cuota excedida, etc.)
        }
        return resuelto;
      });
    },
    [key]
  );

  return [valor, setValor] as const;
}

export interface HistorialEntry {
  codigo_seguimiento: string;
  tipo_id: string;
  subtipo_id: string;
  created_at: string;
}

const HISTORIAL_KEY = 'reporta_historial';
const HISTORIAL_DIAS = 90;

/** Historial local de incidencias enviadas por este dispositivo, con expiración a 90 días. */
export function useHistorialIncidencias() {
  const [historial, setHistorial] = useLocalStorage<HistorialEntry[]>(HISTORIAL_KEY, []);

  const limiteMs = HISTORIAL_DIAS * 24 * 60 * 60 * 1000;
  const vigente = historial.filter(
    (entry) => Date.now() - new Date(entry.created_at).getTime() < limiteMs
  );

  const agregar = useCallback(
    (entry: HistorialEntry) => {
      setHistorial((prev) => [entry, ...prev.filter((e) => Date.now() - new Date(e.created_at).getTime() < limiteMs)]);
    },
    [setHistorial, limiteMs]
  );

  return { historial: vigente, agregar };
}
