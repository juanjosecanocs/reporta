import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export function useCiudadanoAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const [recoveryEnCurso, setRecoveryEnCurso] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((evento, nuevaSesion) => {
      setSession(nuevaSesion);
      if (evento === 'PASSWORD_RECOVERY') setRecoveryEnCurso(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const emailVerificado = !!session?.user.email_confirmed_at;
  const nombre = (session?.user.user_metadata?.nombre as string | undefined) ?? '';

  async function registrarse(email: string, password: string, nombre: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    if (error) throw error;
  }

  async function iniciarSesion(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function cerrarSesion(): Promise<void> {
    await supabase.auth.signOut();
  }

  async function reenviarVerificacion(): Promise<void> {
    if (!session?.user.email) return;
    const { error } = await supabase.auth.resend({ type: 'signup', email: session.user.email });
    if (error) throw error;
  }

  async function cambiarNombre(nuevoNombre: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ data: { nombre: nuevoNombre } });
    if (error) throw error;
  }

  async function cambiarPassword(nuevaPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
    if (error) throw error;
    setRecoveryEnCurso(false);
  }

  async function solicitarRecuperacion(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  }

  return {
    session,
    cargando,
    emailVerificado,
    nombre,
    recoveryEnCurso,
    registrarse,
    iniciarSesion,
    cerrarSesion,
    reenviarVerificacion,
    cambiarNombre,
    cambiarPassword,
    solicitarRecuperacion,
  };
}
