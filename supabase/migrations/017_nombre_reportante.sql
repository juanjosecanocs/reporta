-- REPORTA · Nombre del reportante en la incidencia
--
-- La Fase 4 ya permite a un admin ver el CORREO de quien reportó una
-- incidencia verificada (vía RPC, admin-only). Pero ni el mapa público ni
-- el panel de admin mostraban el NOMBRE en ningún sitio -- se guardaba en
-- auth.users.raw_user_meta_data pero nunca se leía. En vez de exponer un
-- RPC público de "nombre por uuid" (una llamada por cada punto que se
-- pulsa en el mapa), se guarda como snapshot en la propia incidencia al
-- crearla, igual que ya se hace con uuid_cliente o codigo_seguimiento.
--
-- Solo puede llevar nombre si lleva usuario_id, misma regla que ya rige
-- para imagen_url/descripcion_corta.

alter table incidencias_anonimas
  add column if not exists nombre_reportante varchar(100);

alter table incidencias_anonimas
  add constraint incidencias_nombre_requiere_usuario
  check (nombre_reportante is null or usuario_id is not null) not valid;
