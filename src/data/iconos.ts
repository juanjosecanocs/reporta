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
};

export const ICONO_POR_DEFECTO = '📍';
