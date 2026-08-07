import { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Header } from '../components/Layout/Header';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { GestionTipos } from './GestionTipos';

type Vista = 'incidencias' | 'tipos';

export function AdminApp() {
  const { session, esAdmin, cargando, iniciarSesion, cerrarSesion } = useAdminAuth();
  const [vista, setVista] = useState<Vista>('incidencias');

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>;
  }

  if (!session) {
    return (
      <>
        <Header onLogoClick={() => window.location.assign('/')} subtitulo="Panel de administración" />
        <AdminLogin onIniciarSesion={iniciarSesion} />
      </>
    );
  }

  if (!esAdmin) {
    return (
      <>
        <Header onLogoClick={() => window.location.assign('/')} subtitulo="Panel de administración" />
        <div className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-sm text-gray-600">Esta cuenta no tiene permisos de administrador.</p>
          <button type="button" onClick={cerrarSesion} className="text-sm text-primary underline">
            Cerrar sesión
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onLogoClick={() => window.location.assign('/')} subtitulo="Panel de administración" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVista('incidencias')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              vista === 'incidencias' ? 'bg-primary text-white' : 'text-gray-500'
            }`}
          >
            Incidencias
          </button>
          <button
            type="button"
            onClick={() => setVista('tipos')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              vista === 'tipos' ? 'bg-primary text-white' : 'text-gray-500'
            }`}
          >
            Tipos y subtipos
          </button>
        </div>
        <button type="button" onClick={cerrarSesion} className="text-sm text-gray-500 underline">
          Cerrar sesión
        </button>
      </div>

      {vista === 'incidencias' ? <AdminDashboard /> : <GestionTipos />}
    </>
  );
}
