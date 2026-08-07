-- REPORTA · 4 tipos nuevos + 37 subtipos
--
-- Algunos nombres de subtipo se repiten entre categorías (p. ej. "Aire
-- acondicionado averiado" en Deportivas y en Edificios; "Aseos
-- inoperativos" y "Presencia plagas" en ambas; "Banco roto" ya existía
-- en Limpieza viaria). Como el id de subtipo es único a nivel global,
-- cada uno lleva un sufijo de contexto en el id aunque el texto visible
-- (nombre) coincida o sea muy parecido.

insert into tipos_incidencias (id, nombre, color_primario, color_secundario, orden, activo) values
('deportivas', 'Instalaciones deportivas', '#1E88E5', '#64B5F6', 9, true),
('patrimonio', 'Patrimonio histórico', '#8E44AD', '#C39BD3', 10, true),
('edificios', 'Edificios públicos', '#607D8B', '#90A4AE', 11, true),
('mobiliario', 'Mobiliario urbano', '#5C6BC0', '#9FA8DA', 12, true)
on conflict (id) do nothing;

-- Instalaciones deportivas
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('aire_acondicionado_deportivo', 'deportivas', 'Aire acondicionado averiado', 3, 1, true),
('sin_agua_deportivo', 'deportivas', 'Sin agua/agua caliente', 4, 2, true),
('piscina_inoperativa', 'deportivas', 'Piscina inoperativa', 4, 3, true),
('maquinaria_danada_deportivo', 'deportivas', 'Maquinaria dañada', 3, 4, true),
('terreno_juego_danado', 'deportivas', 'Terreno de juego dañado', 3, 5, true),
('vestuarios_desperfectos', 'deportivas', 'Vestuarios con desperfectos', 2, 6, true),
('accesos_incidencias_deportivo', 'deportivas', 'Accesos con incidencias', 3, 7, true),
('ruidos_vibraciones', 'deportivas', 'Ruidos/Vibraciones', 2, 8, true),
('aseos_inoperativos_deportivo', 'deportivas', 'Aseos inoperativos', 3, 9, true),
('presencia_plagas_deportivo', 'deportivas', 'Presencia plagas', 4, 10, true)
on conflict (id) do nothing;

-- Patrimonio histórico
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('vandalismo_patrimonio', 'patrimonio', 'Vandalismo', 4, 1, true),
('grafitis_patrimonio', 'patrimonio', 'Grafitis', 3, 2, true),
('inscripciones_degradadas', 'patrimonio', 'Inscripciones degradadas', 2, 3, true),
('humedades_patrimonio', 'patrimonio', 'Humedades', 3, 4, true),
('desprendimientos_patrimonio', 'patrimonio', 'Desprendimientos', 5, 5, true),
('cierres_preventivos', 'patrimonio', 'Cierres preventivos', 3, 6, true),
('sin_personal_vigilancia', 'patrimonio', 'Sin personal/Vigilancia', 2, 7, true),
('erosion_fortificaciones', 'patrimonio', 'Erosión fortificaciones', 4, 8, true),
('fuente_patrimonio_sin_agua', 'patrimonio', 'Fuentes sin agua', 2, 9, true),
('entorno_degradado_patrimonio', 'patrimonio', 'Entorno degradado', 2, 10, true)
on conflict (id) do nothing;

-- Edificios públicos
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('cubiertas_edificio', 'edificios', 'Cubiertas', 4, 1, true),
('desprendimientos_exteriores_edificio', 'edificios', 'Desprendimientos exteriores', 5, 2, true),
('falsos_techos', 'edificios', 'Falsos techos', 3, 3, true),
('aire_acondicionado_edificio', 'edificios', 'Aire acondicionado averiado', 3, 4, true),
('mobiliario_danado_edificio', 'edificios', 'Mobiliario dañado', 2, 5, true),
('accesos_edificio', 'edificios', 'Accesos', 3, 6, true),
('ascensores_averiados', 'edificios', 'Ascensores averiados', 4, 7, true),
('aseos_inoperativos_edificio', 'edificios', 'Aseos inoperativos', 3, 8, true),
('presencia_plagas_edificio', 'edificios', 'Presencia plagas', 4, 9, true)
on conflict (id) do nothing;

-- Mobiliario urbano
insert into subtipos_incidencias (id, tipo_id, nombre, urgencia, orden, activo) values
('banco_roto_urbano', 'mobiliario', 'Banco roto', 2, 1, true),
('semaforo_fuera_servicio', 'mobiliario', 'Semáforo fuera de servicio', 5, 2, true),
('senal_arrancada', 'mobiliario', 'Señal arrancada', 4, 3, true),
('mupi_totem_vandalizado', 'mobiliario', 'MUPI/Tótem vandalizado', 2, 4, true),
('marquesina_sucia', 'mobiliario', 'Marquesina sucia', 2, 5, true),
('aparca_bicis_roto', 'mobiliario', 'Aparca bicis roto', 2, 6, true),
('punto_recarga_fuera_servicio', 'mobiliario', 'Punto de recarga fuera de servicio', 3, 7, true),
('pergola_estropeada', 'mobiliario', 'Pérgola estropeada', 2, 8, true)
on conflict (id) do nothing;
