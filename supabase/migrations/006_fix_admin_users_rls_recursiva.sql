-- REPORTA · Fix: la policy de SELECT en admin_users se consultaba a si
-- misma (exists (select ... from admin_users ...) dentro de una policy
-- de admin_users), lo que Postgres rechaza con "infinite recursion
-- detected in policy for relation admin_users". Esto hacia fallar la
-- comprobacion de "soy admin" en el panel y mostraba siempre "esta
-- cuenta no tiene permisos de administrador" aunque la fila existiera.
--
-- Las policies de incidencias_anonimas que consultan admin_users desde
-- OTRA tabla no tenian este problema (no son autorreferentes), asi que
-- no hace falta tocarlas.

drop policy if exists "admin_users: un admin puede verse a si mismo y a otros admins" on admin_users;

create policy "admin_users: un usuario ve su propia fila" on admin_users
  for select
  using (id = auth.uid());
