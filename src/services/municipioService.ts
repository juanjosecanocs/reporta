import { supabase } from './supabaseClient';
import type { Municipio } from '../types';

export async function listarMunicipiosActivos(): Promise<Municipio[]> {
  const { data, error } = await supabase.from('municipios').select('*').eq('activo', true).order('nombre');
  if (error) throw error;
  return (data ?? []) as Municipio[];
}

export async function obtenerMunicipioPorSlug(slug: string): Promise<Municipio | null> {
  const { data, error } = await supabase
    .from('municipios')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  return (data as Municipio) ?? null;
}
