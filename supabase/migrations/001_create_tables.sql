-- REPORTA · Sprint 1 · Esquema base (Fase 1: 100% anónima)
-- Ejecutar en el SQL Editor de Supabase o vía `supabase db push`.

create extension if not exists pgcrypto;

-- =========================================================
-- TABLA: tipos_incidencias (dinámicos, cargados desde la BD)
-- =========================================================
create table if not exists tipos_incidencias (
  id varchar(50) primary key,
  nombre varchar(100) not null,
  descripcion text,
  icono_name varchar(50),
  color_primario varchar(7) not null,
  color_secundario varchar(7),
  orden int,
  activo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_tipos_orden on tipos_incidencias (orden);
create index if not exists idx_tipos_activo on tipos_incidencias (activo);

-- =========================================================
-- TABLA: subtipos_incidencias
-- =========================================================
create table if not exists subtipos_incidencias (
  id varchar(100) primary key,
  tipo_id varchar(50) not null references tipos_incidencias(id),
  nombre varchar(200) not null,
  descripcion text,
  icono_name varchar(50),
  urgencia int default 3,
  orden int,
  activo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_subtipos_tipo on subtipos_incidencias (tipo_id);
create index if not exists idx_subtipos_tipo_activo on subtipos_incidencias (tipo_id, activo);

-- =========================================================
-- TABLA: incidencias_anonimas
-- =========================================================
create table if not exists incidencias_anonimas (
  id uuid primary key default gen_random_uuid(),
  tipo_id varchar(50) not null references tipos_incidencias(id),
  subtipo_id varchar(100) not null references subtipos_incidencias(id),
  latitud decimal(10, 8) not null,
  longitud decimal(11, 8) not null,
  direccion varchar(255),
  imagen_id uuid,
  imagen_url text,
  descripcion_corta text,
  estado varchar(20) default 'pendiente',
  codigo_seguimiento varchar(6) unique not null,
  uuid_cliente varchar(36),
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp,
  deleted_reason text
);

create index if not exists idx_incidencias_codigo on incidencias_anonimas (codigo_seguimiento);
create index if not exists idx_incidencias_latlong on incidencias_anonimas (latitud, longitud);
create index if not exists idx_incidencias_tipo on incidencias_anonimas (tipo_id);
create index if not exists idx_incidencias_created on incidencias_anonimas (created_at desc);

-- =========================================================
-- TABLA: images
-- =========================================================
create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  incidencia_id uuid not null references incidencias_anonimas(id),
  storage_path varchar(255),
  "tamaño_bytes" int,
  mime_type varchar(20),
  comprimida boolean,
  original_size_bytes int,
  compression_ratio float,
  created_at timestamp default now()
);

create index if not exists idx_images_incidencia on images (incidencia_id);

alter table incidencias_anonimas
  add constraint fk_incidencias_imagen foreign key (imagen_id) references images(id);

-- =========================================================
-- TABLA: admin_users (para Panel Admin, Fase 1.5)
-- =========================================================
create table if not exists admin_users (
  id uuid primary key,
  email varchar(255) unique,
  rol varchar(20),
  created_at timestamp default now()
);

-- =========================================================
-- Row Level Security — Fase 1: acceso anónimo (sin login)
-- =========================================================
alter table tipos_incidencias enable row level security;
alter table subtipos_incidencias enable row level security;
alter table incidencias_anonimas enable row level security;
alter table images enable row level security;

create policy "tipos: lectura pública" on tipos_incidencias
  for select using (activo = true);

create policy "subtipos: lectura pública" on subtipos_incidencias
  for select using (activo = true);

create policy "incidencias: lectura pública" on incidencias_anonimas
  for select using (deleted_at is null);

create policy "incidencias: creación anónima" on incidencias_anonimas
  for insert with check (true);

create policy "images: lectura pública" on images
  for select using (true);

create policy "images: creación anónima" on images
  for insert with check (true);

-- Nota: updates de incidencias/images (moderación, cambio de estado) se
-- restringen a service_role / admin_users en Fase 1.5, no hay policy de
-- update/delete pública a propósito.

-- =========================================================
-- Storage bucket para fotos de incidencias
-- =========================================================
insert into storage.buckets (id, name, public)
values ('incidencias', 'incidencias', true)
on conflict (id) do nothing;

create policy "incidencias-bucket: lectura pública"
  on storage.objects for select
  using (bucket_id = 'incidencias');

create policy "incidencias-bucket: subida anónima"
  on storage.objects for insert
  with check (bucket_id = 'incidencias');

-- =========================================================
-- Seed: tipos (colores corporativos Almerienses)
-- =========================================================
insert into tipos_incidencias (id, nombre, color_primario, color_secundario, orden, activo) values
('limpieza', 'Limpieza viaria', '#D32F2F', '#FF6B6B', 1, true),
('recogida', 'Recogida de residuos', '#F7931E', '#FFB366', 2, true),
('playas', 'Playas', '#4ECDC4', '#6FE0DB', 3, true),
('jardines', 'Jardines', '#95D236', '#B8E986', 4, true),
('insectos', 'Insectos', '#043F63', '#0A5A8A', 5, true),
('fauna', 'Fauna', '#8B4513', '#A0622E', 6, true),
('infantiles', 'Áreas infantiles', '#FFB6C1', '#FFD4E0', 7, true),
('alumbrado', 'Alumbrado público', '#FFE66D', '#FFF5AA', 8, true)
on conflict (id) do nothing;

-- Seed: subtipos de "Limpieza viaria"
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('acera_calzada', 'limpieza', 'Acera o calzada', 3, 1, true),
('excrementos', 'limpieza', 'Excrementos animales', 4, 2, true),
('malas_hierbas', 'limpieza', 'Malas hierbas', 2, 3, true),
('banco_roto', 'limpieza', 'Banco roto', 2, 4, true),
('papelera', 'limpieza', 'Papelera sucia', 3, 5, true),
('graffiti', 'limpieza', 'Graffiti', 2, 6, true)
on conflict (id) do nothing;
