-- REPORTA · Panel de administración (Fase 1.5)
--
-- admin_users ya existe (001) con RLS habilitada y sin policies previas:
-- solo el service_role podía tocarla. La cuenta de Supabase Auth del
-- administrador se crea desde el propio Dashboard (Authentication > Add
-- user) — nunca desde la app ni con la anon key — y luego se vincula
-- aquí insertando su fila en admin_users (id = auth.users.id).
--
-- A partir de ahí, cualquier usuario autenticado presente en admin_users
-- puede ver todas las incidencias (incluidas las borradas) y cambiar su
-- estado o borrarlas/restaurarlas lógicamente. El resto de usuarios
-- autenticados sin fila en admin_users no obtiene ningún permiso extra
-- sobre el ciudadano anónimo.

create policy "admin_users: un admin puede verse a si mismo y a otros admins" on admin_users
  for select
  using (exists (select 1 from admin_users a where a.id = auth.uid()));

create policy "incidencias: los admins ven todas, incluidas borradas" on incidencias_anonimas
  for select
  using (exists (select 1 from admin_users a where a.id = auth.uid()));

grant update (estado, deleted_at, deleted_reason, updated_at) on incidencias_anonimas to authenticated;

create policy "incidencias: los admins cambian estado y borrado logico" on incidencias_anonimas
  for update
  using (exists (select 1 from admin_users a where a.id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.id = auth.uid()));
