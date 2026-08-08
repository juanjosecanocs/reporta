-- REPORTA · Límite de longitud del comentario de incidencia
--
-- descripcion_corta era texto sin límite, tanto en BD como en el
-- formulario. Reporta no es una red social: el comentario debe servir para
-- explicar la incidencia, no para publicar texto extenso. 300 caracteres
-- (similar a un tuit) es suficiente para lo primero y corta lo segundo.
--
-- NOT VALID porque no hace falta revalidar retroactivamente: hoy el
-- comentario más largo ya existente tiene 34 caracteres.

alter table incidencias_anonimas
  add constraint incidencias_descripcion_max_300
  check (descripcion_corta is null or char_length(descripcion_corta) <= 300) not valid;
