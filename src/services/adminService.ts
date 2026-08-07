import { supabase } from './supabaseClient';
import type { Incidencia } from '../types';

export interface FiltrosAdmin {
  estado?: string;
  tipoId?: string;
  incluirBorradas?: boolean;
}

export async function listarIncidenciasAdmin(filtros: FiltrosAdmin = {}): Promise<Incidencia[]> {
  let query = supabase
    .from('incidencias_anonimas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filtros.estado) query = query.eq('estado', filtros.estado);
  if (filtros.tipoId) query = query.eq('tipo_id', filtros.tipoId);
  if (!filtros.incluirBorradas) query = query.is('deleted_at', null);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Incidencia[];
}

export async function actualizarEstado(id: string, estado: Incidencia['estado']): Promise<void> {
  const { error } = await supabase
    .from('incidencias_anonimas')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function eliminarIncidencia(id: string, motivo: string): Promise<void> {
  const { error } = await supabase
    .from('incidencias_anonimas')
    .update({ deleted_at: new Date().toISOString(), deleted_reason: motivo, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function restaurarIncidencia(id: string): Promise<void> {
  const { error } = await supabase
    .from('incidencias_anonimas')
    .update({ deleted_at: null, deleted_reason: null, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
