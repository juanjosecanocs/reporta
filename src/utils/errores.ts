/**
 * Los errores de Supabase (PostgREST, Auth) a veces llegan como un objeto
 * plano {message, code, ...} en vez de una instancia real de Error -- por
 * eso `err instanceof Error` no basta para recuperar el mensaje real (p.ej.
 * la excepción de un trigger), y sin esto el usuario solo ve el fallback
 * genérico aunque el backend le esté diciendo algo más útil.
 */
export function mensajeDeError(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return fallback;
}
