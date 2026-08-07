import { supabase } from './supabaseClient';
import type { Tipo, Subtipo } from '../types';

/** Trae tipos y subtipos completos (incluidos inactivos) para la pantalla de gestión. */
export async function listarTiposAdmin(): Promise<Tipo[]> {
  const { data: tipos, error: errorTipos } = await supabase
    .from('tipos_incidencias')
    .select('*')
    .order('orden');
  if (errorTipos) throw errorTipos;

  const { data: subtipos, error: errorSubtipos } = await supabase
    .from('subtipos_incidencias')
    .select('*')
    .order('orden');
  if (errorSubtipos) throw errorSubtipos;

  return (tipos ?? []).map((tipo: Tipo) => ({
    ...tipo,
    subtipos: (subtipos ?? []).filter((s: Subtipo) => s.tipo_id === tipo.id),
  }));
}

function slugify(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function idDisponible(tabla: 'tipos_incidencias' | 'subtipos_incidencias', id: string): Promise<boolean> {
  const { data, error } = await supabase.from(tabla).select('id').eq('id', id).maybeSingle();
  if (error) throw error;
  return !data;
}

async function generarIdUnico(tabla: 'tipos_incidencias' | 'subtipos_incidencias', nombre: string, maxLen: number): Promise<string> {
  const base = slugify(nombre).slice(0, maxLen) || 'item';
  let candidato = base;
  let sufijo = 2;
  while (!(await idDisponible(tabla, candidato))) {
    const sufijoStr = `_${sufijo}`;
    candidato = base.slice(0, maxLen - sufijoStr.length) + sufijoStr;
    sufijo += 1;
  }
  return candidato;
}

export interface DatosTipo {
  nombre: string;
  descripcion?: string;
  icono_name?: string;
  color_primario: string;
  color_secundario?: string;
}

export async function crearTipo(datos: DatosTipo): Promise<Tipo> {
  const id = await generarIdUnico('tipos_incidencias', datos.nombre, 50);

  const { data: maxOrden } = await supabase
    .from('tipos_incidencias')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('tipos_incidencias')
    .insert({ id, ...datos, orden: (maxOrden?.orden ?? 0) + 1, activo: true })
    .select()
    .single();
  if (error) throw error;
  return data as Tipo;
}

export async function actualizarTipo(id: string, cambios: Partial<DatosTipo>): Promise<void> {
  const { error } = await supabase
    .from('tipos_incidencias')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function cambiarActivoTipo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('tipos_incidencias')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function eliminarTipoDefinitivo(id: string): Promise<void> {
  const { count, error: errorCount } = await supabase
    .from('incidencias_anonimas')
    .select('id', { count: 'exact', head: true })
    .eq('tipo_id', id);
  if (errorCount) throw errorCount;
  if ((count ?? 0) > 0) {
    throw new Error('No se puede eliminar: hay incidencias que usan este tipo. Desactívalo en su lugar.');
  }

  const { count: countSubtipos, error: errorSubtipos } = await supabase
    .from('subtipos_incidencias')
    .select('id', { count: 'exact', head: true })
    .eq('tipo_id', id);
  if (errorSubtipos) throw errorSubtipos;
  if ((countSubtipos ?? 0) > 0) {
    throw new Error('No se puede eliminar: el tipo tiene subtipos. Elimínalos primero.');
  }

  const { error } = await supabase.from('tipos_incidencias').delete().eq('id', id);
  if (error) throw error;
}

export async function reordenarTipo(tipos: Tipo[], id: string, direccion: 'subir' | 'bajar'): Promise<void> {
  const ordenados = [...tipos].sort((a, b) => a.orden - b.orden);
  const idx = ordenados.findIndex((t) => t.id === id);
  const idxVecino = direccion === 'subir' ? idx - 1 : idx + 1;
  if (idx === -1 || idxVecino < 0 || idxVecino >= ordenados.length) return;

  const actual = ordenados[idx];
  const vecino = ordenados[idxVecino];

  const { error: error1 } = await supabase
    .from('tipos_incidencias')
    .update({ orden: vecino.orden })
    .eq('id', actual.id);
  if (error1) throw error1;

  const { error: error2 } = await supabase
    .from('tipos_incidencias')
    .update({ orden: actual.orden })
    .eq('id', vecino.id);
  if (error2) throw error2;
}

export interface DatosSubtipo {
  nombre: string;
  descripcion?: string;
  icono_name?: string;
  urgencia: number;
}

export async function crearSubtipo(tipoId: string, datos: DatosSubtipo): Promise<Subtipo> {
  const id = await generarIdUnico('subtipos_incidencias', datos.nombre, 100);

  const { data: maxOrden } = await supabase
    .from('subtipos_incidencias')
    .select('orden')
    .eq('tipo_id', tipoId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('subtipos_incidencias')
    .insert({ id, tipo_id: tipoId, ...datos, orden: (maxOrden?.orden ?? 0) + 1, activo: true })
    .select()
    .single();
  if (error) throw error;
  return data as Subtipo;
}

export async function actualizarSubtipo(id: string, cambios: Partial<DatosSubtipo>): Promise<void> {
  const { error } = await supabase
    .from('subtipos_incidencias')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function cambiarActivoSubtipo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('subtipos_incidencias')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function eliminarSubtipoDefinitivo(id: string): Promise<void> {
  const { count, error: errorCount } = await supabase
    .from('incidencias_anonimas')
    .select('id', { count: 'exact', head: true })
    .eq('subtipo_id', id);
  if (errorCount) throw errorCount;
  if ((count ?? 0) > 0) {
    throw new Error('No se puede eliminar: hay incidencias que usan este subtipo. Desactívalo en su lugar.');
  }

  const { error } = await supabase.from('subtipos_incidencias').delete().eq('id', id);
  if (error) throw error;
}

export async function reordenarSubtipo(subtipos: Subtipo[], id: string, direccion: 'subir' | 'bajar'): Promise<void> {
  const ordenados = [...subtipos].sort((a, b) => a.orden - b.orden);
  const idx = ordenados.findIndex((s) => s.id === id);
  const idxVecino = direccion === 'subir' ? idx - 1 : idx + 1;
  if (idx === -1 || idxVecino < 0 || idxVecino >= ordenados.length) return;

  const actual = ordenados[idx];
  const vecino = ordenados[idxVecino];

  const { error: error1 } = await supabase
    .from('subtipos_incidencias')
    .update({ orden: vecino.orden })
    .eq('id', actual.id);
  if (error1) throw error1;

  const { error: error2 } = await supabase
    .from('subtipos_incidencias')
    .update({ orden: actual.orden })
    .eq('id', vecino.id);
  if (error2) throw error2;
}
