-- REPORTA · Gestión de tipos/subtipos desde el panel admin
--
-- 1) Permisos de escritura para admins sobre tipos_incidencias y
--    subtipos_incidencias (antes solo existía SELECT público). Mismo
--    patrón que ya usamos en incidencias_anonimas/admin_users: solo un
--    usuario autenticado presente en admin_users puede crear, editar,
--    reordenar o borrar tipos y subtipos.
--
-- 2) Backfill de la columna icono_name (existía desde 001 pero nunca se
--    había usado: el emoji vivía hardcodeado en src/data/iconos.ts).
--    A partir de ahora la base de datos es la fuente de verdad del
--    icono, para que los tipos/subtipos creados desde el panel admin
--    tengan icono sin tocar código. El valor de este backfill se generó
--    programáticamente desde iconos.ts para no transcribir a mano.

grant insert, update, delete on tipos_incidencias to authenticated;
grant insert, update, delete on subtipos_incidencias to authenticated;

create policy "tipos: admin gestiona" on tipos_incidencias
  for all
  using (exists (select 1 from admin_users a where a.id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.id = auth.uid()));

create policy "subtipos: admin gestiona" on subtipos_incidencias
  for all
  using (exists (select 1 from admin_users a where a.id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.id = auth.uid()));

-- Backfill icono_name para tipos
update tipos_incidencias set icono_name = case id
  when 'limpieza' then '🧹'
  when 'recogida' then '🗑️'
  when 'playas' then '🏖️'
  when 'jardines' then '🌳'
  when 'insectos' then '🐞'
  when 'fauna' then '🐦'
  when 'infantiles' then '🛝'
  when 'alumbrado' then '💡'
  when 'deportivas' then '🏟️'
  when 'patrimonio' then '🏛️'
  when 'edificios' then '🏢'
  when 'mobiliario' then '🚏'
end where id in ('limpieza', 'recogida', 'playas', 'jardines', 'insectos', 'fauna', 'infantiles', 'alumbrado', 'deportivas', 'patrimonio', 'edificios', 'mobiliario');

-- Backfill icono_name para subtipos
update subtipos_incidencias set icono_name = case id
  when 'acera_calzada' then '🚶'
  when 'excrementos' then '💩'
  when 'malas_hierbas' then '🌱'
  when 'banco_roto' then '🪑'
  when 'papelera' then '🗑️'
  when 'graffiti' then '🎨'
  when 'contenedor_lleno' then '🗑️'
  when 'contenedor_roto' then '🗑️'
  when 'tapa_rota' then '🗑️'
  when 'pedal_averiado' then '🔧'
  when 'contenedor_quemado' then '🔥'
  when 'olor_contenedor' then '🤢'
  when 'recogida_no_realizada' then '🚛'
  when 'vertido_fuera_contenedor' then '🚯'
  when 'ducha_averiada' then '🚿'
  when 'papelera_playa_llena' then '🗑️'
  when 'pasarela_danada' then '🪵'
  when 'aseo_sucio' then '🚻'
  when 'fuente_playa_averiada' then '⛲'
  when 'arena_sucia' then '🏝️'
  when 'senalizacion_socorrismo' then '🚩'
  when 'accesibilidad_playa' then '♿'
  when 'arbol_caido' then '🪵'
  when 'riego_averiado' then '💧'
  when 'cesped_deteriorado' then '🌾'
  when 'alcorque_danado' then '🕳️'
  when 'poda_necesaria' then '✂️'
  when 'zona_verde_abandonada' then '🥀'
  when 'mobiliario_jardin_roto' then '🪑'
  when 'plaga_vegetal' then '🐛'
  when 'mosquitos' then '🦟'
  when 'cucarachas' then '🪳'
  when 'pulgas' then '🦗'
  when 'garrapatas' then '🕷️'
  when 'hormigas' then '🐜'
  when 'avispas_abejas' then '🐝'
  when 'chinches' then '🦠'
  when 'procesionaria' then '🐛'
  when 'roedores' then '🐀'
  when 'palomas' then '🕊️'
  when 'gaviotas' then '🐦'
  when 'animal_abandonado' then '🐕'
  when 'animal_muerto' then '⚠️'
  when 'colonia_felina' then '🐈'
  when 'nido_conflictivo' then '🪹'
  when 'jabalies' then '🐗'
  when 'juego_roto' then '🛝'
  when 'suelo_amortiguacion' then '🟫'
  when 'vallado_danado' then '🚧'
  when 'cartel_normativa' then '🪧'
  when 'sombra_insuficiente' then '☂️'
  when 'suciedad_area_infantil' then '🧹'
  when 'columpio_averiado' then '⛓️'
  when 'tobogan_averiado' then '🛝'
  when 'farola_apagada' then '🌑'
  when 'farola_parpadeante' then '⚡'
  when 'farola_rota' then '💥'
  when 'farola_encendida_dia' then '☀️'
  when 'cableado_expuesto' then '🔌'
  when 'poste_inclinado' then '⚠️'
  when 'zona_sin_iluminacion' then '🌃'
  when 'cuadro_control_averiado' then '🎛️'
  when 'aire_acondicionado_deportivo' then '❄️'
  when 'sin_agua_deportivo' then '🚿'
  when 'piscina_inoperativa' then '🏊'
  when 'maquinaria_danada_deportivo' then '⚙️'
  when 'terreno_juego_danado' then '⚽'
  when 'vestuarios_desperfectos' then '🚪'
  when 'accesos_incidencias_deportivo' then '🚧'
  when 'ruidos_vibraciones' then '🔊'
  when 'aseos_inoperativos_deportivo' then '🚻'
  when 'presencia_plagas_deportivo' then '🐀'
  when 'vandalismo_patrimonio' then '🔨'
  when 'grafitis_patrimonio' then '🎨'
  when 'inscripciones_degradadas' then '📜'
  when 'humedades_patrimonio' then '💧'
  when 'desprendimientos_patrimonio' then '🪨'
  when 'cierres_preventivos' then '🚫'
  when 'sin_personal_vigilancia' then '👤'
  when 'erosion_fortificaciones' then '🏰'
  when 'fuente_patrimonio_sin_agua' then '⛲'
  when 'entorno_degradado_patrimonio' then '🥀'
  when 'cubiertas_edificio' then '🏠'
  when 'desprendimientos_exteriores_edificio' then '🧱'
  when 'falsos_techos' then '🔲'
  when 'aire_acondicionado_edificio' then '❄️'
  when 'mobiliario_danado_edificio' then '🪑'
  when 'accesos_edificio' then '♿'
  when 'ascensores_averiados' then '🛗'
  when 'aseos_inoperativos_edificio' then '🚻'
  when 'presencia_plagas_edificio' then '🐀'
  when 'banco_roto_urbano' then '🪑'
  when 'semaforo_fuera_servicio' then '🚦'
  when 'senal_arrancada' then '🛑'
  when 'mupi_totem_vandalizado' then '📰'
  when 'marquesina_sucia' then '🧹'
  when 'aparca_bicis_roto' then '🚲'
  when 'punto_recarga_fuera_servicio' then '🔌'
  when 'pergola_estropeada' then '⛱️'
