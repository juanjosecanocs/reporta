import { supabase } from './supabaseClient';
import type { Tipo, Subtipo } from '../types';

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
 * Catálogo completo con el activo/orden de la "plantilla maestra"
 * (tipos_incidencias/subtipos_incidencias directamente, sin pasar por
 * ningún municipio) -- solo para la vista "General" de un super-admin.
 */
export async function listarTiposBase(): Promise<Tipo[]> {
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

/** Activa/desactiva en la plantilla maestra y lo replica en todos los municipios. */
export async function cambiarActivoTipoGeneral(tipoId: string, activo: boolean): Promise<void> {
  const { error: errorBase } = await supabase
    .from('tipos_incidencias')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', tipoId);
  if (errorBase) throw errorBase;

  const { error: errorMunicipios } = await supabase.from('municipio_tipos').update({ activo }).eq('tipo_id', tipoId);
  if (errorMunicipios) throw errorMunicipios;
}

/**
 * Reordena en la plantilla maestra y resetea el orden de TODOS los
 * municipios para que vuelva a coincidir con ella -- si algún municipio
 * había reordenado este tipo a su manera, ese ajuste se pierde.
 */
export async function reordenarTipoGeneral(tipos: Tipo[], id: string, direccion: 'subir' | 'bajar'): Promise<void> {
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

  const { error: error3 } = await supabase.from('municipio_tipos').update({ orden: vecino.orden }).eq('tipo_id', actual.id);
  if (error3) throw error3;

  const { error: error4 } = await supabase.from('municipio_tipos').update({ orden: actual.orden }).eq('tipo_id', vecino.id);
  if (error4) throw error4;
}

/** Activa/desactiva en la plantilla maestra y lo replica en todos los municipios. */
export async function cambiarActivoSubtipoGeneral(subtipoId: string, activo: boolean): Promise<void> {
  const { error: errorBase } = await supabase
    .from('subtipos_incidencias')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', subtipoId);
  if (errorBase) throw errorBase;

  const { error: errorMunicipios } = await supabase
    .from('municipio_subtipos')
    .update({ activo })
    .eq('subtipo_id', subtipoId);
  if (errorMunicipios) throw errorMunicipios;
}

/** Igual que reordenarTipoGeneral pero para subtipos (dentro de su mismo tipo). */
export async function reordenarSubtipoGeneral(subtipos: Subtipo[], id: string, direccion: 'subir' | 'bajar'): Promise<void> {
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

  const { error: error3 } = await supabase
    .from('municipio_subtipos')
    .update({ orden: vecino.orden })
    .eq('subtipo_id', actual.id);
  if (error3) throw error3;

  const { error: error4 } = await supabase
    .from('municipio_subtipos')
    .update({ orden: actual.orden })
    .eq('subtipo_id', vecino.id);
  if (error4) throw error4;
}

/** Catálogo completo con el activo/orden propios de ese municipio, para la pantalla de gestión. */
export async function listarTiposPorMunicipio(municipioId: string): Promise<Tipo[]> {
  const { data: filasTipos, error: errorTipos } = await supabase
    .from('municipio_tipos')
    .select('activo, orden, tipo:tipo_id (*)')
    .eq('municipio_id', municipioId)
    .order('orden');
  if (errorTipos) throw errorTipos;

  const { data: filasSubtipos, error: errorSubtipos } = await supabase
    .from('municipio_subtipos')
    .select('activo, orden, subtipo:subtipo_id (*)')
    .eq('municipio_id', municipioId)
    .order('orden');
  if (errorSubtipos) throw errorSubtipos;

  const subtipos: Subtipo[] = ((filasSubtipos ?? []) as unknown as FilaMunicipioSubtipo[]).map((fila) => ({
    ...fila.subtipo,
    activo: fila.activo,
    orden: fila.orden,
  }));

  return ((filasTipos ?? []) as unknown as FilaMunicipioTipo[]).map((fila) => {
    const tipo: Tipo = { ...fila.tipo, activo: fila.activo, orden: fila.orden };
    return { ...tipo, subtipos: subtipos.filter((s) => s.tipo_id === tipo.id) };
  });
}

export async function cambiarActivoTipoMunicipio(municipioId: string, tipoId: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('municipio_tipos')
    .update({ activo })
    .eq('municipio_id', municipioId)
    .eq('tipo_id', tipoId);
  if (error) throw error;
}

export async function reordenarTipoMunicipio(
  municipioId: string,
  tipos: Tipo[],
  id: string,
  direccion: 'subir' | 'bajar'
): Promise<void> {
  const ordenados = [...tipos].sort((a, b) => a.orden - b.orden);
  const idx = ordenados.findIndex((t) => t.id === id);
  const idxVecino = direccion === 'subir' ? idx - 1 : idx + 1;
  if (idx === -1 || idxVecino < 0 || idxVecino >= ordenados.length) return;

  const actual = ordenados[idx];
  const vecino = ordenados[idxVecino];

  const { error: error1 } = await supabase
    .from('municipio_tipos')
    .update({ orden: vecino.orden })
    .eq('municipio_id', municipioId)
    .eq('tipo_id', actual.id);
  if (error1) throw error1;

  const { error: error2 } = await supabase
    .from('municipio_tipos')
    .update({ orden: actual.orden })
    .eq('municipio_id', municipioId)
    .eq('tipo_id', vecino.id);
  if (error2) throw error2;
}

export async function cambiarActivoSubtipoMunicipio(municipioId: string, subtipoId: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('municipio_subtipos')
    .update({ activo })
    .eq('municipio_id', municipioId)
    .eq('subtipo_id', subtipoId);
  if (error) throw error;
}

export async function reordenarSubtipoMunicipio(
  municipioId: string,
  subtipos: Subtipo[],
  id: string,
  direccion: 'subir' | 'bajar'
): Promise<void> {
  const ordenados = [...subtipos].sort((a, b) => a.orden - b.orden);
  const idx = ordenados.findIndex((s) => s.id === id);
  const idxVecino = direccion === 'subir' ? idx - 1 : idx + 1;
  if (idx === -1 || idxVecino < 0 || idxVecino >= ordenados.length) return;

  const actual = ordenados[idx];
  const vecino = ordenados[idxVecino];

  const { error: error1 } = await supabase
    .from('municipio_subtipos')
    .update({ orden: vecino.orden })
    .eq('municipio_id', municipioId)
    .eq('subtipo_id', actual.id);
  if (error1) throw error1;

  const { error: error2 } = await supabase
    .from('municipio_subtipos')
    .update({ orden: actual.orden })
    .eq('municipio_id', municipioId)
    .eq('subtipo_id', vecino.id);
  if (error2) throw error2;
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
