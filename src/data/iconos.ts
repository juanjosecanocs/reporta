/**
 * Iconos (emoji) por tipo y subtipo, inspirados en el estilo visual de la
 * app oficial del Ayuntamiento de Almería (icono + etiqueta debajo / al lado).
 */

export const TIPO_ICONOS: Record<string, string> = {
  limpieza: '🧹',
  recogida: '🗑️',
  playas: '🏖️',
  jardines: '🌳',
  insectos: '🐞',
  fauna: '🐦',
  infantiles: '🛝',
  alumbrado: '💡',
  deportivas: '🏟️',
  patrimonio: '🏛️',
  edificios: '🏢',
  mobiliario: '🚏',
};

export const SUBTIPO_ICONOS: Record<string, string> = {
  // Limpieza viaria
  acera_calzada: '🚶',
  excrementos: '💩',
  malas_hierbas: '🌱',
  banco_roto: '🪑',
  papelera: '🗑️',
  graffiti: '🎨',

  // Recogida de residuos
  contenedor_lleno: '🗑️',
  contenedor_roto: '🗑️',
  tapa_rota: '🗑️',
  pedal_averiado: '🔧',
  contenedor_quemado: '🔥',
  olor_contenedor: '🤢',
  recogida_no_realizada: '🚛',
  vertido_fuera_contenedor: '🚯',

  // Playas
  ducha_averiada: '🚿',
  papelera_playa_llena: '🗑️',
  pasarela_danada: '🪵',
  aseo_sucio: '🚻',
  fuente_playa_averiada: '⛲',
  arena_sucia: '🏝️',
  senalizacion_socorrismo: '🚩',
  accesibilidad_playa: '♿',

  // Jardines
  arbol_caido: '🪵',
  riego_averiado: '💧',
  cesped_deteriorado: '🌾',
  alcorque_danado: '🕳️',
  poda_necesaria: '✂️',
  zona_verde_abandonada: '🥀',
  mobiliario_jardin_roto: '🪑',
  plaga_vegetal: '🐛',

  // Insectos
  mosquitos: '🦟',
  cucarachas: '🪳',
  pulgas: '🦗',
  garrapatas: '🕷️',
  hormigas: '🐜',
  avispas_abejas: '🐝',
  chinches: '🦠',
  procesionaria: '🐛',

  // Fauna
  roedores: '🐀',
  palomas: '🕊️',
  gaviotas: '🐦',
  animal_abandonado: '🐕',
  animal_muerto: '⚠️',
  colonia_felina: '🐈',
  nido_conflictivo: '🪹',
  jabalies: '🐗',

  // Áreas infantiles
  juego_roto: '🛝',
  suelo_amortiguacion: '🟫',
  vallado_danado: '🚧',
  cartel_normativa: '🪧',
  sombra_insuficiente: '☂️',
  suciedad_area_infantil: '🧹',
  columpio_averiado: '⛓️',
  tobogan_averiado: '🛝',

  // Alumbrado público
  farola_apagada: '🌑',
  farola_parpadeante: '⚡',
  farola_rota: '💥',
  farola_encendida_dia: '☀️',
  cableado_expuesto: '🔌',
  poste_inclinado: '⚠️',
  zona_sin_iluminacion: '🌃',
  cuadro_control_averiado: '🎛️',

  // Instalaciones deportivas
  aire_acondicionado_deportivo: '❄️',
  sin_agua_deportivo: '🚿',
  piscina_inoperativa: '🏊',
  maquinaria_danada_deportivo: '⚙️',
  terreno_juego_danado: '⚽',
  vestuarios_desperfectos: '🚪',
  accesos_incidencias_deportivo: '🚧',
  ruidos_vibraciones: '🔊',
  aseos_inoperativos_deportivo: '🚻',
  presencia_plagas_deportivo: '🐀',

  // Patrimonio histórico
  vandalismo_patrimonio: '🔨',
  grafitis_patrimonio: '🎨',
  inscripciones_degradadas: '📜',
  humedades_patrimonio: '💧',
  desprendimientos_patrimonio: '🪨',
  cierres_preventivos: '🚫',
  sin_personal_vigilancia: '👤',
  erosion_fortificaciones: '🏰',
  fuente_patrimonio_sin_agua: '⛲',
  entorno_degradado_patrimonio: '🥀',

  // Edificios públicos
  cubiertas_edificio: '🏠',
  desprendimientos_exteriores_edificio: '🧱',
  falsos_techos: '🔲',
  aire_acondicionado_edificio: '❄️',
  mobiliario_danado_edificio: '🪑',
  accesos_edificio: '♿',
  ascensores_averiados: '🛗',
  aseos_inoperativos_edificio: '🚻',
  presencia_plagas_edificio: '🐀',

  // Mobiliario urbano
  banco_roto_urbano: '🪑',
  semaforo_fuera_servicio: '🚦',
  senal_arrancada: '🛑',
  mupi_totem_vandalizado: '📰',
  marquesina_sucia: '🧹',
  aparca_bicis_roto: '🚲',
  punto_recarga_fuera_servicio: '🔌',
  pergola_estropeada: '⛱️',
};

export const ICONO_POR_DEFECTO = '📍';