end where id in ('acera_calzada', 'excrementos', 'malas_hierbas', 'banco_roto', 'papelera', 'graffiti', 'contenedor_lleno', 'contenedor_roto', 'tapa_rota', 'pedal_averiado', 'contenedor_quemado', 'olor_contenedor', 'recogida_no_realizada', 'vertido_fuera_contenedor', 'ducha_averiada', 'papelera_playa_llena', 'pasarela_danada', 'aseo_sucio', 'fuente_playa_averiada', 'arena_sucia', 'senalizacion_socorrismo', 'accesibilidad_playa', 'arbol_caido', 'riego_averiado', 'cesped_deteriorado', 'alcorque_danado', 'poda_necesaria', 'zona_verde_abandonada', 'mobiliario_jardin_roto', 'plaga_vegetal', 'mosquitos', 'cucarachas', 'pulgas', 'garrapatas', 'hormigas', 'avispas_abejas', 'chinches', 'procesionaria', 'roedores', 'palomas', 'gaviotas', 'animal_abandonado', 'animal_muerto', 'colonia_felina', 'nido_conflictivo', 'jabalies', 'juego_roto', 'suelo_amortiguacion', 'vallado_danado', 'cartel_normativa', 'sombra_insuficiente', 'suciedad_area_infantil', 'columpio_averiado', 'tobogan_averiado', 'farola_apagada', 'farola_parpadeante', 'farola_rota', 'farola_encendida_dia', 'cableado_expuesto', 'poste_inclinado', 'zona_sin_iluminacion', 'cuadro_control_averiado', 'aire_acondicionado_deportivo', 'sin_agua_deportivo', 'piscina_inoperativa', 'maquinaria_danada_deportivo', 'terreno_juego_danado', 'vestuarios_desperfectos', 'accesos_incidencias_deportivo', 'ruidos_vibraciones', 'aseos_inoperativos_deportivo', 'presencia_plagas_deportivo', 'vandalismo_patrimonio', 'grafitis_patrimonio', 'inscripciones_degradadas', 'humedades_patrimonio', 'desprendimientos_patrimonio', 'cierres_preventivos', 'sin_personal_vigilancia', 'erosion_fortificaciones', 'fuente_patrimonio_sin_agua', 'entorno_degradado_patrimonio', 'cubiertas_edificio', 'desprendimientos_exteriores_edificio', 'falsos_techos', 'aire_acondicionado_edificio', 'mobiliario_danado_edificio', 'accesos_edificio', 'ascensores_averiados', 'aseos_inoperativos_edificio', 'presencia_plagas_edificio', 'banco_roto_urbano', 'semaforo_fuera_servicio', 'senal_arrancada', 'mupi_totem_vandalizado', 'marquesina_sucia', 'aparca_bicis_roto', 'punto_recarga_fuera_servicio', 'pergola_estropeada');
