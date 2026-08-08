export interface Incidencia {
  id: string;
  municipio_id: string;
  usuario_id?: string | null;
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

export interface Municipio {
  id: string;
  slug: string;
  nombre: string;
  centro_lat: number;
  centro_lng: number;
  zoom_inicial: number;
  activo: boolean;
}

export interface Tipo {
  id: string;
  nombre: string;
  descripcion?: string;
  icono_name?: string | null;
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
  icono_name?: string | null;
  urgencia: number;
  orden: number;
  activo: boolean;
}
