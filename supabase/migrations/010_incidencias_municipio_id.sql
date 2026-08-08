-- REPORTA · Fase 1 · Modelo multi-municipio (paso 2: aislar incidencias por municipio)
--
-- Añade municipio_id a incidencias_anonimas y hace el backfill de todas las
-- filas existentes al municipio "almeria" (creado en 009), de forma que la
-- migración no rompe ningún dato ya publicado en producción.
--
-- Nota sobre RLS: no se toca la policy pública de lectura ("incidencias:
-- lectura pública", en 001) porque las incidencias no son un dato sensible
-- por municipio -- son quejas ciudadanas ya públicas hoy para cualquiera.
-- El filtro por municipio lo aplica el frontend en la query (igual que ya
-- hace con tipo_id/estado), no la base de datos. El aislamiento que sí debe
-- vivir en RLS es el de permisos de administración (Fase 2), sobre datos que
-- si son sensibles: qué admin puede moderar o cambiar el estado de qué.

alter table incidencias_anonimas
  add column if not exists municipio_id uuid references municipios(id);

update incidencias_anonimas
  set municipio_id = (select id from municipios where slug = 'almeria')
  where municipio_id is null;

alter table incidencias_anonimas
  alter column municipio_id set not null;

create index if not exists idx_incidencias_municipio on incidencias_anonimas (municipio_id);
