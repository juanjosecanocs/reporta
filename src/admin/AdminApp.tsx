import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export function AdminApp() {
  const { session, esAdmin, cargando, iniciarSesion, cerrarSesion } = useAdminAuth();

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>;
  }

  if (!session) {
    return <AdminLogin onIniciarSesion={iniciarSesion} />;
  }

  if (!esAdmin) {
    return (
      <div className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-gray-600">Esta cuenta no tiene permisos de administrador.</p>
        <button type="button" onClick={cerrarSesion} className="text-sm text-primary underline">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return <AdminDashboard onCerrarSesion={cerrarSesion} />;
}
