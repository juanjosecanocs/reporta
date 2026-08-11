import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { FormularioNuevaPassword } from './FormularioNuevaPassword';
import { mensajeDeError } from '../../utils/errores';

interface Props {
  session: Session;
  nombreActual: string;
  onCambiarNombre: (nombre: string) => Promise<void>;
  onCambiarPassword: (password: string) => Promise<void>;
  onCerrarSesion: () => Promise<void>;
  onVolver: () => void;
}

export function MiCuenta({
  session,
  nombreActual,
  onCambiarNombre,
  onCambiarPassword,
  onCerrarSesion,
  onVolver,
}: Props) {
  const [nombre, setNombre] = useState(nombreActual);
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [nombreGuardado, setNombreGuardado] = useState(false);

  async function guardarNombre() {
    setGuardandoNombre(true);
    setErrorNombre(null);
    setNombreGuardado(false);
    try {
      await onCambiarNombre(nombre);
      setNombreGuardado(true);
    } catch (err) {
      setErrorNombre(mensajeDeError(err, 'Error guardando el nombre'));
    } finally {
      setGuardandoNombre(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-800">Mi cuenta</h2>
        <p className="text-sm text-gray-500">{session.user.email}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="nombre-cuenta">
          Nombre
        </label>
        <input
          id="nombre-cuenta"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {errorNombre && <p className="text-sm text-red-500">{errorNombre}</p>}
        {nombreGuardado && <p className="text-sm text-green-600">Nombre actualizado.</p>}
        <button
          type="button"
          onClick={guardarNombre}
          disabled={guardandoNombre || !nombre.trim() || nombre === nombreActual}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {guardandoNombre ? 'Guardando…' : 'Guardar nombre'}
        </button>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <FormularioNuevaPassword titulo="Cambiar contraseña" onGuardar={onCambiarPassword} />
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <button type="button" onClick={onCerrarSesion} className="text-sm text-gray-500 underline">
          Cerrar sesión
        </button>
        <button type="button" onClick={onVolver} className="text-sm text-primary underline">
          Volver al mapa
        </button>
      </div>
    </div>
  );
}
