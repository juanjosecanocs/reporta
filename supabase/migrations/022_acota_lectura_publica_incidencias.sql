-- REPORTA · Cierra la fuga de incidencias entre municipios
--
-- "incidencias: lectura pública" (001, de la Fase 1 mono-municipio) deja
-- pasar cualquier fila no borrada a cualquiera (sin restricción de rol ni
-- de municipio) y nunca se acotó al llegar el multi-municipio (011). Como
-- RLS combina las policies permisivas con OR, esa policy amplia hacía
-- irrelevante la policy de admin acotada por municipio (011): un admin
-- municipal (o cualquiera con la anon key, sin sesión) podía leer
-- directamente de la tabla incidencias de CUALQUIER municipio, con foto,
-- comentario y nombre del reportante incluidos -- el panel de admin y el
-- mapa ciudadano ya filtraban en su propia consulta, pero esa era la
-- única protección real, no la base de datos.
--
-- 1) La policy pública se acota para que NO aplique a cuentas de
--    admin_users: un admin (municipal o general) pasa a depender
--    exclusivamente de la policy de 011, que sí respeta su municipio.
--    Un ciudadano normal (anon o autenticado sin fila en admin_users)
--    sigue viendo el mapa de incidencias activas exactamente igual que
--    hasta ahora -- esto no le afecta.
--
-- 2) El buscador de "Mi historial" por código de seguimiento necesita
--    consultar sin filtrar por municipio a propósito (un ciudadano puede
--    consultar su código desde cualquier subdominio), así que se saca de
--    la tabla a dos RPC de solo lectura que devuelven exclusivamente
--    columnas no sensibles (nada de foto, comentario, nombre ni
--    usuario_id) -- mismo patrón que email_verificado (014) y
--    admin_email_usuario (016).

drop policy if exists "incidencias: lectura pública" on incidencias_anonimas;
create policy "incidencias: lectura publica salvo admins" on incidencias_anonimas
  for select
  using (
    deleted_at is null
    and not exists (select 1 from admin_users a where a.id = auth.uid())
  );

create or replace function estados_por_codigos(codigos text[])
returns table (codigo_seguimiento text, estado text, updated_at timestamp)
language sql
stable
security definer
set search_path = public
as $$
  select codigo_seguimiento, estado, updated_at
  from incidencias_anonimas
  where codigo_seguimiento = any(codigos)
    and deleted_at is null;
$$;

revoke all on function estados_por_codigos(text[]) from public;
grant execute on function estados_por_codigos(text[]) to anon, authenticated;

create or replace function incidencia_por_codigo(codigo text)
returns table (codigo_seguimiento text, tipo_id text, subtipo_id text, estado text, created_at timestamp)
language sql
stable
security definer
set search_path = public
as $$
  select codigo_seguimiento, tipo_id, subtipo_id, estado, created_at
  from incidencias_anonimas
  where codigo_seguimiento = codigo
    and deleted_at is null
  limit 1;
$$;

revoke all on function incidencia_por_codigo(text) from public;
grant execute on function incidencia_por_codigo(text) to anon, authenticated;
