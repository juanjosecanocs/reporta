-- REPORTA · Gestión de administradores desde el panel
--
-- Hasta ahora dar de alta un admin era un proceso manual fuera de la app
-- (Dashboard > Authentication > Add user, luego un insert a mano en
-- admin_users). A partir de esta migración un super-admin puede hacerlo
-- desde el propio panel, buscando por email a alguien que ya se haya
-- registrado como ciudadano normal (auth.users) y dándolo de alta como
-- admin general (sin municipio) o admin municipal (con municipio_id).
--
-- 1) admin_users solo tenía policy de SELECT (006, no recursiva: "veo mi
--    propia fila"). Para listar y gestionar admins hace falta que un
--    super-admin vea y escriba TODAS las filas. Una policy que se
--    autoconsulta ("exists (select ... from admin_users ...)" dentro de
--    una policy DE admin_users) es justo el patrón que causó la recursión
--    infinita de 006. Se evita con una función security definer
--    (es_super_admin()): al ejecutarse con el owner de la función, no
--    aplica RLS sobre su propia consulta a admin_users, así que no hay
--    recursión -- mismo mecanismo que ya usan email_verificado (014) y
--    admin_email_usuario (016) sobre auth.users.
--
-- 2) admin_buscar_usuario_por_email(): localiza en auth.users a alguien ya
--    registrado por su email y dice si ya es admin. Gateada a super-admin.
--    Solo devuelve candidatos con email verificado (email_confirmed_at no
--    nulo) -- no tiene sentido promover una cuenta a medio registrar.
--
-- 3) Trigger proteger_ultimo_admin_general: impide borrar o degradar
--    (asignarle municipio) al último admin_users con municipio_id is null,
--    para que la app nunca se quede sin ningún admin general.

create or replace function es_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null
  );
$$;

revoke all on function es_super_admin() from public;
grant execute on function es_super_admin() to authenticated;

drop policy if exists "admin_users: un usuario ve su propia fila" on admin_users;
create policy "admin_users: super-admin ve todos, el resto solo su fila" on admin_users
  for select
  using (id = auth.uid() or es_super_admin());

create policy "admin_users: solo super-admin da de alta" on admin_users
  for insert
  with check (es_super_admin());

create policy "admin_users: solo super-admin edita" on admin_users
  for update
  using (es_super_admin())
  with check (es_super_admin());

create policy "admin_users: solo super-admin quita acceso" on admin_users
  for delete
  using (es_super_admin());

create or replace function admin_buscar_usuario_por_email(email_buscado text)
returns table (
  id uuid,
  email text,
  nombre text,
  ya_es_admin boolean,
  municipio_id uuid
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    u.id,
    u.email,
    u.raw_user_meta_data->>'nombre' as nombre,
    (a.id is not null) as ya_es_admin,
    a.municipio_id
  from auth.users u
  left join admin_users a on a.id = u.id
  where es_super_admin()
    and u.email_confirmed_at is not null
    and lower(u.email) = lower(email_buscado)
  limit 1;
$$;

revoke all on function admin_buscar_usuario_por_email(text) from public;
grant execute on function admin_buscar_usuario_por_email(text) to authenticated;

create or replace function proteger_ultimo_admin_general()
returns trigger
language plpgsql
as $$
begin
  if old.municipio_id is null and (TG_OP = 'DELETE' or new.municipio_id is not null) then
    if (select count(*) from admin_users where municipio_id is null and id <> old.id) = 0 then
      raise exception 'No puedes quitar al último administrador general: la app se quedaría sin nadie con acceso total.';
    end if;
  end if;
  if TG_OP = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_ultimo_admin_general on admin_users;
create trigger proteger_ultimo_admin_general
  before delete or update on admin_users
  for each row execute function proteger_ultimo_admin_general();
