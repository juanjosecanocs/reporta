-- REPORTA · Fix: el cliente anónimo no podía enlazar la foto con su
-- incidencia porque no existía ninguna policy de UPDATE (a propósito, para
-- que nadie pueda editar incidencias ajenas). El flujo de creación necesita
-- un UPDATE puntual de imagen_id/imagen_url justo tras crear la incidencia.
--
-- Solución de mínimo privilegio: solo se conceden esas dos columnas a nivel
-- de grant, y la policy solo permite el update mientras la incidencia aún
-- no tiene imagen asignada (no se puede sustituir una imagen ya enlazada).

grant update (imagen_id, imagen_url) on incidencias_anonimas to anon;

create policy "incidencias: adjuntar imagen tras crear" on incidencias_anonimas
  for update
  using (imagen_id is null)
  with check (true);
