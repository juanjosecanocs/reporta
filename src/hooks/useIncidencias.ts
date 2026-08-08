import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useMunicipioActual } from '../context/MunicipioContext';
import type { Incidencia } from '../types';

interface EstadoIncidencias {
  incidencias: Incidencia[];
  cargando: boolean;
  error: string | null;
}

/** Incidencias públicas (no borradas) del municipio actual, para pintar como pines en el mapa. */
export function useIncidencias() {
  const { municipio } = useMunicipioActual();
  const [estado, setEstado] = useState<EstadoIncidencias>({
    incidencias: [],
    cargando: true,
    error: null,
  });

  useEffect(() => {
    if (!municipio) return;
    let cancelado = false;

    async function cargar() {
      const { data, error } = await supabase
        .from('incidencias_anonimas')
        .select('*')
        .eq('municipio_id', municipio!.id)
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
  }, [municipio]);

  return estado;
}
