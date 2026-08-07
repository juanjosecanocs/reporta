import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Incidencia } from '../types';

interface EstadoIncidencias {
  incidencias: Incidencia[];
  cargando: boolean;
  error: string | null;
}

/** Incidencias públicas (no borradas) para pintar como pines en el mapa. */
export function useIncidencias() {
  const [estado, setEstado] = useState<EstadoIncidencias>({
    incidencias: [],
    cargando: true,
    error: null,
  });

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const { data, error } = await supabase
        .from('incidencias_anonimas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (cancelado) return;

      if (error) {
        setEstado({ incidencias: [], cargando: false, error: error.message });
        return;
      }
      setEstado({ incidencias: (data ?? []) as Incidencia[], cargando: false, error: null });
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return estado;
}
