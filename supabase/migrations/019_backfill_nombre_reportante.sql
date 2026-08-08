-- REPORTA · Backfill puntual de nombre_reportante
--
-- nombre_reportante (017) se guarda solo al crear la incidencia. Las
-- incidencias verificadas creadas antes de ese cambio (mientras se
-- probaba la Fase 3, con usuario_id ya presente) se quedaron sin nombre.
-- Backfill único con el nombre actual de auth.users para esas filas.

update incidencias_anonimas i
set nombre_reportante = u.raw_user_meta_data->>'nombre'
from auth.users u
where i.usuario_id = u.id
  and i.nombre_reportante is null
  and u.raw_user_meta_data->>'nombre' is not null;
