import { supabase } from './supabaseClient';
import type { Municipio } from '../types';

/** Todos los municipios, incluidos los inactivos. Solo accesible para super-admin (RLS). */
export async function listarMunicipiosAdmin(): Promise<Municipio[]> {
  const { data, error } = await supabase.from('municipios').select('*').order('nombre');
  if (error) throw error;
  return (data ?? []) as Municipio[];
}

export interface DatosMunicipio {
  slug: string;
  nombre: string;
  centro_lat: number;
  centro_lng: number;
  zoom_inicial: number;
}

export async function crearMunicipio(datos: DatosMunicipio): Promise<Municipio> {
  const { data, error } = await supabase
    .from('municipios')
    .insert({ ...datos, activo: false })
    .select()
    .single();
  if (error) throw error;
  return data as Municipio;
}

export async function cambiarActivoMunicipio(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('municipios')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
