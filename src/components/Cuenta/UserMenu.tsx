import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

interface Props {
  session: Session | null;
  nombre: string;
  onMiHistorial: () => void;
  onCrearCuenta: () => void;
  onEditarNombre: () => void;
  onCambiarPassword: () => void;
  onCerrarSesion: () => void;
}

/** Menú de cuenta arriba a la derecha: visible tanto anónimo como registrado. */
export function UserMenu({
  session,
  nombre,
  onMiHistorial,
  onCrearCuenta,
  onEditarNombre,
  onCambiarPassword,
  onCerrarSesion,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function alHacerClicFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', alHacerClicFuera);
    return () => document.removeEventListener('mousedown', alHacerClicFuera);
  }, []);

  const email = session?.user.email ?? '';
  const etiqueta = session ? nombre || email : 'Usuario anónimo';
  const inicial = session ? (nombre || email || '?').charAt(0).toUpperCase() : '?';

  function accion(fn: () => void) {
    setAbierto(false);
    fn();
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
          {inicial}
        </span>
        <span className="hidden max-w-[9rem] truncate sm:inline">{etiqueta}</span>
        <span aria-hidden className="text-xs">
          ▾
        </span>
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-1 text-left shadow-xl"
        >
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-gray-800">{session ? nombre || 'Sin nombre' : 'Usuario anónimo'}</p>
            {session && <p className="truncate text-xs text-gray-500">{email}</p>}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => accion(onMiHistorial)}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            📋 Mi historial
          </button>

          {session ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => accion(onEditarNombre)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Editar nombre
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => accion(onCambiarPassword)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Cambiar contraseña
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => accion(onCerrarSesion)}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => accion(onCrearCuenta)}
              className="w-full px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-gray-50"
            >
              Crear cuenta / Iniciar sesión
            </button>
          )}
        </div>
      )}
    </div>
  );
}
