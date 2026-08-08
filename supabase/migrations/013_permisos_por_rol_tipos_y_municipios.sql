-- REPORTA · Fase 2 · Coherencia de permisos: tipos/subtipos y municipios
--
-- 1) Tipos y subtipos son catálogos GLOBALES compartidos por todos los
--    municipios (Fase 1). Hasta ahora cualquier admin_users podía crear,
--    editar o eliminar libremente (008_gestion_tipos_admin.sql), lo cual es
--    incoherente en un modelo multi-municipio: un admin de un solo
--    municipio no debería poder renombrar o borrar una categoría que usan
--    todos los demás. A partir de esta migración:
--      - Cualquier admin (super o de municipio) puede ACTIVAR/DESACTIVAR y
--        REORDENAR tipos y subtipos (columnas activo/orden).
--      - Solo un super-admin (admin_users.municipio_id is null) puede
--        CREAR, EDITAR (nombre/descripción/icono/colores/urgencia) o
--        ELIMINAR tipos y subtipos.
--    La restricción de columnas para admins de municipio se hace con un
--    trigger (RLS no puede filtrar por columna dentro de un UPDATE), que
--    no afecta a super-admins ni a procesos sin sesión de usuario
--    (migraciones / service_role).
--
-- 2) Municipios pasa a tener un panel de gestión (activar/crear) reservado
--    a super-admin. La policy pública de solo-lectura de municipios
--    (activo = true) no se toca; se añade acceso de escritura y de lectura
--    de inactivos solo para super-admin.

-- ---------------------------------------------------------------------
-- Tipos y subtipos: policies granulares por comando
-- ---------------------------------------------------------------------

drop policy if exists "tipos: admin gestiona" on tipos_incidencias;
drop policy if exists "subtipos: admin gestiona" on subtipos_incidencias;

create policy "tipos: cualquier admin ve todos" on tipos_incidencias
  for select
  using (exists (select 1 from admin_users a where a.id = auth.uid()));

create policy "tipos: cualquier admin activa-desactiva y reordena" on tipos_incidencias
  for update
  using (exists (select 1 from admin_users a where a.id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.id = auth.uid()));

create policy "tipos: solo super-admin crea" on tipos_incidencias
  for insert
  with check (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null));

create policy "tipos: solo super-admin elimina" on tipos_incidencias
  for delete
  using (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null));

create policy "subtipos: cualquier admin ve todos" on subtipos_incidencias
  for select
  using (exists (select 1 from admin_users a where a.id = auth.uid()));

create policy "subtipos: cualquier admin activa-desactiva y reordena" on subtipos_incidencias
  for update
  using (exists (select 1 from admin_users a where a.id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.id = auth.uid()));

create policy "subtipos: solo super-admin crea" on subtipos_incidencias
  for insert
  with check (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null));

create policy "subtipos: solo super-admin elimina" on subtipos_incidencias
  for delete
  using (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null));

-- Trigger: un admin de municipio (municipio_id not null) que intente
-- cambiar nombre/descripción/icono/colores/urgencia recibe un error, en
-- vez de que el cambio se aplique en silencio o afecte a otros municipios.
create or replace function restringir_campos_tipo_subtipo()
returns trigger
language plpgsql
as $$
declare
  es_super boolean;
begin
  if auth.uid() is null then
    return new; -- migraciones / service_role, sin restricción
  end if;

  select (municipio_id is null) into es_super from admin_users where id = auth.uid();

  if es_super is null or es_super then
    return new; -- no es admin (no debería llegar aquí por RLS) o es super-admin
  end if;

  if TG_TABLE_NAME = 'tipos_incidencias' then
    if new.nombre is distinct from old.nombre
      or new.descripcion is distinct from old.descripcion
      or new.icono_name is distinct from old.icono_name
      or new.color_primario is distinct from old.color_primario
      or new.color_secundario is distinct from old.color_secundario
    then
      raise exception 'Solo un super-admin puede editar nombre, descripción, icono o colores de un tipo';
    end if;
  elsif TG_TABLE_NAME = 'subtipos_incidencias' then
    if new.nombre is distinct from old.nombre
      or new.descripcion is distinct from old.descripcion
      or new.icono_name is distinct from old.icono_name
      or new.tipo_id is distinct from old.tipo_id
      or new.urgencia is distinct from old.urgencia
    then
      raise exception 'Solo un super-admin puede editar nombre, descripción, icono, tipo o urgencia de un subtipo';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists restringir_campos_tipo on tipos_incidencias;
create trigger restringir_campos_tipo
  before update on tipos_incidencias
  for each row execute function restringir_campos_tipo_subtipo();

drop trigger if exists restringir_campos_subtipo on subtipos_incidencias;
create trigger restringir_campos_subtipo
  before update on subtipos_incidencias
  for each row execute function restringir_campos_tipo_subtipo();

-- ---------------------------------------------------------------------
-- Municipios: panel de gestión reservado a super-admin
-- ---------------------------------------------------------------------

grant insert, update on municipios to authenticated;

create policy "municipios: super-admin ve todos" on municipios
  for select
  using (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null));

create policy "municipios: super-admin crea" on municipios
  for insert
  with check (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null));

create policy "municipios: super-admin edita" on municipios
  for update
  using (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null))
  with check (exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id is null));
