-- REPORTA · Fase 1 · Modelo multi-municipio (paso 1: catálogo de municipios)
--
-- Introduce el concepto de "host de municipio" que hasta ahora no existía:
-- cada municipio es una fila con su propio centro/zoom de mapa y el slug que
-- debe coincidir con el subdominio (almeria.midominio.es -> slug 'almeria').
-- Con dominio propio ya conectado (Fase 0/5), el frontend resuelve el slug
-- real desde el subdominio (ej. almeria.app-reporta.es); en localhost y
-- *.netlify.app sigue cayendo al slug por defecto.

create table if not exists municipios (
  id uuid primary key default gen_random_uuid(),
  slug varchar(50) unique not null,
  nombre varchar(100) not null,
  centro_lat decimal(10, 8) not null,
  centro_lng decimal(11, 8) not null,
  zoom_inicial numeric default 12,
  activo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_municipios_slug on municipios (slug);
create index if not exists idx_municipios_activo on municipios (activo);

alter table municipios enable row level security;

create policy "municipios: lectura pública" on municipios
  for select using (activo = true);

-- Nota: sin policy de insert/update pública a propósito. El alta de un
-- municipio nuevo se hace desde el SQL Editor / Table Editor de Supabase con
-- el rol de servicio, igual que se hace hoy con admin_users. Un panel de
-- gestión de municipios queda fuera del alcance de esta fase.

-- Seed: el municipio que ya existe hoy en producción (centro y zoom tomados
-- de la constante ALMERIA_CENTRO que hasta ahora estaba fija en el mapa).
insert into municipios (slug, nombre, centro_lat, centro_lng, zoom_inicial, activo) values
('almeria', 'Almería', 36.8381, -2.4637, 12, true)
on conflict (slug) do nothing;
