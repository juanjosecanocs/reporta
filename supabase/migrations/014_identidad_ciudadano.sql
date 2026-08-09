-- REPORTA · Fase 3 · Identidad de ciudadano y doble flujo
--
-- Hasta ahora cualquiera podía crear una incidencia con foto y comentario
-- sin dejar ningún rastro de quién la publicó (RLS: "creación anónima" con
-- check(true), y una policy de storage que permitía subir fotos al bucket
-- sin autenticarse). Eso es el riesgo real que motiva esta fase: sin nombre
-- y correo verificado detrás, no hay forma de moderar contenido inadecuado
-- con consecuencias.
--
-- A partir de aquí:
--   - Reportar tipo/subtipo/ubicación sigue funcionando exactamente igual,
--     sin cuenta (uuid_cliente sigue siendo el único rastro, como hoy).
--   - Adjuntar foto o comentario exige una cuenta de Supabase Auth con el
--     email verificado. Se comprueba en tres sitios independientes: la
--     policy de INSERT, la policy de UPDATE que enlaza la foto, y un CHECK
--     constraint en la propia tabla (por si alguna de las policies tuviera
--     un fallo, el constraint no depende de RLS).
--
-- Nota operativa: para que "email verificado" signifique algo hay que
-- comprobar en el Dashboard de Supabase (Authentication > Providers > Email)
-- que "Confirm email" esté activado, y que la Site URL / Redirect URLs
-- incluyan el dominio de la app (app-reporta.es, sus subdominios de
-- municipio y localhost). Eso no se puede hacer por SQL, es configuración
-- de proyecto.

alter table incidencias_anonimas
  add column if not exists usuario_id uuid references auth.users(id);

create index if not exists idx_incidencias_usuario on incidencias_anonimas (usuario_id);

-- Helper de solo lectura sobre auth.users (no accesible directamente para
-- anon/authenticated): expone únicamente "¿este usuario tiene el email
-- verificado?" como booleano, nada más de su fila.
create or replace function email_verificado(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from auth.users where id = uid and email_confirmed_at is not null
  );
$$;

revoke all on function email_verificado(uuid) from public;
grant execute on function email_verificado(uuid) to anon, authenticated;

-- CHECK de defensa en profundidad: no depende de qué policy de RLS se haya
-- evaluado. NOT VALID porque ya hay incidencias antiguas (antes de esta
-- fase) con foto/comentario y sin usuario_id -- no se revalidan con
-- retroactividad, la regla rige para escrituras nuevas en adelante.
alter table incidencias_anonimas
  add constraint incidencias_foto_comentario_requiere_usuario_verificado
  check (
    (imagen_url is null and descripcion_corta is null)
    or (usuario_id is not null and email_verificado(usuario_id))
  ) not valid;

-- INSERT: anónimo sin foto/comentario, o usuario verificado que se declara
-- a sí mismo (no se puede crear una incidencia "en nombre" de otro usuario).
drop policy if exists "incidencias: creación anónima" on incidencias_anonimas;

create policy "incidencias: creacion anonima limitada o de usuario verificado" on incidencias_anonimas
  for insert
  with check (
    (usuario_id is null and descripcion_corta is null and imagen_url is null)
    or (usuario_id = auth.uid() and email_verificado(usuario_id))
  );

-- UPDATE de imagen_id/imagen_url: ya no es un privilegio de "anon" (permitía
-- a cualquiera adjuntar foto a su propia incidencia recién creada). Pasa a
-- requerir sesión de usuario verificado, dueño de la incidencia.
revoke update (imagen_id, imagen_url) on incidencias_anonimas from anon;
grant update (imagen_id, imagen_url) on incidencias_anonimas to authenticated;

drop policy if exists "incidencias: adjuntar imagen tras crear" on incidencias_anonimas;

create policy "incidencias: adjuntar imagen solo el autor verificado" on incidencias_anonimas
  for update
  using (imagen_id is null and usuario_id = auth.uid())
  with check (usuario_id = auth.uid() and email_verificado(usuario_id));

-- Storage: subir al bucket "incidencias" también pasa a requerir usuario
-- verificado (antes cualquiera podía subir un fichero sin autenticarse).
drop policy if exists "incidencias-bucket: subida anónima" on storage.objects;

create policy "incidencias-bucket: subida solo usuario verificado" on storage.objects
  for insert
  with check (bucket_id = 'incidencias' and auth.uid() is not null and email_verificado(auth.uid()));
