import { useRef, useState } from 'react';
import { useCompresionImagen } from '../../hooks/useCompresiónImagen';

interface Props {
  onCapturada: (blob: Blob) => void;
}

export function CameraCapture({ onCapturada }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { comprimir, comprimiendo, error } = useCompresionImagen();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const { blob } = await comprimir(archivo);
    setPreviewUrl(URL.createObjectURL(blob));
    onCapturada(blob);
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleArchivo}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={comprimiendo}
        className="rounded-lg bg-secondary px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {comprimiendo ? 'Comprimiendo…' : 'Tomar foto'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {previewUrl && (
        <img src={previewUrl} alt="Vista previa" className="max-h-64 rounded-lg object-cover" />
      )}
    </div>
  );
}
