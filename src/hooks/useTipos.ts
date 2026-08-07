import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { TIPOS_FALLBACK } from '../data/tipos';
import type { Tipo, Subtipo } from '../types';

interface EstadoTipos {
  tipos: Tipo[];
  cargando: boolean;
  error: string | null;
}

/** Carga tipos y subtipos dinámicamente desde Supabase (nunca hardcodeados en el bundle). */
export function useTipos() {
  const [estado, setEstado] = useState<EstadoTipos>({ tipos: [], cargando: true, error: null });

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const { data: tipos, error: errorTipos } = await supabase
        .from('tipos_incidencias')
        .select('*')
        .eq('activo', true)
        .order('orden');

      if (errorTipos || !tipos) {
        if (!cancelado) {
          setEstado({ tipos: TIPOS_FALLBACK, cargando: false, error: errorTipos?.message ?? 'Sin datos' });
        }
        return;
      }

      const { data: subtipos } = await supabase
        .from('subtipos_incidencias')
        .select('*')
        .eq('activo', true)
        .order('orden');

      const tiposConSubtipos: Tipo[] = tipos.map((tipo: Tipo) => ({
        ...tipo,
        subtipos: (subtipos ?? []).filter((s: Subtipo) => s.tipo_id === tipo.id),
      }));

      if (!cancelado) {
        setEstado({ tipos: tiposConSubtipos, cargando: false, error: null });
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return estado;
}
