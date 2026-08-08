import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useMunicipioActual } from '../context/MunicipioContext';

interface Estadisticas {
  total: number | null;
  resueltasEsteMes: number | null;
  tiempoMedioResolucionHoras: number | null;
  cargando: boolean;
}

/** Estadísticas agregadas para el panel del mapa, calculadas con consultas dedicadas (no dependen del listado de pines). */
export function useEstadisticas() {
  const { municipio } = useMunicipioActual();
  const [estado, setEstado] = useState<Estadisticas>({
    total: null,
    resueltasEsteMes: null,
    tiempoMedioResolucionHoras: null,
    cargando: true,
  });

  useEffect(() => {
    if (!municipio) return;
    let cancelado = false;

    async function cargar() {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const [totalRes, resueltasRes, tiemposRes] = await Promise.all([
        supabase
          .from('incidencias_anonimas')
          .select('id', { count: 'exact', head: true })
          .eq('municipio_id', municipio!.id),
        supabase
          .from('incidencias_anonimas')
          .select('id', { count: 'exact', head: true })
          .eq('municipio_id', municipio!.id)
          .eq('estado', 'resuelto')
          .gte('updated_at', inicioMes.toISOString()),
        supabase
          .from('incidencias_anonimas')
          .select('created_at, updated_at')
          .eq('municipio_id', municipio!.id)
          .eq('estado', 'resuelto')
          .order('updated_at', { ascending: false })
          .limit(500),
      ]);

      if (cancelado) return;

      const tiempos = (tiemposRes.data ?? []).map(
        (fila) => (new Date(fila.updated_at).getTime() - new Date(fila.created_at).getTime()) / 3_600_000
      );
      const tiempoMedio = tiempos.length > 0 ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : null;

      setEstado({
        total: totalRes.count,
        resueltasEsteMes: resueltasRes.count,
        tiempoMedioResolucionHoras: tiempoMedio,
        cargando: false,
      });
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [municipio]);

  return estado;
}

export function formatearHoras(horas: number): string {
  if (horas < 24) return `${horas.toFixed(1)} h`;
  return `${(horas / 24).toFixed(1)} días`;
}
