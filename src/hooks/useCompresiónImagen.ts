import { useCallback, useState } from 'react';
import { mensajeDeError } from '../utils/errores';

const OBJETIVO_MIN_BYTES = 120 * 1024;
const OBJETIVO_MAX_BYTES = 200 * 1024;
const MAX_DIMENSION = 1600;

async function cargarImagen(archivo: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function dibujarEnCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const escala = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener contexto 2D del canvas');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, calidad: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Fallo al generar WebP'))),
      'image/webp',
      calidad
    );
  });
}

/** Comprime una imagen a WebP intentando quedar dentro del rango 120-200KB. */
export async function comprimirImagen(archivo: File): Promise<Blob> {
  const img = await cargarImagen(archivo);
  const canvas = dibujarEnCanvas(img);

  let calidad = 0.8;
  let blob = await canvasToBlob(canvas, calidad);

  for (let intento = 0; intento < 6 && blob.size > OBJETIVO_MAX_BYTES; intento++) {
    calidad = Math.max(0.35, calidad - 0.12);
    blob = await canvasToBlob(canvas, calidad);
  }

  return blob;
}

interface EstadoCompresion {
  comprimiendo: boolean;
  error: string | null;
}

export function useCompresionImagen() {
  const [estado, setEstado] = useState<EstadoCompresion>({ comprimiendo: false, error: null });

  const comprimir = useCallback(async (archivo: File) => {
    setEstado({ comprimiendo: true, error: null });
    try {
      const blob = await comprimirImagen(archivo);
      setEstado({ comprimiendo: false, error: null });
      return { blob, originalSizeBytes: archivo.size, dentroDeObjetivo: blob.size <= OBJETIVO_MAX_BYTES };
    } catch (err) {
      const mensaje = mensajeDeError(err, 'Error comprimiendo imagen');
      setEstado({ comprimiendo: false, error: mensaje });
      throw err;
    }
  }, []);

  return { ...estado, comprimir, OBJETIVO_MIN_BYTES, OBJETIVO_MAX_BYTES };
}
