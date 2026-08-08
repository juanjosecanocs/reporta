-- REPORTA · Fase 2 · Roles de administración por municipio
--
-- admin_users gana municipio_id (nullable). NULL = super-admin (ve y modera
-- incidencias de todos los municipios, como hacía cualquier admin hasta
-- ahora); un valor = admin acotado a ese municipio. Dejar municipio_id en
-- NULL para los admins ya existentes preserva exactamente su acceso actual,
-- no rompe nada de lo ya construido.
--
-- Se sustituyen las dos policies de incidencias_anonimas que daban acceso
-- total a cualquier fila de admin_users (005_panel_admin.sql) por versiones
-- que comprueban el municipio. No se toca la policy de admin_users sobre sí
-- misma (un usuario ve su propia fila) porque no es recursiva y no necesita
-- cambios -- el bug de recursión de 006_fix_admin_users_rls_recursiva.sql
-- era por una policy DE admin_users que consultaba admin_users; estas
-- policies están en incidencias_anonimas y consultan admin_users desde
-- fuera, que es justo el caso que la nota de 006 señalaba como seguro.

alter table admin_users add column if not exists municipio_id uuid references municipios(id);

drop policy if exists "incidencias: los admins ven todas, incluidas borradas" on incidencias_anonimas;
create policy "incidencias: los admins ven las de su municipio o todas si es super-admin" on incidencias_anonimas
  for select
  using (
    exists (
      select 1 from admin_users a
      where a.id = auth.uid()
        and (a.municipio_id is null or a.municipio_id = incidencias_anonimas.municipio_id)
    )
  );

drop policy if exists "incidencias: los admins cambian estado y borrado logico" on incidencias_anonimas;
create policy "incidencias: los admins moderan las de su municipio o todas si es super-admin" on incidencias_anonimas
  for update
  using (
    exists (
      select 1 from admin_users a
      where a.id = auth.uid()
        and (a.municipio_id is null or a.municipio_id = incidencias_anonimas.municipio_id)
    )
  )
  with check (
    exists (
      select 1 from admin_users a
      where a.id = auth.uid()
        and (a.municipio_id is null or a.municipio_id = incidencias_anonimas.municipio_id)
    )
  );
