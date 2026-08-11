import { supabase } from './supabaseClient';
import type { AdminUser } from '../types';

export interface AdminUserConMunicipio extends AdminUser {
  municipioNombre: string | null;
}

export interface CandidatoAdmin {
  id: string;
  email: string;
  nombre: string | null;
  yaEsAdmin: boolean;
  municipioId: string | null;
}

/** Todos los admins actuales (general y de municipio). Solo visible para super-admin (RLS). */
export async function listarAdministradores(): Promise<AdminUserConMunicipio[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*, municipio:municipio_id (nombre)')
    .order('created_at', { ascending: true });
  if (error) throw error;

  const filas = (data ?? []) as (AdminUser & { municipio: { nombre: string } | null })[];
  return filas.map((fila) => ({ ...fila, municipioNombre: fila.municipio?.nombre ?? null }));
}

/** Busca por email a alguien ya registrado como ciudadano, para poder darlo de alta como admin. */
export async function buscarUsuarioPorEmail(email: string): Promise<CandidatoAdmin | null> {
  const { data, error } = await supabase.rpc('admin_buscar_usuario_por_email', { email_buscado: email });
  if (error) throw error;
  const fila = data?.[0];
  if (!fila) return null;
  return {
    id: fila.id,
    email: fila.email,
    nombre: fila.nombre,
    yaEsAdmin: fila.ya_es_admin,
    municipioId: fila.municipio_id,
  };
}

/** Da de alta como admin a un usuario ya registrado. municipioId null = admin general. */
export async function agregarAdministrador(id: string, email: string, municipioId: string | null): Promise<void> {
  const { error } = await supabase.from('admin_users').insert({ id, email, municipio_id: municipioId });
  if (error) throw error;
}

/** Cambia el municipio de un admin existente (null = lo convierte en admin general). */
export async function cambiarMunicipioAdministrador(id: string, municipioId: string | null): Promise<void> {
  const { error } = await supabase.from('admin_users').update({ municipio_id: municipioId }).eq('id', id);
  if (error) throw error;
}

/** Quita el acceso de admin (no borra la cuenta de usuario, solo su fila en admin_users). */
export async function quitarAdministrador(id: string): Promise<void> {
  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  if (error) throw error;
}
