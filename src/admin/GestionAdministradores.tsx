import { useEffect, useState } from 'react';
import {
  listarAdministradores,
  buscarUsuarioPorEmail,
  agregarAdministrador,
  cambiarMunicipioAdministrador,
  quitarAdministrador,
  type AdminUserConMunicipio,
  type CandidatoAdmin,
} from '../services/adminUsersService';
import { listarMunicipiosAdmin } from '../services/municipioAdminService';
import { mensajeDeError } from '../utils/errores';
import type { Municipio } from '../types';

const OPCION_GENERAL = '';

function SelectorMunicipio({
  municipios,
  value,
  onChange,
}: {
  municipios: Municipio[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
    >
      <option value={OPCION_GENERAL}>General (todos los municipios)</option>
      {municipios.map((m) => (
        <option key={m.id} value={m.id}>
          {m.nombre}
        </option>
      ))}
    </select>
  );
}

function BuscadorAdmin({ municipios, onAlta }: { municipios: Municipio[]; onAlta: () => void }) {
  const [email, setEmail] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [candidato, setCandidato] = useState<CandidatoAdmin | null | 'no-encontrado'>(null);
  const [municipioElegido, setMunicipioElegido] = useState(OPCION_GENERAL);
  const [dandoAlta, setDandoAlta] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buscar() {
    if (!email.trim()) return;
    setBuscando(true);
    setError(null);
    setCandidato(null);
    try {
      const resultado = await buscarUsuarioPorEmail(email.trim());
      setCandidato(resultado ?? 'no-encontrado');
      setMunicipioElegido(OPCION_GENERAL);
    } catch (err) {
      setError(mensajeDeError(err, 'Error buscando el usuario'));
    } finally {
      setBuscando(false);
    }
  }

  async function darDeAlta() {
    if (!candidato || candidato === 'no-encontrado') return;
    setDandoAlta(true);
    setError(null);
    try {
      await agregarAdministrador(candidato.id, candidato.email, municipioElegido || null);
      setCandidato(null);
      setEmail('');
      onAlta();
    } catch (err) {
      setError(mensajeDeError(err, 'Error dando de alta al administrador'));
    } finally {
      setDandoAlta(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscar()}
          placeholder="Email del usuario ya registrado"
          className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
        <button
          type="button"
          onClick={buscar}
          disabled={buscando || !email.trim()}
          className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {candidato === 'no-encontrado' && (
        <p className="text-xs text-gray-500">
          No hay ningún usuario registrado y con email verificado con ese correo. Tiene que registrarse primero en
          la app, como cualquier ciudadano.
        </p>
      )}

      {candidato && candidato !== 'no-encontrado' && candidato.yaEsAdmin && (
        <p className="text-xs text-gray-500">
          {candidato.email} ya es administrador. Gestiona su municipio o quítale el acceso desde la lista de abajo.
        </p>
      )}

      {candidato && candidato !== 'no-encontrado' && !candidato.yaEsAdmin && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-800">{candidato.nombre ?? candidato.email}</span>
          <SelectorMunicipio municipios={municipios} value={municipioElegido} onChange={setMunicipioElegido} />
          <button
            type="button"
            onClick={darDeAlta}
            disabled={dandoAlta}
            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            {dandoAlta ? 'Dando de alta…' : 'Dar de alta como admin'}
          </button>
        </div>
      )}
    </div>
  );
}

function FilaAdmin({
  admin,
  municipios,
  onCambio,
}: {
  admin: AdminUserConMunicipio;
  municipios: Municipio[];
  onCambio: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [municipioElegido, setMunicipioElegido] = useState(admin.municipio_id ?? OPCION_GENERAL);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardarMunicipio() {
    setGuardando(true);
    setError(null);
    try {
      await cambiarMunicipioAdministrador(admin.id, municipioElegido || null);
      setEditando(false);
      onCambio();
    } catch (err) {
      setError(mensajeDeError(err, 'Error actualizando el administrador'));
    } finally {
      setGuardando(false);
    }
  }

  async function quitarAcceso() {
    setError(null);
    try {
      await quitarAdministrador(admin.id);
      onCambio();
    } catch (err) {
      setError(mensajeDeError(err, 'Error quitando el acceso'));
    }
  }

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 px-3 py-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[200px] flex-1">
          <p className="text-sm font-medium text-gray-800">{admin.email}</p>
        </div>

        {editando ? (
          <>
            <SelectorMunicipio municipios={municipios} value={municipioElegido} onChange={setMunicipioElegido} />
            <button
              type="button"
              onClick={guardarMunicipio}
              disabled={guardando}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              Guardar
            </button>
            <button type="button" onClick={() => setEditando(false)} className="text-xs text-gray-500 underline">
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                admin.municipio_id ? 'bg-secondary/20 text-secondary' : 'bg-primary/10 text-primary'
              }`}
            >
              {admin.municipioNombre ?? 'General'}
            </span>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary"
            >
              Cambiar municipio
            </button>
            <button
              type="button"
              onClick={quitarAcceso}
              className="rounded-lg border border-red-400 px-3 py-1 text-xs font-semibold text-red-500"
            >
              Quitar acceso
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function GestionAdministradores() {
  const [administradores, setAdministradores] = useState<AdminUserConMunicipio[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [admins, munis] = await Promise.all([listarAdministradores(), listarMunicipiosAdmin()]);
      setAdministradores(admins);
      setMunicipios(munis);
    } catch (err) {
      setError(mensajeDeError(err, 'Error cargando administradores'));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-1 text-lg font-semibold text-gray-800">Administradores</h2>
      <p className="mb-4 text-sm text-gray-500">
        Busca por email a alguien ya registrado en la app para darlo de alta como admin. Sin municipio es admin
        general (acceso total); con municipio, admin de ese municipio. Solo visible para super-administradores.
      </p>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <BuscadorAdmin municipios={municipios} onAlta={cargar} />

      <div className="mt-4 flex flex-col gap-2">
        {cargando ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : (
          administradores.map((admin) => (
            <FilaAdmin key={admin.id} admin={admin} municipios={municipios} onCambio={cargar} />
          ))
        )}
      </div>
    </div>
  );
}
