-- REPORTA · Fase 4 · Trazabilidad para moderación
--
-- Antes de la Fase 3 era imposible saber quién había publicado una foto o
-- comentario inadecuado: todo era anónimo. Ahora que esas incidencias
-- llevan usuario_id, falta el último paso para que sirva de algo en
-- moderación: que un admin pueda ver el correo de quien la publicó. Ni
-- "authenticated" ni "admin_users" tienen acceso directo a auth.users, así
-- que se expone con un helper de solo lectura.
--
-- Gating: no comprueba municipio -- si el admin ya pudo leer la incidencia
-- (la policy de SELECT de incidencias_anonimas ya aplica ese filtro), puede
-- saber quién la publicó. Solo hace falta comprobar que quien llama es
-- *algún* admin, igual que email_verificado() en 014.

create or replace function admin_email_usuario(uid uuid)
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when exists (select 1 from admin_users a where a.id = auth.uid())
    then (select email from auth.users where id = uid)
    else null
  end;
$$;

revoke all on function admin_email_usuario(uuid) from public;
grant execute on function admin_email_usuario(uuid) to authenticated;
