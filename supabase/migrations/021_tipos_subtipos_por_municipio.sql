-- REPORTA · Activación y orden de tipos/subtipos por municipio
--
-- Hasta ahora tipos_incidencias.activo/orden y subtipos_incidencias.activo/
-- orden eran columnas únicas y globales: cualquier admin (municipal o
-- general) que las tocaba cambiaba el estado para TODOS los municipios a
-- la vez, y el propio selector de tipo del ciudadano (useTipos) tampoco
-- distinguía municipio. Un admin de un municipio pequeño podía, sin
-- querer, apagar una categoría que otro municipio necesitaba.
--
-- A partir de esta migración, activo/orden pasan a vivir en dos tablas
-- puente (una fila por municipio × tipo, y por municipio × subtipo). El
-- catálogo base (nombre, descripción, icono, colores, urgencia) sigue
-- siendo global y solo lo crea/edita/elimina un super-admin -- eso no
-- cambia. Las columnas activo/orden de tipos_incidencias/
-- subtipos_incidencias se dejan de leer para decidir visibilidad (quedan
-- solo como semilla del valor inicial al dar de alta un tipo/municipio
-- nuevo, ver los triggers fan_out_* más abajo) y ya no son editables por
-- ningún admin -- si hiciera falta un "apagado global" en el futuro habría
-- que añadirlo explícitamente, no reutilizar esas columnas ya congeladas.

create table municipio_tipos (
  municipio_id uuid not null references municipios(id) on delete cascade,
  tipo_id varchar(50) not null references tipos_incidencias(id) on delete cascade,
  activo boolean not null default true,
  orden int not null,
  primary key (municipio_id, tipo_id)
);

create index idx_municipio_tipos_municipio on municipio_tipos (municipio_id, activo);

create table municipio_subtipos (
  municipio_id uuid not null references municipios(id) on delete cascade,
  subtipo_id varchar(100) not null references subtipos_incidencias(id) on delete cascade,
  activo boolean not null default true,
  orden int not null,
  primary key (municipio_id, subtipo_id)
);

create index idx_municipio_subtipos_municipio on municipio_subtipos (municipio_id, activo);

-- Backfill: cada municipio arranca con exactamente el mismo activo/orden
-- que tenía la columna global, así nadie pierde el estado que ya tenía hoy.
insert into municipio_tipos (municipio_id, tipo_id, activo, orden)
select m.id, t.id, t.activo, t.orden
from municipios m cross join tipos_incidencias t
on conflict (municipio_id, tipo_id) do nothing;

insert into municipio_subtipos (municipio_id, subtipo_id, activo, orden)
select m.id, s.id, s.activo, s.orden
from municipios m cross join subtipos_incidencias s
on conflict (municipio_id, subtipo_id) do nothing;

-- ---------------------------------------------------------------------
-- Fan-out: mantener la combinatoria completa cuando se crea un tipo, un
-- subtipo o un municipio nuevo. security definer porque quien dispara el
-- insert (un super-admin autenticado) no tiene permiso de escritura
-- directa sobre municipio_tipos/municipio_subtipos -- solo estos triggers
-- pueden crear filas ahí.
-- ---------------------------------------------------------------------

create or replace function fan_out_tipo_a_municipios()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into municipio_tipos (municipio_id, tipo_id, activo, orden)
  select m.id, new.id, true, new.orden
  from municipios m
  on conflict (municipio_id, tipo_id) do nothing;
  return new;
end;
$$;

drop trigger if exists fan_out_tipo_a_municipios on tipos_incidencias;
create trigger fan_out_tipo_a_municipios
  after insert on tipos_incidencias
  for each row execute function fan_out_tipo_a_municipios();

create or replace function fan_out_subtipo_a_municipios()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into municipio_subtipos (municipio_id, subtipo_id, activo, orden)
  select m.id, new.id, true, new.orden
  from municipios m
  on conflict (municipio_id, subtipo_id) do nothing;
  return new;
end;
$$;

