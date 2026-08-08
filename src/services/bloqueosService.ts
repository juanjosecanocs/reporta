import { supabase } from './supabaseClient';
import { obtenerEmailUsuario } from './adminService';
import type { UsuarioBloqueado } from '../types';

export interface BloqueoConDetalle extends UsuarioBloqueado {
  emailUsuario: string | null;
  emailAdmin: string | null;
  codigoIncidencia: string | null;
}

/** Bloqueos visibles para el admin actual (los de su municipio + los globales, o todos si es super-admin). */
export async function listarBloqueos(): Promise<BloqueoConDetalle[]> {
  const { data, error } = await supabase
    .from('usuarios_bloqueados')
    .select('*, incidencia:incidencia_id (codigo_seguimiento)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const filas = (data ?? []) as (UsuarioBloqueado & {
    incidencia: { codigo_seguimiento: string } | null;
  })[];

  return Promise.all(
    filas.map(async (fila) => {
      const [emailUsuario, emailAdmin] = await Promise.all([
        obtenerEmailUsuario(fila.usuario_id).catch(() => null),
        obtenerEmailUsuario(fila.bloqueado_por).catch(() => null),
      ]);
      return {
        ...fila,
        emailUsuario,
        emailAdmin,
        codigoIncidencia: fila.incidencia?.codigo_seguimiento ?? null,
      };
    })
  );
}

export interface DatosBloqueo {
  usuarioId: string;
  municipioId: string | null;
  motivo: string;
  incidenciaId?: string;
}

// NOTA: aquí falta enviar el correo de aviso ("tu cuenta ha sido bloqueada
// por mal uso de la app"). Supabase Auth no permite mandar correos propios
// desde el cliente -- hace falta una Edge Function + un proveedor de email
// (p. ej. Resend) para eso. Pendiente de decidir cómo se resuelve.
export async function crearBloqueo(datos: DatosBloqueo): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const adminId = sessionData.session?.user.id;
  if (!adminId) throw new Error('No se ha encontrado la sesión del administrador');

  const { error } = await supabase.from('usuarios_bloqueados').insert({
    usuario_id: datos.usuarioId,
    municipio_id: datos.municipioId,
    motivo: datos.motivo,
    incidencia_id: datos.incidenciaId ?? null,
    bloqueado_por: adminId,
  });
  if (error) throw error;
}

export async function desbloquear(id: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const adminId = sessionData.session?.user.id;

  const { error } = await supabase
    .from('usuarios_bloqueados')
    .update({ desbloqueado_at: new Date().toISOString(), desbloqueado_por: adminId })
    .eq('id', id);
  if (error) throw error;
}
