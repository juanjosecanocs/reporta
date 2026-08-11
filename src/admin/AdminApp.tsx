import { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Header } from '../components/Layout/Header';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { GestionTipos } from './GestionTipos';
import { GestionMunicipios } from './GestionMunicipios';
import { GestionBloqueos } from './GestionBloqueos';
import { GestionAdministradores } from './GestionAdministradores';
import { FormularioNuevaPassword } from '../components/Cuenta/FormularioNuevaPassword';

type Vista = 'incidencias' | 'tipos' | 'municipios' | 'bloqueados' | 'administradores';

export function AdminApp() {
  const {
    session,
    esAdmin,
    esSuperAdmin,
    cargando,
    recoveryEnCurso,
    iniciarSesion,
    cerrarSesion,
    cambiarPassword,
    solicitarRecuperacion,
  } = useAdminAuth();
  const [vista, setVista] = useState<Vista>('incidencias');
  const [mostrarCambiarPassword, setMostrarCambiarPassword] = useState(false);

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>;
  }

  if (recoveryEnCurso) {
    return (
      <>
        <Header onLogoClick={() => window.location.assign('/')} subtitulo="Panel de administración" />
        <div className="mx-auto max-w-sm p-4">
          <FormularioNuevaPassword onGuardar={cambiarPassword} />
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Header onLogoClick={() => window.location.assign('/')} subtitulo="Panel de administración" />
        <AdminLogin onIniciarSesion={iniciarSesion} onSolicitarRecuperacion={solicitarRecuperacion} />
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
          <button
            type="button"
            onClick={() => setVista('bloqueados')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              vista === 'bloqueados' ? 'bg-primary text-white' : 'text-gray-500'
            }`}
          >
            Usuarios bloqueados
          </button>
          {esSuperAdmin && (
            <button
              type="button"
              onClick={() => setVista('municipios')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                vista === 'municipios' ? 'bg-primary text-white' : 'text-gray-500'
              }`}
            >
              Municipios
            </button>
          )}
          {esSuperAdmin && (
            <button
              type="button"
              onClick={() => setVista('administradores')}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                vista === 'administradores' ? 'bg-primary text-white' : 'text-gray-500'
              }`}
            >
              Administradores
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMostrarCambiarPassword((v) => !v)}
            className="text-sm text-gray-500 underline"
          >
            Cambiar contraseña
          </button>
          <button type="button" onClick={cerrarSesion} className="text-sm text-gray-500 underline">
            Cerrar sesión
          </button>
        </div>
      </div>

      {mostrarCambiarPassword && (
        <div className="mx-auto max-w-sm px-4 pt-4">
          <FormularioNuevaPassword onGuardar={cambiarPassword} />
        </div>
      )}

      {vista === 'incidencias' && <AdminDashboard />}
      {vista === 'tipos' && <GestionTipos />}
      {vista === 'bloqueados' && <GestionBloqueos />}
      {vista === 'municipios' && esSuperAdmin && <GestionMunicipios />}
      {vista === 'administradores' && esSuperAdmin && <GestionAdministradores />}
    </>
  );
}