drop trigger if exists fan_out_subtipo_a_municipios on subtipos_incidencias;
create trigger fan_out_subtipo_a_municipios
  after insert on subtipos_incidencias
  for each row execute function fan_out_subtipo_a_municipios();

create or replace function fan_out_municipio_a_tipos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into municipio_tipos (municipio_id, tipo_id, activo, orden)
  select new.id, t.id, true, t.orden
  from tipos_incidencias t
  on conflict (municipio_id, tipo_id) do nothing;

  insert into municipio_subtipos (municipio_id, subtipo_id, activo, orden)
  select new.id, s.id, true, s.orden
  from subtipos_incidencias s
  on conflict (municipio_id, subtipo_id) do nothing;

  return new;
end;
$$;

drop trigger if exists fan_out_municipio_a_tipos on municipios;
create trigger fan_out_municipio_a_tipos
  after insert on municipios
  for each row execute function fan_out_municipio_a_tipos();

-- ---------------------------------------------------------------------
-- RLS: lectura pública (la necesita el propio selector de tipo del
-- ciudadano, useTipos) y escritura de activo/orden restringida al admin
-- de ese municipio o a un super-admin. es_super_admin() viene de la
-- migración 020.
-- ---------------------------------------------------------------------

alter table municipio_tipos enable row level security;
alter table municipio_subtipos enable row level security;

create policy "municipio_tipos: lectura publica" on municipio_tipos
  for select using (true);

create policy "municipio_subtipos: lectura publica" on municipio_subtipos
  for select using (true);

grant select on municipio_tipos to anon, authenticated;
grant select on municipio_subtipos to anon, authenticated;
grant update (activo, orden) on municipio_tipos to authenticated;
grant update (activo, orden) on municipio_subtipos to authenticated;

create policy "municipio_tipos: admin de su municipio o super-admin" on municipio_tipos
  for update
  using (
    es_super_admin()
    or exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id = municipio_tipos.municipio_id)
  )
  with check (
    es_super_admin()
    or exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id = municipio_tipos.municipio_id)
  );

create policy "municipio_subtipos: admin de su municipio o super-admin" on municipio_subtipos
  for update
  using (
    es_super_admin()
    or exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id = municipio_subtipos.municipio_id)
  )
  with check (
    es_super_admin()
    or exists (select 1 from admin_users a where a.id = auth.uid() and a.municipio_id = municipio_subtipos.municipio_id)
  );

-- ---------------------------------------------------------------------
-- tipos_incidencias/subtipos_incidencias: se retira la policy que dejaba
-- a CUALQUIER admin tocar activo/orden global (013) -- ese estado ya no
-- se usa para nada, vive en las tablas puente de arriba. Solo un
-- super-admin sigue pudiendo editar el catálogo base (nombre/descripción/
-- icono/colores/urgencia, vía actualizarTipo/actualizarSubtipo). El
-- trigger restringir_campos_tipo_subtipo (013) queda inofensivo: ya no
-- hay forma de que un admin de municipio llegue a un UPDATE de estas
-- tablas, así que nunca vuelve a dispararse para él.
-- ---------------------------------------------------------------------

drop policy if exists "tipos: cualquier admin activa-desactiva y reordena" on tipos_incidencias;
create policy "tipos: solo super-admin edita" on tipos_incidencias
  for update
  using (es_super_admin())
  with check (es_super_admin());

drop policy if exists "subtipos: cualquier admin activa-desactiva y reordena" on subtipos_incidencias;
create policy "subtipos: solo super-admin edita" on subtipos_incidencias
  for update
  using (es_super_admin())
  with check (es_super_admin());

-- La lectura pública (001) pasa de "solo si activo" a "todo el catálogo":
-- la visibilidad real ahora la decide municipio_tipos/municipio_subtipos,
-- no esta columna.
drop policy if exists "tipos: lectura pública" on tipos_incidencias;
create policy "tipos: lectura publica" on tipos_incidencias
  for select using (true);

drop policy if exists "subtipos: lectura pública" on subtipos_incidencias;
create policy "subtipos: lectura publica" on subtipos_incidencias
  for select using (true);
