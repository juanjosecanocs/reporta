import type { Tipo } from '../types';

/**
 * Fallback local usado solo si Supabase no responde (offline / sin configurar).
 * La fuente de verdad son las tablas `tipos_incidencias` / `subtipos_incidencias`;
 * ver supabase/migrations/001_create_tables.sql.
 */
export const TIPOS_FALLBACK: Tipo[] = [
  { id: 'limpieza', nombre: 'Limpieza viaria', color_primario: '#D32F2F', color_secundario: '#FF6B6B', orden: 1, activo: true },
  { id: 'recogida', nombre: 'Recogida de residuos', color_primario: '#F7931E', color_secundario: '#FFB366', orden: 2, activo: true },
  { id: 'playas', nombre: 'Playas', color_primario: '#4ECDC4', color_secundario: '#6FE0DB', orden: 3, activo: true },
  { id: 'jardines', nombre: 'Jardines', color_primario: '#95D236', color_secundario: '#B8E986', orden: 4, activo: true },
  { id: 'insectos', nombre: 'Insectos', color_primario: '#043F63', color_secundario: '#0A5A8A', orden: 5, activo: true },
  { id: 'fauna', nombre: 'Fauna', color_primario: '#8B4513', color_secundario: '#A0622E', orden: 6, activo: true },
  { id: 'infantiles', nombre: 'Áreas infantiles', color_primario: '#FFB6C1', color_secundario: '#FFD4E0', orden: 7, activo: true },
  { id: 'alumbrado', nombre: 'Alumbrado público', color_primario: '#FFE66D', color_secundario: '#FFF5AA', orden: 8, activo: true },
];
