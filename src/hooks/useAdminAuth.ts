import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [sesionCargada, setSesionCargada] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [comprobandoAdmin, setComprobandoAdmin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSesionCargada(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion);
      setSesionCargada(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sesionCargada) return;
    if (!session) {
      setEsAdmin(false);
      setComprobandoAdmin(false);
      return;
    }
    let cancelado = false;
    setComprobandoAdmin(true);
    supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelado) return;
        setEsAdmin(!!data);
        setComprobandoAdmin(false);
      });
    return () => {
      cancelado = true;
    };
  }, [session, sesionCargada]);

  async function iniciarSesion(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return {
    session,
    esAdmin,
    cargando: !sesionCargada || comprobandoAdmin,
    iniciarSesion,
    cerrarSesion,
  };
}
