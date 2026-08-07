export interface Incidencia {
  id: string;
  tipo_id: string;
  subtipo_id: string;
  latitud: number;
  longitud: number;
  direccion: string;
  imagen_url?: string;
  descripcion_corta?: string;
  estado: 'pendiente' | 'revisada' | 'resuelto' | 'rechazado';
  codigo_seguimiento: string;
  uuid_cliente: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_reason?: string | null;
}

export interface Tipo {
  id: string;
  nombre: string;
  descripcion?: string;
  color_primario: string;
  color_secundario?: string;
  orden: number;
  activo: boolean;
  subtipos?: Subtipo[];
}

export interface Subtipo {
  id: string;
  tipo_id: string;
  nombre: string;
  urgencia: number;
  orden: number;
  activo: boolean;
}
