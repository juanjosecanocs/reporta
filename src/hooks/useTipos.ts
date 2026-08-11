import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { TIPOS_FALLBACK } from '../data/tipos';
import type { Tipo, Subtipo } from '../types';

interface EstadoTipos {
  tipos: Tipo[];
  cargando: boolean;
  error: string | null;
}

interface FilaMunicipioTipo {
  activo: boolean;
  orden: number;
  tipo: Tipo;
}

interface FilaMunicipioSubtipo {
  activo: boolean;
  orden: number;
  subtipo: Subtipo;
}

/**
 * Carga tipos y subtipos dinámicamente desde Supabase (nunca hardcodeados
 * en el bundle). Con municipioId, solo los activos en ese municipio y en
 * su propio orden (uso ciudadano: SelectorTipo, MapaIncidencias). Sin
 * municipioId, el catálogo completo sin filtrar (uso administrativo
 * interno: buscar/filtrar por cualquier tipo, incluidos los inactivos en
 * todos los municipios, como en AdminDashboard o el historial del propio
 * ciudadano para tipos que ya desactivó algún municipio).
 */
export function useTipos(municipioId?: string | null) {
  const [estado, setEstado] = useState<EstadoTipos>({ tipos: [], cargando: true, error: null });

  useEffect(() => {
    let cancelado = false;
    setEstado((e) => ({ ...e, cargando: true }));

    async function cargarPorMunicipio(municipioId: string) {
      const { data: filasTipos, error: errorTipos } = await supabase
        .from('municipio_tipos')
        .select('activo, orden, tipo:tipo_id (*)')
        .eq('municipio_id', municipioId)
        .eq('activo', true)
        .order('orden');

      if (errorTipos || !filasTipos) {
        if (!cancelado) {
          setEstado({ tipos: TIPOS_FALLBACK, cargando: false, error: errorTipos?.message ?? 'Sin datos' });
        }
        return;
      }

      const { data: filasSubtipos } = await supabase
        .from('municipio_subtipos')
        .select('activo, orden, subtipo:subtipo_id (*)')
        .eq('municipio_id', municipioId)
        .eq('activo', true)
        .order('orden');

      const subtipos: Subtipo[] = ((filasSubtipos ?? []) as unknown as FilaMunicipioSubtipo[]).map((fila) => ({
        ...fila.subtipo,
        activo: fila.activo,
        orden: fila.orden,
      }));

      const tipos: Tipo[] = ((filasTipos ?? []) as unknown as FilaMunicipioTipo[]).map((fila) => {
        const tipo: Tipo = { ...fila.tipo, activo: fila.activo, orden: fila.orden };
        return { ...tipo, subtipos: subtipos.filter((s) => s.tipo_id === tipo.id) };
      });

      if (!cancelado) {
        setEstado({ tipos, cargando: false, error: null });
      }
    }

    async function cargarCatalogoCompleto() {
      const { data: tipos, error: errorTipos } = await supabase
        .from('tipos_incidencias')
        .select('*')
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
        .order('orden');

      const tiposConSubtipos: Tipo[] = tipos.map((tipo: Tipo) => ({
        ...tipo,
        subtipos: (subtipos ?? []).filter((s: Subtipo) => s.tipo_id === tipo.id),
      }));

      if (!cancelado) {
        setEstado({ tipos: tiposConSubtipos, cargando: false, error: null });
      }
    }

    if (municipioId) {
      cargarPorMunicipio(municipioId);
    } else {
      cargarCatalogoCompleto();
    }

    return () => {
      cancelado = true;
    };
  }, [municipioId]);

  return estado;
}
