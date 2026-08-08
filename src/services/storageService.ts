import { supabase } from './supabaseClient';
import type { Incidencia } from '../types';

const STORAGE_BUCKET = 'incidencias';

/** Código corto único para que el ciudadano pueda seguir su incidencia sin login. */
export function generarCodigoSeguimiento(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return codigo;
}

export interface NuevaIncidenciaPayload {
  municipio_id: string;
  tipo_id: string;
  subtipo_id: string;
  latitud: number;
  longitud: number;
  direccion?: string;
  descripcion_corta?: string;
  uuid_cliente: string;
}

export async function crearIncidencia(payload: NuevaIncidenciaPayload): Promise<Incidencia> {
  const codigo_seguimiento = generarCodigoSeguimiento();

  const { data, error } = await supabase
    .from('incidencias_anonimas')
    .insert({ ...payload, codigo_seguimiento, estado: 'pendiente' })
    .select()
    .single();

  if (error) throw error;
  return data as Incidencia;
}

/** Sube la foto comprimida y la enlaza con la incidencia ya creada. */
export async function adjuntarImagen(
  incidenciaId: string,
  archivo: Blob,
  meta: { originalSizeBytes: number; comprimida: boolean }
): Promise<string> {
  const path = `${incidenciaId}/${Date.now()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, archivo, { contentType: 'image/webp' });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  const imagen_url = publicUrlData.publicUrl;

  const { data: imagenRow, error: imagenError } = await supabase
    .from('images')
    .insert({
      incidencia_id: incidenciaId,
      storage_path: path,
      tamaño_bytes: archivo.size,
      mime_type: 'image/webp',
      comprimida: meta.comprimida,
      original_size_bytes: meta.originalSizeBytes,
      compression_ratio: meta.originalSizeBytes > 0 ? archivo.size / meta.originalSizeBytes : null,
    })
    .select()
    .single();
  if (imagenError) throw imagenError;

  const { error: updateError } = await supabase
    .from('incidencias_anonimas')
    .update({ imagen_id: imagenRow.id, imagen_url })
    .eq('id', incidenciaId);
  if (updateError) throw updateError;

  return imagen_url;
}
