-- REPORTA · Fix: la policy de SELECT en storage.objects permitía listar
-- (enumerar) todos los ficheros del bucket, no solo leerlos por URL
-- conocida. El bucket ya es público (basta para que las <img> funcionen
-- con la URL devuelta por getPublicUrl), así que esta policy sobraba y
-- exponía más de lo previsto: cualquiera podía listar todas las fotos
-- subidas por otros ciudadanos.

drop policy if exists "incidencias-bucket: lectura pública" on storage.objects;
