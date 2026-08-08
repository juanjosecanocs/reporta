import { useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';

interface Props {
  contexto?: 'reporte' | 'perfil';
  session: Session | null;
  emailVerificado: boolean;
  onIniciarSesion: (email: string, password: string) => Promise<void>;
  onRegistrarse: (email: string, password: string, nombre: string) => Promise<void>;
  onReenviarVerificacion: () => Promise<void>;
  onSolicitarRecuperacion: (email: string) => Promise<void>;
  onCerrarSesion: () => Promise<void>;
  onContinuarSinCuenta?: () => void;
  onVolver: () => void;
}

type Modo = 'inicial' | 'login' | 'registro' | 'recuperar';

export function AccesoCiudadano({
  contexto = 'reporte',
  session,
  emailVerificado,
  onIniciarSesion,
  onRegistrarse,
  onReenviarVerificacion,
  onSolicitarRecuperacion,
  onCerrarSesion,
  onContinuarSinCuenta,
  onVolver,
}: Props) {
  const [modo, setModo] = useState<Modo>('inicial');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registroEnviado, setRegistroEnviado] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [recuperacionEnviada, setRecuperacionEnviada] = useState(false);

  const esReporte = contexto === 'reporte';

  // Cuando no aplica "continuar sin foto ni comentario" (se abrió desde el
  // menú de cuenta, no desde el flujo de reporte), el botón equivalente es
  // simplemente volver.
  function BotonSecundario() {
    return onContinuarSinCuenta ? (
      <button
        type="button"
        onClick={onContinuarSinCuenta}
        className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white"
      >
        Continuar sin foto ni comentario
      </button>
    ) : (
      <button
        type="button"
        onClick={onVolver}
        className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary"
      >
        Volver
      </button>
    );
  }

  // Sesión activa pero email todavía sin confirmar: pedir que revisen el correo.
  if (session && !emailVerificado) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
        <h2 className="text-lg font-semibold text-gray-800">Confirma tu correo</h2>
        <p className="text-sm text-gray-600">
          Te hemos enviado un enlace de confirmación a <strong>{session.user.email}</strong>.
          {esReporte
            ? ' Ábrelo para poder adjuntar foto y comentario a tu incidencia.'
            : ' Ábrelo para activar tu cuenta.'}
        </p>
        {reenviado && <p className="text-sm text-green-600">Correo reenviado.</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="button"
          onClick={async () => {
            setError(null);
            try {
              await onReenviarVerificacion();
              setReenviado(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error reenviando el correo');
            }
          }}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary"
        >
          Reenviar correo de confirmación
        </button>
        <BotonSecundario />
        <button type="button" onClick={onCerrarSesion} className="text-sm text-gray-500 underline">
          Usar otro correo
        </button>
      </div>
    );
  }

  if (registroEnviado) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 p-4 text-center">
        <h2 className="text-lg font-semibold text-gray-800">Revisa tu correo</h2>
        <p className="text-sm text-gray-600">
          Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
          {esReporte ? ' Confírmalo y vuelve a esta página para adjuntar foto y comentario.' : ' Confírmalo para activar tu cuenta.'}
        </p>
        <BotonSecundario />
      </div>
    );
  }

  if (modo === 'inicial') {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {esReporte ? '¿Quieres añadir foto y comentario?' : 'Crea tu cuenta o inicia sesión'}
        </h2>
        <p className="text-sm text-gray-600">
          {esReporte
            ? 'Para evitar fotos y comentarios anónimos inapropiados, adjuntarlos requiere una cuenta con nombre y correo verificado. Sin cuenta puedes seguir reportando tipo, subtipo y ubicación exactamente igual que antes.'
            : 'Con una cuenta y correo verificado podrás adjuntar foto y comentario en tus incidencias.'}
        </p>
        <button
          type="button"
          onClick={() => setModo('registro')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Registrarme
        </button>
        <button
          type="button"
          onClick={() => setModo('login')}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary"
        >
          Ya tengo cuenta
        </button>
        {onContinuarSinCuenta && (
          <button
            type="button"
            onClick={onContinuarSinCuenta}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white"
          >
            Continuar sin foto ni comentario
          </button>
        )}
        <button type="button" onClick={onVolver} className="text-sm text-gray-500 underline">
          Volver
        </button>
      </div>
    );
  }

  if (modo === 'recuperar') {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
        <h2 className="text-lg font-semibold text-gray-800">Recuperar contraseña</h2>
        {recuperacionEnviada ? (
          <p className="text-sm text-gray-600">
            Si <strong>{email}</strong> tiene una cuenta, te hemos enviado un enlace para elegir una nueva
            contraseña.
          </p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setEnviando(true);
              setError(null);
              try {
                await onSolicitarRecuperacion(email);
                setRecuperacionEnviada(true);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Error enviando el correo');
              } finally {
                setEnviando(false);
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {enviando ? 'Enviando…' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}
        <button type="button" onClick={() => setModo('login')} className="text-sm text-gray-500 underline">
          Volver
        </button>
      </div>
    );
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      if (modo === 'registro') {
        await onRegistrarse(email, password, nombre);
        setRegistroEnviado(true);
      } else {
        await onIniciarSesion(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
      <h2 className="text-lg font-semibold text-gray-800">{modo === 'registro' ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      <form onSubmit={enviar} className="flex flex-col gap-3">
        {modo === 'registro' && (
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        )}
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {enviando ? 'Enviando…' : modo === 'registro' ? 'Crear cuenta' : 'Entrar'}
        </button>
      </form>
      {modo === 'login' && (
        <button type="button" onClick={() => setModo('recuperar')} className="text-sm text-primary underline">
          ¿Olvidaste tu contraseña?
        </button>
      )}
      <button type="button" onClick={() => setModo('inicial')} className="text-sm text-gray-500 underline">
        Volver
      </button>
    </div>
  );
}
