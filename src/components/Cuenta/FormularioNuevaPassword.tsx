import { useState, type FormEvent } from 'react';
import { mensajeDeError } from '../../utils/errores';

interface Props {
  onGuardar: (password: string) => Promise<void>;
  titulo?: string;
}

export function FormularioNuevaPassword({ onGuardar, titulo = 'Elige una nueva contraseña' }: Props) {
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await onGuardar(password);
      setGuardado(true);
      setPassword('');
      setConfirmacion('');
    } catch (err) {
      setError(mensajeDeError(err, 'Error guardando la contraseña'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
      <input
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nueva contraseña"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={confirmacion}
        onChange={(e) => setConfirmacion(e.target.value)}
        placeholder="Repite la contraseña"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {guardado && <p className="text-sm text-green-600">Contraseña actualizada.</p>}
      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {enviando ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  );
}
