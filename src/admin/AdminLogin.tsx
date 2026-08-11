import { useState, type FormEvent } from 'react';
import { mensajeDeError } from '../utils/errores';

interface Props {
  onIniciarSesion: (email: string, password: string) => Promise<void>;
  onSolicitarRecuperacion: (email: string) => Promise<void>;
}

export function AdminLogin({ onIniciarSesion, onSolicitarRecuperacion }: Props) {
  const [modo, setModo] = useState<'login' | 'recuperar'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [recuperacionEnviada, setRecuperacionEnviada] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await onIniciarSesion(email, password);
    } catch (err) {
      setError(mensajeDeError(err, 'Error al iniciar sesión'));
    } finally {
      setEnviando(false);
    }
  }

  if (modo === 'recuperar') {
    return (
      <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-4 p-4">
        <h1 className="text-xl font-bold text-primary">REPORTA · Admin</h1>
        <h2 className="text-sm font-semibold text-gray-700">Recuperar contraseña</h2>
        {recuperacionEnviada ? (
          <p className="text-sm text-gray-600">
            Si <strong>{email}</strong> tiene una cuenta de administrador, te hemos enviado un enlace para elegir
            una nueva contraseña.
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
                setError(mensajeDeError(err, 'Error enviando el correo'));
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
              placeholder="Email"
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

  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-4 p-4">
      <h1 className="text-xl font-bold text-primary">REPORTA · Admin</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
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
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <button type="button" onClick={() => setModo('recuperar')} className="text-sm text-primary underline">
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  );
}
