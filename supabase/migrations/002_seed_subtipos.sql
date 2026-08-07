-- REPORTA · Sprint 2 · Seed completo de subtipos (60+ en total)
-- Completa los subtipos de los 7 tipos que en 001 solo tenían el tipo
-- creado pero sin subtipos (Limpieza viaria ya se sembró en 001).

-- Recogida de residuos
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('contenedor_lleno', 'recogida', 'Contenedor lleno o desbordado', 3, 1, true),
('contenedor_roto', 'recogida', 'Contenedor roto o dañado', 2, 2, true),
('tapa_rota', 'recogida', 'Tapa de contenedor rota', 2, 3, true),
('pedal_averiado', 'recogida', 'Pedal averiado', 2, 4, true),
('contenedor_quemado', 'recogida', 'Contenedor quemado', 4, 5, true),
('olor_contenedor', 'recogida', 'Malos olores', 2, 6, true),
('recogida_no_realizada', 'recogida', 'Recogida no realizada', 3, 7, true),
('vertido_fuera_contenedor', 'recogida', 'Residuos fuera del contenedor', 3, 8, true)
on conflict (id) do nothing;

-- Playas
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('ducha_averiada', 'playas', 'Ducha averiada', 2, 1, true),
('papelera_playa_llena', 'playas', 'Papelera llena', 2, 2, true),
('pasarela_danada', 'playas', 'Pasarela dañada', 3, 3, true),
('aseo_sucio', 'playas', 'Aseos sucios', 3, 4, true),
('fuente_playa_averiada', 'playas', 'Fuente averiada', 2, 5, true),
('arena_sucia', 'playas', 'Arena sucia o con residuos', 3, 6, true),
('senalizacion_socorrismo', 'playas', 'Señalización de socorrismo dañada', 4, 7, true),
('accesibilidad_playa', 'playas', 'Acceso accesible dañado', 3, 8, true)
on conflict (id) do nothing;

-- Jardines
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('arbol_caido', 'jardines', 'Árbol caído o en riesgo de caída', 5, 1, true),
('riego_averiado', 'jardines', 'Riego averiado', 2, 2, true),
('cesped_deteriorado', 'jardines', 'Césped deteriorado', 1, 3, true),
('alcorque_danado', 'jardines', 'Alcorque dañado', 2, 4, true),
('poda_necesaria', 'jardines', 'Poda necesaria', 2, 5, true),
('zona_verde_abandonada', 'jardines', 'Zona verde abandonada', 2, 6, true),
('mobiliario_jardin_roto', 'jardines', 'Mobiliario de jardín roto', 2, 7, true),
('plaga_vegetal', 'jardines', 'Plaga en la vegetación', 3, 8, true)
on conflict (id) do nothing;

-- Insectos
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('mosquitos', 'insectos', 'Mosquitos', 3, 1, true),
('cucarachas', 'insectos', 'Cucarachas', 3, 2, true),
('pulgas', 'insectos', 'Pulgas', 3, 3, true),
('garrapatas', 'insectos', 'Garrapatas', 3, 4, true),
('hormigas', 'insectos', 'Hormigas', 2, 5, true),
('avispas_abejas', 'insectos', 'Avispas o abejas', 4, 6, true),
('chinches', 'insectos', 'Chinches', 3, 7, true),
('procesionaria', 'insectos', 'Procesionaria del pino', 5, 8, true)
on conflict (id) do nothing;

-- Fauna
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('roedores', 'fauna', 'Roedores (ratas o ratones)', 4, 1, true),
('palomas', 'fauna', 'Exceso de palomas', 2, 2, true),
('gaviotas', 'fauna', 'Gaviotas problemáticas', 2, 3, true),
('animal_abandonado', 'fauna', 'Animal abandonado', 3, 4, true),
('animal_muerto', 'fauna', 'Animal muerto en vía pública', 4, 5, true),
('colonia_felina', 'fauna', 'Colonia felina sin control', 2, 6, true),
('nido_conflictivo', 'fauna', 'Nido en zona conflictiva', 3, 7, true),
('jabalies', 'fauna', 'Jabalíes en zona urbana', 4, 8, true)
on conflict (id) do nothing;

-- Áreas infantiles
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('juego_roto', 'infantiles', 'Juego infantil roto', 4, 1, true),
('suelo_amortiguacion', 'infantiles', 'Suelo de amortiguación dañado', 4, 2, true),
('vallado_danado', 'infantiles', 'Vallado dañado', 3, 3, true),
('cartel_normativa', 'infantiles', 'Cartelería o normativa dañada/ausente', 1, 4, true),
('sombra_insuficiente', 'infantiles', 'Falta de sombra', 1, 5, true),
('suciedad_area_infantil', 'infantiles', 'Suciedad en el área', 2, 6, true),
('columpio_averiado', 'infantiles', 'Columpio averiado', 4, 7, true),
('tobogan_averiado', 'infantiles', 'Tobogán averiado', 4, 8, true)
on conflict (id) do nothing;

-- Alumbrado público
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('farola_apagada', 'alumbrado', 'Farola apagada', 3, 1, true),
('farola_parpadeante', 'alumbrado', 'Farola parpadeante', 2, 2, true),
('farola_rota', 'alumbrado', 'Farola rota o dañada', 3, 3, true),
('farola_encendida_dia', 'alumbrado', 'Farola encendida de día', 1, 4, true),
('cableado_expuesto', 'alumbrado', 'Cableado expuesto', 5, 5, true),
('poste_inclinado', 'alumbrado', 'Poste inclinado', 4, 6, true),
('zona_sin_iluminacion', 'alumbrado', 'Zona sin iluminación suficiente', 3, 7, true),
('cuadro_control_averiado', 'alumbrado', 'Cuadro de control averiado', 3, 8, true)
on conflict (id) do nothing;
